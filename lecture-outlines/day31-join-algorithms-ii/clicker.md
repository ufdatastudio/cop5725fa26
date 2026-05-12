---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day31 Join Algorithms Ii — Instructor Only'
math: katex
html: true
style: |
  footer { font-size: 0.6em; }
  section.lead h1 { text-align: center; }
  table { font-size: 0.85em; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
---

<!-- _class: lead -->

# Clicker Checks
## Day31 Join Algorithms Ii

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

Your join has $B_R = 100$ MB, $B_S = 50$ GB, $M = 500$ MB. The build side (smaller) does not fit in memory. Which algorithm is right?

A. Hash join (build side R fits in 500 MB? Almost, but not quite)
B. Grace hash join
C. Block nested loop
D. Index nested loop with an index on S

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. R is 100 MB but we also need overhead for buckets, hash structure, output buffer, etc. — typically need 2-3× the build size in memory. 500 MB is too tight. Grace hash partitions both relations and runs per-partition hash. D could work if the index exists, but the question implies we don't necessarily have one.
-->

---

# 📊 Clicker Check — Answer

**B. Grace hash join.**

Even though $B_R$ (100 MB) is smaller than $M$ (500 MB), the in-memory hash table needs **3-5× the raw data size** for headers, pointers, and avoiding hash collisions.

Grace hash:
1. Partitions both relations using the same hash function
2. Each partition pair is sized to fit comfortably in memory
3. Per-partition hash join then runs

Cost: $3 \cdot (100 \text{ MB} + 50 \text{ GB}) \approx 150 \text{ GB}$ I/O.

If we had the right index on S, index NL might win — but that requires the index. Grace hash is the safe default when neither side fits.

---

# 📊 Clicker Check

Your query joins two 10 GB tables on `user_id`. Neither has an index on `user_id`. `work_mem = 256 MB`. The planner most likely picks:

A. Block nested loop
B. Sort-merge join
C. Hash join (in-memory)
D. Hybrid hash join

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: D. 10 GB doesn't fit in 256 MB work_mem, so pure hash fails. The planner will use hybrid hash with batches. Sort-merge could also be picked but is usually slower than hybrid hash for unsorted input. Block NL would be hopeless at this scale.
-->

---

# 📊 Clicker Check — Answer

**D. Hybrid hash join.**

The smaller side (still 10 GB) doesn't fit in 256 MB `work_mem`, so pure hash join (C) is out. The planner picks hybrid hash:

- Partitions both relations on the hash of `user_id`
- Keeps batch 0 in memory
- Spills remaining batches to disk

The `EXPLAIN` output will show `Batches: > 1` and `Memory Usage: ~256MB`.

Sort-merge (B) is possible but typically slower for unsorted input — the sort itself costs more than the partition step. Block NL (A) at this scale is on the order of hours, not minutes.
