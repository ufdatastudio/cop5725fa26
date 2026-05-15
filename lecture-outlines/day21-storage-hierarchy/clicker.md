---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day21 Storage Hierarchy — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day21 Storage Hierarchy

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A query is reading 100,000 rows. All else equal, on **SSD** which scenario is fastest?

A. 100,000 rows scattered across 100,000 4-KB pages
B. 100,000 rows packed into 1,000 4-KB pages, read sequentially
C. 100,000 rows from a remote PostgreSQL server in another datacenter
D. 100,000 rows in 100,000 separate files

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. Packing reduces IO count (1000 page reads instead of 100000) and sequential reads are still faster than random even on SSD. A is the worst case for IO. C adds network latency. D is the worst — each file open is expensive.
-->

---

# 📊 Clicker Check — Answer

**B. 100,000 rows packed into 1,000 4-KB pages, read sequentially.**

Two wins:

1. **Fewer page reads.** 1,000 vs 100,000 — a 100× difference in I/O count.
2. **Sequential access pattern.** Even on SSDs, sequential reads are 3-10× faster than random.

This is why every database tries to **cluster** related rows together. PostgreSQL provides the `CLUSTER` command for exactly this purpose.

---

# 📊 Clicker Check

You have a 10 GB table on SSD with no indexes. A query needs the single row with `student_id = 5`. The table is a **heap file** and your buffer pool is small. Expected I/O cost?

A. O(1) — direct lookup
B. O(log B) where B is pages on disk
C. O(B) — every page must be scanned
D. O(B²) — pairwise comparisons

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. Heap file + no index = full table scan. This is exactly why indexes exist; we add them next week. Students who pick B are thinking of sorted files or B+ trees — those aren't this scenario.
-->

---

# 📊 Clicker Check — Answer

**C. O(B) — every page must be scanned.**

A heap file has no ordering. Without an index, the database cannot know which page holds `student_id = 5`, so it must read every page.

This is why every working schema has indexes on common lookup keys. The whole next week is about how indexes turn O(B) into O(log B) — or O(1) with hash indexes.
