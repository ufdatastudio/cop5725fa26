---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day29 External Sorting — Instructor Only'
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
## Day29 External Sorting

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A query is sorting a 10 GB table. Memory is 1 GB. Two passes (sort-then-merge) cost:

A. 10 GB total I/O
B. 20 GB total I/O
C. 40 GB total I/O
D. 100 GB total I/O

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. Phase 1: read 10, write 10 = 20. Phase 2: read 10, write 10 = 20. Total 40 GB. The "4B" rule. If memory were too small for one merge pass, it would be even worse.
-->

---

# 📊 Clicker Check — Answer

**C. 40 GB total I/O.**

Two passes, each touching every byte twice:

- Phase 1: read B (10 GB), write B (10 GB) = **20 GB**
- Phase 2: read B (10 GB), write B (10 GB) = **20 GB**
- Total: **40 GB**

This is the **4B rule** for two-pass external sort.

If memory were smaller and we needed three passes, it would be 6B. Each extra pass costs 2B more.

This is why the M² rule matters — staying in two passes is dramatically cheaper.
