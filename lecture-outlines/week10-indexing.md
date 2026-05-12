# Week 10: Column Stores and B+ Trees

## Overview

Week 10 starts the indexing arc and anchors the C-Store paper.
Monday compares row and column layouts; Wednesday and Friday cover B+ trees end-to-end.
Project 2 is due Friday at 11:59 PM.

**Learning Objectives:**

- Compare row and column storage layouts; predict which wins for a given workload
- Identify column-store compression schemes (RLE, dictionary, bit-packing) and explain when each pays
- Read the C-Store paper (Stonebraker et al., VLDB 2005) and connect its claims to DuckDB's modern implementation
- Describe a B+ tree by node shape, fan-out, height, and the leaf-level linked list
- Trace a search through a B+ tree by hand
- Trace an insert with splits and a delete with merges
- Reason about cost: height as a function of fan-out, leaf accesses for a range query

---

## Day 24 (Monday, October 19): Row Stores vs Column Stores

### Topics (50 min)

**1. The Layout Question (8 min)**
- Same logical schema; two different physical layouts
- Row-store advantages (write-heavy, single-row reads)
- Column-store advantages (scan-heavy, vectorized execution)

**2. Compression in Column Stores (12 min)**
- Run-length encoding (RLE)
- Dictionary encoding
- Bit-packing
- Why compression speeds up queries (not just disk)

**3. The C-Store Paper (15 min)**
- The 2005 argument that one engine cannot do both
- "Projections" as overlapping sorted views
- Read-store vs write-store split
- What worked, what became Vertica

**4. Modern Heirs (10 min)**
- Vertica (commercialized C-Store)
- Parquet on disk
- DuckDB (CWI, 2019)
- The hybrid case: PostgreSQL row-store + analytics replica

**5. Wrap (5 min)**
- Next: B+ Trees on Wednesday
- Project 2 reminders

### Action Items
- Read Stonebraker et al. [C-Store: A Column-oriented DBMS](https://ufdatastudio.com/cop5725fa26/papers/pdfs/stonebraker2005.pdf), VLDB 2005
- Project 2 due Friday Oct 23

---

## Day 25 (Wednesday, October 21): B+ Trees I

### Topics (50 min)

**1. Why B+ Trees (8 min)**
- The disk-friendly tree
- B+ trees vs B-trees vs binary search trees
- Why the database world standardized on B+ trees

**2. Structure (12 min)**
- Internal nodes vs leaf nodes
- Fan-out and what it implies for height
- The leaf-level linked list
- PostgreSQL's btree implementation

**3. Search (15 min)**
- Algorithm: root → internal → leaf
- Range queries via leaf-level traversal
- Cost: O(log_F N) page reads

**4. Bulk Loading (10 min)**
- Why sequential insert is slow
- The bottom-up bulk-load algorithm
- PostgreSQL's `CREATE INDEX` on a populated table

**5. Wrap (5 min)**
- Insert and delete on Friday
- Project 2 due Friday

### Action Items
- Read GMW Ch. 14.1-14.2
- Practice: hand-draw a B+ tree of order 4 with keys 1-20

---

## Day 26 (Friday, October 23): B+ Trees II

### Topics (50 min)

**1. Insert (15 min)**
- Insert into a leaf with space
- Leaf split when full
- Propagating splits up
- Root split adds height

**2. Delete (10 min)**
- Delete from a leaf
- Underflow and the redistribute / merge choice
- Why most production engines treat delete laxly

**3. Cost Analysis (10 min)**
- Height: log_F N, where F is fan-out
- Why F is large in practice (page-sized nodes)
- The 99% of queries that hit 3 levels max

**4. PostgreSQL's btree (10 min)**
- `pg_stat_user_indexes` and observation
- When the optimizer ignores an index
- VACUUM and its effect on btree

**5. Project 2 Wrap (5 min)**
- Due tonight at 11:59 PM
- Presentations Monday and Wednesday

### Action Items
- Read GMW Ch. 14.2-14.3
- **Project 2 due tonight at 11:59 PM**

---

## Looking Ahead to Week 11

Three meetings finish the indexing arc:

- **Mon Oct 26** — Hash Indexes: static, extendible, linear
- **Wed Oct 28** — PostgreSQL Index Types: GiST, GIN, BRIN, partial
- **Fri Oct 30** — External Sorting (closes Section 4)
