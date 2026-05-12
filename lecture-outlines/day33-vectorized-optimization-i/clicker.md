---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day33 Vectorized Optimization I — Instructor Only'
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
## Day33 Vectorized Optimization I

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A query scans 100 million rows and computes a SUM. Which engine architecture is fastest?

A. Pure Volcano, no JIT
B. Volcano + JIT compilation
C. Vectorized execution
D. All three are equivalent

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. Vectorized wins big on OLAP scans. JIT helps Volcano but doesn't fully close the gap. Pure Volcano is slowest. The "all equivalent" answer would only hold for tiny queries where overhead doesn't matter.
-->

---

# 📊 Clicker Check — Answer

**C. Vectorized execution.**

For an aggregation over 100 M rows:

- Pure Volcano: 100M virtual function calls × 100ns ≈ **10 seconds of overhead alone**
- Volcano + JIT: virtual dispatch eliminated, but still per-tuple ≈ **3-5 seconds**
- Vectorized: per-tuple cost ~1 ns ≈ **~100 ms**

The gap is largest for analytical workloads with simple per-tuple work. For OLTP point queries (small result sets), the three architectures are nearly identical.

DuckDB picks vectorized for exactly this reason; PostgreSQL stays Volcano-based because most of its workload is OLTP.

---

# 📊 Clicker Check

For a 5-way join, how many distinct left-deep plans are there?

A. 5
B. 25
C. 120
D. 5,000

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. 5! = 120. Left-deep means the right side is always a base table; the only choice is the order. n! grows fast — n=10 is 3.6M, n=15 is 1.3 trillion.
-->

---

# 📊 Clicker Check — Answer

**C. 120.**

5! = 5 × 4 × 3 × 2 × 1 = **120** left-deep plans.

Each plan corresponds to one ordering of the 5 base relations. The leftmost (deepest) relation becomes the first "outer" of the join chain.

For bushy plans (where both sides of any join can be subtrees), the count is much larger:

$$\frac{(2n)!}{(n+1)! \cdot n!} \text{ for } n \text{ joins of } n+1 \text{ relations}$$

For 5 relations (4 joins): 14 × 120 = 1,680 plans. Modern optimizers explore both shapes but prune aggressively.
