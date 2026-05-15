---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day32 Iterator Model — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day32 Iterator Model

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

```sql
SELECT * FROM huge_table ORDER BY created_at DESC LIMIT 5;
```

`huge_table` has no index on `created_at`. The plan:

A. Reads only 5 rows of huge_table
B. Reads all of huge_table, sorts the entire thing, then takes 5
C. Reads all of huge_table but stops the sort after producing 5 outputs (via heap)
D. Reads index entries only

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. PostgreSQL uses "top-N heap sort" — keeps only the top 5 in a heap during the scan. Faster than full sort. But it still reads every row. The optimization is the sort, not the scan.
-->

---

# 📊 Clicker Check — Answer

**C. Reads all of huge_table but stops the sort after producing 5 outputs (via heap).**

PostgreSQL's planner sees `ORDER BY ... LIMIT 5` and uses a **bounded sort** (top-N heap sort): maintain a heap of size 5 during the scan; replace the worst with the latest if better.

- Scan still reads every row of huge_table (no index on created_at)
- Sort uses O(N log 5) instead of O(N log N)
- Output is just the top 5

If we **added** an index on `created_at`, the plan becomes:
```
Limit
  Index Scan Backward on huge_table_created_at_idx
```
which reads only 5 index entries plus 5 heap pages. **That** is the pipelined ideal.
