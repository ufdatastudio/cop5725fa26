---
marp: true
theme: default
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management - Fall 2026'
math: katex
html: true
style: |
  footer { font-size: 0.6em; }
  section.lead h1 { text-align: center; }
  .footnote { font-size: 0.6em; color: #666; position: absolute; bottom: 30px; }
  img { display: block; margin: 0 auto; }
  table { font-size: 0.85em; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .columns-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  .columns-left-wide { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
  .columns-right-wide { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
  .rows { display: grid; grid-template-rows: 1fr 1fr; gap: 1rem; }
  .small { font-size: 0.8em; }
  mark { background: #fef3c7; padding: 0 0.2em; }
  blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; color: #444; }
  .mermaid { text-align: center; }
  .interactive { background: #fff3e0; border-left: 4px solid #ff6f00; padding: 1em; border-radius: 4px; }
  .error { background: #ffebee; border-left: 4px solid #c62828; padding: 1em; border-radius: 4px; }
  .doc { background: #e3f2fd; border-left: 4px solid #1976d2; padding: 1em; border-radius: 4px; }
  .clicker { background: #fff8e1; border-left: 6px solid #f57f17; padding: 1.2em; border-radius: 4px; }
  pre code { font-size: 0.85em; }
---

<!-- _class: lead -->

# Day 24: Row Stores vs Column Stores

**COP 5725 - Database Management**
Monday, October 19, 2026

Same SQL. Two completely different layouts.

<!--
Featured paper week. Students should have read the C-Store paper over the weekend. Pace 50 min; the C-Store section is the centerpiece. Frame this as "the moment PostgreSQL and DuckDB became different species."
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

For two lectures you have read about the physical layer.
You know what a page is, what a buffer pool is, how PostgreSQL stores rows in slotted pages.

Today: the alternative.

A column store keeps **all values of one column together** rather than all values of one row.
Same data. Same SQL surface. Wildly different performance profile.

The C-Store paper (Stonebraker et al., VLDB 2005) is the argument that started the modern OLAP era.

</div>
<div>

```mermaid
graph TB
  S["Same schema"]
  S --> R["Row layout<br/>(Postgres)"]
  S --> C["Column layout<br/>(DuckDB)"]
  R --> O["OLTP wins"]
  C --> A["OLAP wins"]
  classDef base fill:#e3f2fd,stroke:#1976d2
  classDef row fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef col fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class S base
  class R,O row
  class C,A col
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  L["1. The layout<br/>question"] --> C["2. Compression"]
  C --> P["3. The C-Store<br/>paper"]
  P --> M["4. Modern<br/>heirs"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class L,C,P,M step
```

---

<!-- _class: lead -->

# Part 1: The Layout Question

---

# The Logical Schema Is Identical

```sql
CREATE TABLE sales (
  sale_id     bigint,
  customer_id bigint,
  product_id  bigint,
  amount      numeric(10,2),
  sale_date   date
);
```

Two layouts can hold the same data. SQL never tells you which.

---

# Row Layout: Tuples on a Page

```
+----------------------------------------------------------+
| Page 1                                                   |
|  +------------------------------------------------+      |
|  | row 1: sale_id, cust_id, prod_id, amount, date |      |
|  +------------------------------------------------+      |
|  | row 2: sale_id, cust_id, prod_id, amount, date |      |
|  +------------------------------------------------+      |
|  | row 3: sale_id, cust_id, prod_id, amount, date |      |
|  +------------------------------------------------+      |
|  | ...                                            |      |
|  +------------------------------------------------+      |
+----------------------------------------------------------+
```

To read one full row: one page access.
To compute `SUM(amount)` across 100 M rows: read all pages, throw away 80% of the bytes.

---

# Column Layout: Columns on Separate Pages

```
+----------------------+   +----------------------+   +----------------------+
| sale_id column       |   | amount column        |   | sale_date column     |
|  10001               |   |  100.00              |   |  2024-01-15          |
|  10002               |   |   45.50              |   |  2024-01-15          |
|  10003               |   |  220.00              |   |  2024-01-16          |
|  10004               |   |   75.25              |   |  2024-01-16          |
|  ...                 |   |  ...                 |   |  ...                 |
+----------------------+   +----------------------+   +----------------------+
```

To read one full row: assemble from many places.
To compute `SUM(amount)`: read **only the amount column**.

The 80% byte savings shows up as a 5-10× scan speedup.

<!--
"Read only the columns the query needs" is the entire column-store advantage. Wide tables with narrow queries see the biggest wins.
-->

---

# When Row Wins, When Column Wins

<div class="columns">
<div>

### Row stores win when

- Many writes / updates
- Reads pull full rows ("show me one customer's record")
- Working set fits in memory
- Workload is transactional

</div>
<div>

### Column stores win when

- Reads pull a few columns over many rows
- Aggregations and grouping dominate
- Tables are wide (50+ columns)
- Working set is enormous and compressible

</div>
</div>

The C-Store paper's central claim: **one engine cannot win both**. PostgreSQL leans row; DuckDB leans column.

---

<!-- _class: lead -->

# Part 2: Compression

---

# Why Compression Matters

A column holds values of **the same type, often with regularities**:

- `sale_date` is a date — most rows in 2024
- `payment_type` is one of {cash, credit, debit, other}
- `country` is one of ~200 values
- `quantity` is mostly small integers

Compression schemes exploit these regularities to pack columns into 10-50% of their raw size.

The win is not only disk:
- Compressed columns mean fewer cache misses
- Vectorized engines decode in-flight without materializing the original

---

# Run-Length Encoding (RLE)

```
raw:        [CA, CA, CA, CA, CA, NY, NY, NY, FL, FL, FL, FL]
encoded:    [(CA, 5), (NY, 3), (FL, 4)]
```

Great when the column is **sorted** or has long runs.

DuckDB and Vertica detect runs automatically. Sorting a column by a high-cardinality natural key destroys RLE; sorting by a low-cardinality key creates it.

This is why C-Store's design includes **multiple sort orders** for the same column — different sorts win different compressions.

---

# Dictionary Encoding

```
column:        [Texas, Florida, Texas, California, Florida, Texas]

dictionary:    { 0: 'California', 1: 'Florida', 2: 'Texas' }

encoded:       [2, 1, 2, 0, 1, 2]
```

Replace each value with its dictionary code. Especially powerful for low-cardinality columns (country, status, category).

A `text` column with 200 distinct values compresses to a `tinyint` per row plus a 200-entry dictionary.

DuckDB and Parquet both use dictionary encoding heavily.

---

# Bit-Packing

```
raw integers:   1, 3, 5, 2, 7, 4, 6, 2     (max = 7)
                each "needs" 64 bits in a bigint column
                but actually fits in 3 bits each
bit-packed:     001 011 101 010 111 100 110 010    (24 bits total)
```

If a column's values fit in fewer bits than its declared type, pack them.

Bit-packing is automatic in Parquet and DuckDB. PostgreSQL does not bit-pack normal heap tuples.

<!--
The "values fit in fewer bits" optimization is why columnar formats are so much smaller than row formats — even before fancier compression. A bigint column of values up to 1000 needs 10 bits per value, not 64.
-->

---

# Compression Speeds Up Queries

```mermaid
graph LR
  D["Disk I/O"] --> C["Compressed page"]
  C --> M["Memory"]
  M --> E["Vectorized<br/>decode + execute"]
  E --> R["Result"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class D,C,M,E,R step
```

Counter-intuitive but true: smaller pages = faster queries.

- Less I/O to load the data
- Fewer cache misses
- The CPU is the bottleneck; vectorized operators work *on compressed data*

DuckDB's vectorized executor processes RLE-encoded runs in a single SIMD instruction.

---

<!-- _class: lead -->

# Part 3: The C-Store Paper

---

# C-Store, 2005

> Stonebraker, M., Abadi, D.J., Batkin, A. et al.
> *C-Store: A Column-oriented DBMS.*
> VLDB 2005.

[Local PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/stonebraker2005.pdf)

The thesis:

- Row stores were designed for OLTP and shoehorned into OLAP
- A from-scratch column store would beat them at OLAP by 10-100×
- Different workloads need different engines (this becomes "one size fits all is dead")

C-Store the prototype became **Vertica** the company (2005), acquired by HP in 2011.

---

# C-Store's Key Ideas

```mermaid
graph TB
  CS["C-Store"]
  P["Projections<br/>(sorted column groups)"]
  W["Write store<br/>(small, row-format)"]
  R["Read store<br/>(big, column-format)"]
  C["Tuple mover<br/>(write → read)"]
  CS --> P
  CS --> W
  CS --> R
  W --> C
  C --> R
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
  classDef proc fill:#fff3e0,stroke:#e65100,stroke-width:2px
  class CS root
  class P,W,R,C proc
```

Three structural ideas that turn into the modern OLAP architecture.

---

# Projections — Multiple Sort Orders

```
sales table:
  sale_id, customer_id, product_id, amount, sale_date

projection P1 (sorted by sale_date):
  amount, customer_id    -- runs of customer_id by date

projection P2 (sorted by customer_id):
  amount, sale_date      -- runs of date per customer

projection P3 (sorted by product_id):
  amount, sale_date      -- runs of date per product
```

Each projection is a **sorted view of overlapping columns**.

Different sort orders enable different compressions and different query patterns.

The cost is duplication — multiple copies of the column data. Worth it for analytical workloads where reads dominate.

<!--
The "projection" word is unfortunately overloaded. C-Store's "projection" is closer to "materialized view sorted differently" than to relational-algebra projection. The paper's word; we use it because the modern literature does.
-->

---

# Read Store + Write Store

<div class="columns">
<div>

### Write store (WS)

- Small, row-format
- Optimized for fast inserts
- Stays in memory

### Read store (RS)

- Large, column-format
- Compressed and sorted
- Optimized for analytical scans

### Tuple mover

- Periodic batch from WS to RS
- Compresses on the way
- Background activity

</div>
<div>

```mermaid
graph LR
  App["Application"] --> WS["Write Store<br/>(row, in-RAM)"]
  WS -. "tuple mover" .-> RS["Read Store<br/>(column, on-disk)"]
  Q1["Analytical<br/>queries"] --> RS
  Q2["Recent rows<br/>queries"] --> WS
  Q2 --> RS
  classDef app fill:#e3f2fd,stroke:#1976d2
  classDef ws fill:#fff8e1,stroke:#f57f17,stroke-width:2px
  classDef rs fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class App,Q1,Q2 app
  class WS ws
  class RS rs
```

</div>
</div>

The split solves the write-vs-read tradeoff inside a single engine.

---

# What Worked, What Did Not

<div class="columns">
<div>

### Worked

- Column layout with compression
- Vectorized execution
- Specialized engines won at analytics
- The "one size fits all is dead" thesis

</div>
<div>

### Did not last

- The exact projections + tuple mover architecture
- The "write store, read store" split (modern systems use LSM-style buffers, transactional logs, or materialized views)
- C-Store as a literal product

</div>
</div>

Twenty years later, the **ideas** are everywhere; the **architecture** has evolved.

---

<!-- _class: lead -->

# Part 4: Modern Heirs

---

# The Lineage

```mermaid
graph TB
  CS["C-Store<br/>VLDB 2005"]
  CS --> V["Vertica<br/>(commercialized)"]
  CS --> P["Parquet<br/>(on-disk format)"]
  CS --> M["MonetDB / X100"]
  V --> RS["Amazon Redshift<br/>(2012, ex-ParAccel)"]
  P --> SF["Snowflake<br/>2014"]
  P --> DD["DuckDB<br/>2019"]
  P --> BQ["BigQuery<br/>2010"]
  M --> DD
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
  classDef heir fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef modern fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class CS root
  class V,P,M heir
  class RS,SF,DD,BQ modern
```

DuckDB is the most direct descendant we use in this course.

---

# Parquet, the Lingua Franca

```bash
# A 3M-row Parquet file
$ ls -lh yellow_tripdata_2024-01.parquet
-rw-r--r--  1 christan  staff   47M  yellow_tripdata_2024-01.parquet

# Read by DuckDB, Polars, pandas, Spark, BigQuery, Snowflake, Athena, …
```

Apache Parquet (2013) standardized C-Store's ideas as a **file format**.

Every modern analytical engine reads Parquet. Cross-engine analytics works because everyone speaks Parquet.

Parquet contains:
- Column groups (called **row groups**)
- Per-column statistics (min, max, null count)
- Per-column compression (dictionary, RLE, bit-packing, snappy, zstd)
- A schema definition

---

# The Hybrid Pattern

```mermaid
graph LR
  App["Application"] --> PG[("PostgreSQL<br/>OLTP")]
  PG -. "CDC / ETL" .-> Pq["Parquet on S3"]
  Pq --> DD["DuckDB"]
  Pq --> SF["Snowflake"]
  DD --> Dash["Dashboards"]
  SF --> Dash
  classDef app fill:#e3f2fd,stroke:#1976d2
  classDef oltp fill:#fff8e1,stroke:#f57f17,stroke-width:2px
  classDef olap fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class App,Dash app
  class PG oltp
  class Pq,DD,SF olap
```

The 2026 industry default:

- PostgreSQL (or another row store) handles writes and live application reads
- Change data capture ships changes to a Parquet lake on S3
- DuckDB or Snowflake or BigQuery handles analytics

Two engines, two layouts, one logical schema.

---

# Wrap-up

You now have:

<div class="columns">
<div>

- Row vs column layout, and the workloads each wins
- Three column-store compression schemes: RLE, dictionary, bit-packing
- The C-Store paper's three structural ideas

</div>
<div>

- The C-Store → Vertica → Parquet → DuckDB lineage
- The modern hybrid pattern: Postgres + Parquet + DuckDB
- A growing instinct for when to reach for which engine

</div>
</div>

---

# Wednesday: B+ Trees I

We open the indexing arc.

By the end of Wednesday you can hand-draw a B+ tree, trace a search through it, and explain why every database in this section uses one.

Read GMW Ch. 14.1-14.2 before class.

---

# Practice Before Wednesday

Two exercises:

1. Pick three columns from your project's dataset. For each, name the likely compression scheme (RLE, dictionary, bit-pack) and why.
2. Convert one of your project's tables to Parquet using DuckDB; report disk size before and after.

Push to your `cop5725fa26-project` repo before 8:30 AM Wed Oct 21.

---

# Questions

What is on your mind?

Project 2 due **this Friday** Oct 23.

<!--
Common Day 24 questions: "Are columnar engines always faster?" (No — they're slower at OLTP. Row vs column is workload-driven.) "Why doesn't PostgreSQL just become columnar?" (It can, via extensions like cstore_fdw and Citus columnar. But the core stays row-store because that's what its primary use case demands.) "Will I use both engines in my project?" (Probably — Project 2 onwards welcomes DuckDB for analytical queries on your dataset.)
-->
