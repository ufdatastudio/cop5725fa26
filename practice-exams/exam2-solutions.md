---
layout: default
---

# Exam 2 Practice Packet — Solutions

Solutions for [`exam2.md`](exam2). Work the packet first; check yourself here.

---

## Problem 1 — Storage and Pages

A table has 10 million rows × 200 bytes each. Page size 8 KB = 8192 bytes. (Ignoring header overhead per the problem.)

**1. Pages occupied.** Rows per page = $\lfloor 8192 / 200 \rfloor = 40$ rows.
Pages needed = $\lceil 10{,}000{,}000 / 40 \rceil = 250{,}000$ pages.

Total table size: 250,000 × 8 KB = **~2 GB**.

**2. Pages in buffer pool.** `shared_buffers = 100 MB = 100 × 1024 KB / 8 KB per page = 12,800` pages.

So roughly **12,800 of 250,000 pages fit** — about 5% of the table.

**3. I/O cost of a full scan at 60% cache hit ratio.**

- 60% of 250,000 = 150,000 page accesses served from memory (~0 I/O cost)
- 40% of 250,000 = 100,000 page reads from disk
- **~100,000 disk page reads.**

On SSD at ~100 µs per random page or much less for sequential, that's roughly 5-10 seconds. On HDD, vastly more.

---

## Problem 2 — B+ Tree Cost

Fan-out $F = 200$, $N = 10^9$ rows.

**1. Height.** Each leaf holds ~200 entries; height satisfies $F^h \geq N$:
$$h = \lceil \log_{200} 10^9 \rceil = \lceil 3.97 \rceil = 4$$

So the tree has **4 levels** (root + 3 internal levels + leaves) — call it height 4 if leaves count, height 3 if only internal levels count. State the convention.

**2. Equality lookup, cold cache.** Read each level once: root + 2 internal + 1 leaf = **4 page reads** to find the leaf entry. Add one heap-page read to fetch the row itself = **5 total**.

**3. Range query returning 1000 rows.** Two parts:

- Descend the tree to find the first matching leaf: 4 page reads
- Walk the leaf-level linked list. 1000 rows / 200 per leaf = 5 leaves to scan: 5 more page reads
- Fetch each matching row from the heap: up to 1000 reads (could be fewer if multiple rows share a page)

**Index portion:** ~9 page reads. **Heap portion:** up to 1000 page reads. The range query's cost is dominated by the heap fetches, not the index. This is exactly why **covering indexes** matter — they let the query plan avoid the heap entirely.

---

## Problem 3 — Index Selection

| Column | Best index | Why |
|--------|-----------|-----|
| `user_id BIGINT`, equality only | **hash** (or btree) | Hash gives O(1) lookups. Btree works almost as well and adds range support if needed later. Either earns full credit. |
| `created_at TIMESTAMPTZ`, append-only 5B-row table | **BRIN** | Physical row order correlates with `created_at`. BRIN is ~1000× smaller than btree and supports range queries efficiently. |
| `tags TEXT[]`, array-contains queries | **GIN** | GIN inverts the array into a per-element posting list. `WHERE tags @> ARRAY['x']` is fast. Btree can't index array contents. |
| `email TEXT`, equality on `lower(email)` | **Expression btree** | `CREATE INDEX ON users (lower(email))`. The optimizer uses the index for `WHERE lower(email) = ?`. |
| `is_active BOOLEAN`, 99% inactive, queries want active | **Partial btree** | `CREATE INDEX ON tbl (id) WHERE is_active`. Index stores only the 1% active rows; queries hit it; updates only touch the index when the flag flips. |

---

## Problem 4 — Join Algorithm

**1. Two 10 GB tables on `user_id`, neither indexed, `work_mem = 4 MB`.**

**Hybrid hash join with many batches.** Neither side fits in 4 MB. Grace-hash partitions both, then runs per-partition hash join. Sort-merge is possible but slower for unsorted inputs.

**2. 100-row filter result joined with a 10M-row indexed table.**

**Index nested loop join.** 100 outer rows × ~4 page reads per index probe = ~400 page reads. Nothing else comes close.

**3. Two sorted streams from `... ORDER BY id` views.**

**Sort-merge join.** The input is already sorted on the join key, so the sort phase is free. The merge phase is one linear pass.

**4. 1 GB joined with 100 GB; smaller side has no index.**

**Hash join with the smaller side as build.** 1 GB still doesn't fit in default `work_mem`, so this is really a **hybrid hash** with partitioning. The 1 GB side is the build (always pick the smaller side).

---

## Problem 5 — External Sort

100 GB table, `work_mem = 256 MB`. Use $M = 256\,\text{MB} = 32{,}768$ pages and $B = 100\,\text{GB} \approx 13{,}107{,}200$ pages.

**1. Runs after Phase 1.** Each run is $M = 32{,}768$ pages (256 MB).
Number of runs: $\lceil B / M \rceil = \lceil 100{,}000 / 256 \rceil = 391$ runs.

**2. M² check.** Can we merge 391 runs in one pass?

We need one input buffer per run + one output buffer:
$$\text{max runs per merge pass} = M - 1 = 32{,}767$$

391 ≪ 32,767, so yes — **two passes suffice**.

The M² version of the check: $M^2 = (32{,}768)^2$ pages = $\approx 8\,\text{TB}$. Our 100 GB is well within that.

**3. Total I/O cost.** Two passes, each touches every byte twice:

$$\text{Cost} = 4 \cdot B = 4 \cdot 100\,\text{GB} = 400\,\text{GB of I/O}$$

(Read 100 GB and write 100 GB in Phase 1; read 100 GB and write 100 GB in Phase 2.)

---

## Problem 6 — EXPLAIN Reading

The plan:

```
Sort  (cost=4500.00..4625.00 rows=50000 width=20) (actual time=180.5..195.2 rows=12345)
  Sort Key: gpa DESC
  Sort Method: external merge  Disk: 5120kB
  ->  Seq Scan on student  (cost=0.00..100.00 rows=100000 width=20)
                            (actual time=0.5..30.4 rows=100000)
        Filter: (gpa > 3.0)
```

**1. Estimate accuracy.** Optimizer estimated 50,000; actual is 12,345.

$$\text{ratio} = \frac{50{,}000}{12{,}345} \approx 4.05$$

The estimate is **~4× too high**. Within Leis 2015's "typical" range; significant but not catastrophic.

**2. To fix the disk spill.** The `external merge  Disk: 5120kB` line means the sort spilled. Two fixes:

- **Raise `work_mem`** to at least 5 MB plus headroom. Set `work_mem = '16MB'` or higher.
- The cleaner long-term fix: **add an index on `gpa` DESC**. The planner can replace `Seq Scan + Sort` with `Index Scan` and skip the sort entirely.

**3. Time breakdown.**

- Scan: `actual time=0.5..30.4` → spent ~30 ms streaming rows
- Sort: `actual time=180.5..195.2` → first row at 180.5 ms, last at 195.2 ms. Sort can't start until the scan finishes, so the sort took roughly 195 - 30 = **165 ms**, vs the scan's 30 ms.

Sort accounts for ~85% of the total time. The fix-list above is therefore well targeted: cut the sort.

---

## Problem 7 — Cardinality Estimation

Stats: `n_distinct = 100`, MCV `{A: 0.40, B: 0.20, C: 0.10}`, total rows = 1,000,000.

MCV freq sum = 0.40 + 0.20 + 0.10 = **0.70**. Remaining mass = 0.30 distributed across 97 non-MCV distinct values, so each non-MCV value has freq:

$$\frac{0.30}{100 - 3} = \frac{0.30}{97} \approx 0.00309$$

**1. `WHERE col = 'A'`** — MCV lookup: $0.40 \times 1{,}000{,}000 = 400{,}000$ rows.

**2. `WHERE col = 'D'`** — Not in MCV: $0.00309 \times 1{,}000{,}000 \approx 3{,}092$ rows.

**3. `WHERE col IN ('A', 'C')`** — Sum of MCV frequencies: $(0.40 + 0.10) \times 1{,}000{,}000 = 500{,}000$ rows.

The MCV vector is the most accurate part of `pg_stats` — when a query matches an MCV, the estimate is essentially perfect. Errors creep in when predicates fall outside MCVs and selectivity must be guessed from `n_distinct`.

---

## Problem 8 — Selinger and Plan Space

**1. Left-deep plans for a 6-way join.**

Each left-deep plan corresponds to one ordering of the 6 base relations:

$$6! = 720 \text{ distinct left-deep plans}$$

**2. System R DP subset entries.**

System R's optimizer keeps the optimal plan for each non-empty subset of the 6 relations. Number of subsets of a 6-element set (excluding empty):

$$2^6 - 1 = 63 \text{ subsets}$$

Each subset stores the optimal plan (plus optimal plans for each "interesting order"). So **~63 entries** — far fewer than 720 (the naive plan count).

This is the classic $O(3^n)$ vs $O(n!)$ tradeoff for n-way joins. For n=6, DP wins by ~10×; for n=15, DP wins by ~10⁹×.

**3. Beyond `geqo_threshold`.**

PostgreSQL switches to **GEQO** (Genetic Query Optimizer) when the join has ≥ 12 relations (configurable via `geqo_threshold`). GEQO uses a randomized genetic algorithm — not guaranteed optimal, but tractable for n > 15.

Reference: [PostgreSQL Ch. 64 GEQO](https://www.postgresql.org/docs/current/geqo.html).

---

[back to exam](exam2) · [back to course](../index)
