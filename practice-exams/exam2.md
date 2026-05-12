---
layout: default
---

# Exam 2 Practice Packet

**Coverage:** Sections 4-5 (storage, indexing, sorting, query processing, optimization).
**Released:** Friday, November 13, 2026.
**Exam:** Wednesday, November 18, 2026, 8:30-9:20 AM in class.

Work this packet without looking at solutions. Solutions live in [`exam2-solutions.md`](exam2-solutions.md) so you can check yourself.

> Format and difficulty match the real exam. Problems are not identical.

---

## Problem 1 — Storage and Pages

A table has 10 million rows, each 200 bytes. PostgreSQL pages are 8 KB. Assume no tuple header overhead.

1. How many pages does the table occupy?
2. With `shared_buffers = 100 MB`, how many pages can fit in the buffer pool?
3. The cache hit ratio on this table is 60%. Estimate the I/O cost of a full scan.

---

## Problem 2 — B+ Tree Cost

A B+ tree has fan-out 200 and indexes 1 billion rows.

1. What is the height?
2. For an equality lookup, how many page reads (assuming nothing is cached)?
3. For a range query returning 1000 rows, how many page reads?

---

## Problem 3 — Index Selection

For each column, name the best PostgreSQL index type and justify in one sentence:

1. `user_id BIGINT` on a 100M-row `events` table — only equality lookups
2. `created_at TIMESTAMPTZ` on a 5B-row append-only table
3. `tags TEXT[]` on a 1M-row `posts` table with array-contains queries
4. `email TEXT` on a 100K-row `users` table with `lower(email)` lookups
5. `is_active BOOLEAN` on a 100M-row table where 99% are inactive

---

## Problem 4 — Join Algorithm

For each scenario, name the join algorithm PostgreSQL will most likely pick and explain why:

1. Joining two 10 GB tables on `user_id`, neither indexed, `work_mem = 4 MB`
2. Joining a 100-row filter result with a 10M-row table indexed on the join key
3. Joining two sorted streams from a `... ORDER BY id` view
4. Joining a 1 GB table with a 100 GB table; smaller side has no index

---

## Problem 5 — External Sort

A query sorts a 100 GB table with `work_mem = 256 MB`.

1. After Phase 1 (sort runs), how many runs are on disk?
2. Can the entire sort complete in two passes (one sort, one merge)? Show the M² check.
3. What is the total I/O cost in GB?

---

## Problem 6 — EXPLAIN Reading

Given this plan:

```
Sort  (cost=4500.00..4625.00 rows=50000 width=20) (actual time=180.5..195.2 rows=12345)
  Sort Key: gpa DESC
  Sort Method: external merge  Disk: 5120kB
  ->  Seq Scan on student  (cost=0.00..100.00 rows=100000 width=20) (actual time=0.5..30.4 rows=100000)
        Filter: (gpa > 3.0)
```

Answer:

1. The optimizer estimated 50,000 rows after the filter. Actual is 12,345. How off is the estimate?
2. The sort spilled to disk (`external merge`). What setting would you adjust to fix this?
3. The plan ran in ~195 ms total. What fraction was the sort vs the scan?

---

## Problem 7 — Cardinality Estimation

A table has these statistics (`pg_stats`):

- `n_distinct = 100`
- `most_common_vals = {A, B, C}`
- `most_common_freqs = {0.40, 0.20, 0.10}`
- Total rows: 1,000,000

Estimate the row count for:

1. `WHERE col = 'A'`
2. `WHERE col = 'D'` (not in MCV)
3. `WHERE col IN ('A', 'C')`

---

## Problem 8 — Selinger and Plan Space

For a 6-relation join (R1, R2, R3, R4, R5, R6):

1. How many distinct **left-deep** plans are there?
2. The System R optimizer evaluates how many subset entries (approximately)?
3. Beyond `geqo_threshold` relations, what does PostgreSQL do?

---

## Logistics

- Bring a pen.
- No notes, no laptops, no phones.
- 50 minutes. Pacing target: 5-7 minutes per problem.
- Partial credit awarded generously for clearly-written work.

Good luck.

[back](../index)
