---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day30 Join Algorithms I — Instructor Only'
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
## Day30 Join Algorithms I

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

Block nested loop join, $B_R = 200$, $B_S = 10{,}000$, $M = 22$. Cost in page reads:

A. 200 + 10,000 = 10,200
B. 200 + 10 × 10,000 = 100,200
C. 200 + 200 × 10,000 = 2,000,200
D. 200 × 10,000 = 2,000,000

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. 20 pages for the outer chunk (M-2). ceil(200/20) = 10 chunks. Each chunk costs B_S = 10000 reads on S, plus the 200 reads of R once. 200 + 10×10000 = 100,200.
-->

---

# 📊 Clicker Check — Answer

**B. 100,200.**

- Outer chunk size: $M - 2 = 20$ pages
- Number of chunks: $\lceil 200 / 20 \rceil = 10$
- Per-chunk S scan: $B_S = 10{,}000$ pages
- Total: $B_R + \text{chunks} \times B_S = 200 + 10 \cdot 10{,}000 = 100{,}200$

Block nested loop's formula:

$$B_R + \lceil B_R / (M-2) \rceil \cdot B_S$$

The outer relation is read **once**; the inner is read once **per chunk of the outer**.

---

# 📊 Clicker Check

For a 10-row outer joined against a 10-million-row indexed inner, which join wins?

A. Block nested loop
B. Index nested loop
C. Hash join
D. Sort-merge join

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. With only 10 outer tuples and an index on the inner join key, INL does ~10 index walks (50 page reads). Hash and sort-merge each pay O(B_R + B_S) which is 10M+ reads. Block NL chunks the outer (which is tiny) and still has to scan 10M inner pages.
-->

---

# 📊 Clicker Check — Answer

**B. Index nested loop.**

- 10 outer tuples × (3 index reads + 1 heap read) = ~40 page reads
- Block NL: scans the entire inner = 10M+ page reads
- Hash join: builds a hash on inner = 10M+ page reads
- Sort-merge: sorts the inner = even more

Index NL is the **only** algorithm whose cost scales with $|R|$ rather than $B_S$.

This is why a query like `WHERE id = 42 JOIN ... ON id_col` is so fast: $|R| = 1$, and the join becomes one index lookup.
