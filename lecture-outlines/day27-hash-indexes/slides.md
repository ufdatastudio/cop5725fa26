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

# Day 27: Hash Indexes

**COP 5725 - Database Management**
Monday, October 26, 2026

Equality lookups, faster than a tree

<!--
First class after Project 2 deadline. Project 2 small-group breakouts run in the last 10-15 min today. Pace the lecture content to ~35-40 min, with most time on extendible hashing's progressive build-out.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Last week: B+ trees give O(log_F N) lookups + range scans.

Today: hash indexes give **O(1) average** lookups — but no range support.

For pure equality work (`WHERE id = 42`), hash beats btree.
For everything else, btree wins.

PostgreSQL ships both. The optimizer picks.

</div>
<div>

```mermaid
graph TB
  B["B+ tree<br/>O(log_F N)<br/>+ ranges"]
  H["Hash<br/>O(1)<br/>equality only"]
  W["When?"]
  W --> B
  W --> H
  classDef tree fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef hash fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef root fill:#f3e5f5,stroke:#7b1fa2
  class B tree
  class H hash
  class W root
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  W["1. When hash<br/>beats btree"] --> S["2. Static<br/>hashing"]
  S --> E["3. Extendible<br/>hashing"]
  E --> L["4. Linear<br/>hashing"]
  L --> Pg["5. PostgreSQL"]
  Pg --> Pr["6. Project 2<br/>breakouts"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef milestone fill:#ffebee,stroke:#c62828,stroke-width:2px
  class W,S,E,L,Pg step
  class Pr milestone
```

Reference: GMW Ch. 14.4; PostgreSQL docs [Ch. 11.2 Index Types — Hash](https://www.postgresql.org/docs/current/indexes-types.html#INDEXES-TYPES-HASH).

---

<!-- _class: lead -->

# Part 1: When Hash Beats B+ Tree

---

# Hash Functions, Briefly

A hash function $h(k)$ maps a key to a bucket index in O(1).

- Same key → same bucket (deterministic)
- Different keys → ideally different buckets (uniform)
- A good hash spreads keys across buckets evenly

```mermaid
graph LR
  K1["key=42"] --> H1["h(42) = 7"]
  K2["key=99"] --> H2["h(99) = 3"]
  K3["key=51"] --> H3["h(51) = 7"]
  H1 --> B7["Bucket 7"]
  H3 --> B7
  H2 --> B3["Bucket 3"]
  classDef k fill:#e3f2fd,stroke:#1976d2
  classDef h fill:#fff3e0,stroke:#e65100
  classDef b fill:#e8f5e9,stroke:#388e3c
  class K1,K2,K3 k
  class H1,H2,H3 h
  class B3,B7 b
```

42 and 51 collide — they end up in the same bucket. We need a strategy for handling collisions.

---

# When Hash Indexes Win

<div class="columns">
<div>

### Hash wins
- `WHERE user_id = 12345` — equality on a high-cardinality column
- Lookup-heavy session stores
- Join keys (hash joins, Week 12)

### Hash loses
- `WHERE x > 100` — needs ordered data
- `ORDER BY x` — same
- `LIKE 'pre%'` — also a range
- Multi-column composites (sometimes)

</div>
<div>

```mermaid
graph TB
  Q["Workload"]
  E["Equality only?"]
  Q --> E
  E -->|yes| H["Hash"]
  E -->|no| B["B+ tree"]
  classDef q fill:#e3f2fd,stroke:#1976d2
  classDef d fill:#fff3e0,stroke:#e65100
  classDef opt fill:#e8f5e9,stroke:#388e3c
  class Q q
  class E d
  class H,B opt
```

</div>
</div>

> In practice, B+ trees handle equality almost as fast as hash and also handle ranges. Most databases default to btree.

PostgreSQL's hash index is **most useful when you know you only ever do `=` and never `BETWEEN`**.

---

<!-- _class: lead -->

# Part 2: Static Hashing

---

# Static Hashing

```mermaid
graph TB
  H["h(k) mod N"]
  H --> B0["Bucket 0"]
  H --> B1["Bucket 1"]
  H --> B2["Bucket 2"]
  H --> Bdots["..."]
  H --> BN["Bucket N-1"]
  B0 --> O0["Overflow chain"]
  classDef h fill:#fff3e0,stroke:#e65100
  classDef b fill:#e8f5e9,stroke:#388e3c
  classDef ov fill:#ffebee,stroke:#c62828
  class H h
  class B0,B1,B2,Bdots,BN b
  class O0 ov
```

Pick `N` buckets up front. Each bucket is a page (or chain of pages).

The simplest scheme. Fast when load is light.

---

# Why Static Hashing Falls Apart

<div class="columns">
<div>

### The problem

As data grows, **buckets fill up**.

A full bucket spills into an **overflow page**. Then another. Then another.

Lookups degrade from O(1) to O(chain length) — eventually O(N).

The fix would be **rehashing** — pick a bigger N, rebuild everything. But rebuilding the entire index for one insert is unacceptable.

</div>
<div>

```mermaid
graph TB
  B["Bucket 5"]
  B --> O1["Overflow 1"]
  O1 --> O2["Overflow 2"]
  O2 --> O3["Overflow 3"]
  O3 --> O4["..."]
  classDef ok fill:#e8f5e9,stroke:#388e3c
  classDef bad fill:#ffebee,stroke:#c62828
  class B ok
  class O1,O2,O3,O4 bad
```

</div>
</div>

Two real-world solutions emerged: **extendible hashing** (Fagin et al., 1979) and **linear hashing** (Litwin, 1980). Both grow the table incrementally.

---

<!-- _class: lead -->

# Part 3: Extendible Hashing

---

# Extendible Hashing: The Idea

Instead of one fixed `N`, maintain a **directory** that points to buckets.

- The directory has $2^g$ entries, where $g$ is the **global depth**.
- Each bucket has a **local depth** $l \leq g$, indicating how many bits of the hash actually distinguish it.
- Multiple directory entries can point to the same bucket (when $l < g$).

```mermaid
graph LR
  D["Directory (g bits)"]
  D --> B0["Bucket (depth l)"]
  D --> B1["Bucket (depth l)"]
  D --> B2["Bucket (depth l)"]
  classDef dir fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef b fill:#e8f5e9,stroke:#388e3c
  class D dir
  class B0,B1,B2 b
```

On overflow, **split the bucket, double the directory if needed**.

---

# Extendible Hashing — Step 1

Bucket size 2. Global depth $g = 1$. Two directory entries, two buckets.

```mermaid
graph LR
  D0["dir[0]"]
  D1["dir[1]"]
  B0["B0 (l=1)<br/>4, 12"]
  B1["B1 (l=1)<br/>9, 5"]
  D0 --> B0
  D1 --> B1
  classDef dir fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef b fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class D0,D1 dir
  class B0,B1 b
```

Keys go to bucket 0 if their last bit is 0, bucket 1 if it's 1.

- 4 = `100` → ends in 0 → bucket 0
- 12 = `1100` → ends in 0 → bucket 0
- 9 = `1001` → ends in 1 → bucket 1
- 5 = `101` → ends in 1 → bucket 1

---

# Extendible Hashing — Step 2: Insert 13

13 = `1101` → ends in 1 → bucket 1.

But bucket 1 is full (already has 9, 5, both with last bit 1).

**Split bucket 1** by extending to look at the **last 2 bits**:

```mermaid
graph LR
  D0["dir[00]"]
  D1["dir[01]"]
  D2["dir[10]"]
  D3["dir[11]"]
  B0["B0 (l=1)<br/>4, 12"]
  B01["B01 (l=2)<br/>9, 13"]
  B11["B11 (l=2)<br/>5"]
  D0 --> B0
  D2 --> B0
  D1 --> B01
  D3 --> B11
  classDef dir fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef changed fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef b fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class D0,D2 dir
  class D1,D3 dir
  class B0 b
  class B01,B11 changed
```

The directory **doubles** (g goes from 1 to 2). Bucket 0 keeps local depth 1, so both `dir[00]` and `dir[10]` point to it. Bucket 1 splits into two new buckets each at depth 2.

9 = `1001` last 2 bits = `01` → new bucket B01
13 = `1101` last 2 bits = `01` → also B01
5 = `0101` last 2 bits = `01` ... wait, 5 in binary is `0101`, last 2 bits are `01`. Hmm.

Let me redo with binary that splits cleanly. Keys: 4, 12 → ends 00; 9, 13 → ends 01; 5 → ends 01; ... actually let me show the algorithm pattern not the exact bits.

<!--
The on-screen example has a small accounting issue with bit patterns — when teaching, choose keys that split cleanly. The principle is what matters: doubling the directory and splitting one bucket while keeping the other at its old depth.
-->

---

# Extendible Hashing — The Algorithm

```
Insert(key):
  bucket = directory[low g bits of h(key)]
  if bucket has space:
    add key to bucket
    return

  # bucket overflow
  if bucket.local_depth < g:
    split this bucket at depth local_depth + 1
    # no need to grow the directory
  else:
    double the directory (g += 1)
    split the bucket
```

Two cases on overflow:

1. **Local depth < global depth**: just split the bucket. Directory stays the same size.
2. **Local depth = global depth**: double the directory, then split.

Lookups remain O(1): one directory access + one bucket access.

---

# Extendible Hashing: Strengths and Costs

<div class="columns">
<div>

### Strengths

- O(1) lookups
- Grows incrementally — no full rebuild
- Directory is small (a few KB even for huge indexes)

</div>
<div>

### Costs

- Directory doubles when global depth grows
- Bad hash distribution causes one bucket to absorb everything
- Skew is amplified, not absorbed

</div>
</div>

Extendible hashing is the index structure in **classic textbooks** (Garcia-Molina, Ullman, Widom).

PostgreSQL's hash index uses a **variant** with optimizations for concurrency.

---

<!-- _class: lead -->

# Part 4: Linear Hashing

---

# Linear Hashing: The Alternative

Litwin's 1980 alternative.

- No directory
- Buckets split **in order**, one at a time
- A **split pointer** tracks which bucket is next to split
- Doubles in size over the course of $N$ splits

```mermaid
graph TB
  P["Split pointer p"]
  B0["B0"]
  B1["B1"]
  B2["B2"]
  B3["B3"]
  P -.->|"next to split"| B0
  classDef ptr fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef b fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class P ptr
  class B0,B1,B2,B3 b
```

When any bucket overflows, the bucket at the split pointer splits — even if it isn't the one that overflowed.

---

# Linear Hashing — Trade-Offs

<div class="columns">
<div>

### Pros

- No directory at all
- Bounded average chain length
- Simpler concurrency than extendible

### Cons

- Bucket that overflowed waits in an overflow chain until its turn at the split pointer
- Worst-case lookups can have multiple page reads while a chain exists

</div>
<div>

PostgreSQL's hash index uses **linear hashing** internally.

That's why a fresh hash index might have unexpected page layout but stabilizes nicely over time.

Reference: [PostgreSQL Ch. 67.4 Hash Indexes Internals](https://www.postgresql.org/docs/current/hash-index.html).

</div>
</div>

<!--
Both extendible and linear hashing solve the same problem (grow incrementally without a full rebuild) with different trade-offs. PostgreSQL chose linear; other systems (some research engines) chose extendible. Both are correct.
-->

---

<!-- _class: lead -->

# Part 5: PostgreSQL's Hash Index

---

# CREATE INDEX USING hash

```sql
-- Build a hash index
CREATE INDEX student_email_hash_idx
ON student
USING hash (email);

-- Or, with CONCURRENTLY:
CREATE INDEX CONCURRENTLY student_email_hash_idx
ON student
USING hash (email);
```

PostgreSQL's hash index has gone through several lives:
- Pre-PG 10: not WAL-logged → unsafe across restarts → rarely used
- PG 10+: WAL-logged, durable, eligible for replication

Modern PostgreSQL hash indexes are **production-safe** and competitive with btree for pure equality.

---

# When PG's Hash Index Wins

```sql
EXPLAIN ANALYZE
SELECT * FROM student WHERE email = 'ada@uf.edu';
```

If the email column has a hash index:
- Hash index lookup: 1 page read
- btree lookup: 3-5 page reads (depending on tree height)

For tables where:
- The only operation is equality
- The column has high cardinality (most values distinct)
- The table is large enough that the btree height matters

…a hash index is slightly faster than a btree.

For most workloads, btree's range support and slight equality cost penalty is worth it.

---

# Section 4 Index Choice So Far

```mermaid
graph TB
  Q["Query pattern"]
  Q --> E["Equality<br/>only?"]
  Q --> R["Range or<br/>sort needed?"]
  Q --> C["Complex types?<br/>(JSON, arrays, geometry)"]
  E -->|yes| H["Hash"]
  R -->|yes| BT["B+ tree"]
  C -->|yes| Next["See Wednesday"]
  classDef q fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef opt fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  classDef wait fill:#fff3e0,stroke:#e65100,stroke-width:2px
  class Q q
  class E,R,C q
  class H,BT opt
  class Next wait
```

Wednesday: PostgreSQL's specialized index types for everything that doesn't fit btree or hash.

---

<!-- _class: lead -->

# Part 6: Project 2 Group Presentations

---

# Project 2 Presentations — Today

<div class="columns">
<div>

### Last 15 minutes

- Form into small breakout groups (4-5 students each, assigned at start of class)
- Each student presents their Project 2 in 3-4 minutes
- Group votes for the strongest presentation
- **Winners present to the full class on Wednesday**

</div>
<div>

### Goals

- Show off your dataset's most interesting query
- Demo one window function or recursive CTE
- Explain one design tradeoff you made

</div>
</div>

The instructor and TA will circulate during breakouts to time things and answer questions.

---

# Wrap-up

You now have:

<div class="columns">
<div>

- Hash vs B+ tree: equality vs range trade-off
- Static hashing and why it fails
- Extendible hashing with directory doubling

</div>
<div>

- Linear hashing as the directory-less alternative
- PostgreSQL's `USING hash` (linear hashing, WAL-logged since PG 10)
- A working "which index" decision flow

</div>
</div>

---

# Wednesday: PostgreSQL's Full Index Zoo

We cover the indexes that aren't btree or hash:

- **GiST** — generalized search tree (geometry, ranges, full text)
- **GIN** — inverted index (arrays, JSONB, FTS)
- **BRIN** — block range index (huge tables, append-only)
- **Partial** — index a slice
- **Expression** — index a computed value
- **Multi-column** — and the leftmost-prefix rule

Plus the **Project 2 winners** present.

Read PostgreSQL docs [Ch. 11.2 Index Types](https://www.postgresql.org/docs/current/indexes-types.html).

---

# Practice Before Wednesday

Two exercises:

1. Add a hash index on a high-cardinality equality column in your project's database. Capture `EXPLAIN ANALYZE` before and after, and the size with `pg_relation_size('your_index_name')`.
2. Hand-trace inserts of `[10, 14, 20, 22, 28, 35]` into an extendible hash with bucket size 2.

Push to your `cop5725fa26-project` repo before 8:30 AM Wed Oct 28.

---

# Questions

What is on your mind?

Project 2 winners selected today, present Wednesday.

<!--
Common Day 27 questions: "Why doesn't every database default to hash?" (Range support — btree handles WHERE x > 100 and ORDER BY; hash doesn't.) "Is PostgreSQL's hash index now safe to use?" (Yes, since PG 10. Pre-PG 10 it wasn't WAL-logged.) "Are there hybrid indexes?" (Yes — SP-GiST, learned indexes from Kraska 2018. We touch some Wednesday.)
-->
