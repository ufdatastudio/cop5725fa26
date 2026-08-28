# Week 11: Hash Indexes, PostgreSQL Index Types, External Sorting

## Overview

Week 11 closes Section 4.
Monday introduces hash indexes (the other major index family) while running Project 2 small-group presentations.
Wednesday surveys PostgreSQL's full index zoo and runs the Project 2 winners-to-class round.
Friday covers external sorting and closes Section 4.

**Learning Objectives:**

- Distinguish hash indexes from B+ trees and pick the right one for a workload
- Trace static, extendible, and linear hashing on small examples
- Apply PostgreSQL's specialized index types: GiST, GIN, BRIN, partial, expression, multi-column
- Implement the two-phase external sort algorithm and reason about its I/O cost
- Configure PostgreSQL's `work_mem` and recognize when a query spills to disk

---

## Day 27 (Monday, October 26): Hash Indexes

### Topics (40 min lecture + 10 min Project 2 group presentations)

**1. When Hash Beats B+ Tree (5 min)**
- Equality lookups, not range scans
- O(1) average case vs O(log_F N)
- The catch: no order

**2. Static Hashing (8 min)**
- The basic table + buckets + overflow chains
- Where it falls over (overflow at scale)

**3. Extendible Hashing (15 min)**
- Global vs local depth
- Directory + buckets
- Split with directory doubling — progressive build-out

**4. Linear Hashing (7 min)**
- Splitting one bucket at a time, in order
- Round counter and split pointer

**5. PostgreSQL Hash Index (5 min)**
- `CREATE INDEX ... USING hash`
- When the planner picks it
- WAL-logged since PG 10

### Action Items
- Read Textbook Ch. 14.4
- Project 2 presentations Monday and Wednesday in class

---

## Day 28 (Wednesday, October 28): PostgreSQL Index Types

### Topics (40 min lecture + 10 min Project 2 winners present)

**1. The Index Landscape (5 min)**
- btree, hash, GiST, GIN, BRIN, SP-GiST
- Where each wins

**2. GiST — Generalized Search Tree (10 min)**
- Geometric data, range types, full-text search
- The framework idea: pluggable operators

**3. GIN — Inverted Index (10 min)**
- Arrays, JSONB, full-text search
- When GIN crushes btree

**4. BRIN — Block Range Index (8 min)**
- Tiny indexes for big tables
- Time-series and append-only workloads

**5. Partial and Expression Indexes (7 min)**
- Indexing a slice of the table
- Indexing a computed expression
- Multi-column indexes and the leftmost-prefix rule

### Action Items
- Read PostgreSQL docs [Ch. 11.2 Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- Project 2 winners present in class

---

## Day 29 (Friday, October 30): External Sorting

### Topics (50 min)

**1. Why External Sorting (5 min)**
- The data does not fit in memory
- Sort is the engine behind GROUP BY, ORDER BY, sort-merge join, and bulk-load

**2. Two-Phase Sort (15 min)**
- Phase 1: sort runs of M pages
- Phase 2: multi-way merge

**3. Multi-Way Merge Tree (10 min)**
- Merging k runs in one pass
- Heap-based priority queue
- Why "two passes" is usually enough

**4. Replacement Selection (8 min)**
- Generating runs longer than M

**5. PostgreSQL Specifics (7 min)**
- `work_mem` controls per-operator memory budget
- "External merge" disk usage shows in `EXPLAIN ANALYZE`
- Why setting `work_mem` too high is dangerous

**6. Section 4 Wrap (5 min)**
- What you can now do
- Section 5 (Query Processing) opens Monday

### Action Items
- Read Textbook Ch. 15.4
- Project 3 (Indexing + Query Plans) due Fri Nov 13

---

## Looking Ahead to Week 12

Section 5 opens. Three meetings:

- **Mon Nov 2** — Join Algorithms I (nested loop, block nested loop, index nested loop)
- **Wed Nov 4** — Join Algorithms II (sort-merge, hash, grace hash)
- **Fri Nov 6** — Iterator (Volcano) Model and Pipelining
