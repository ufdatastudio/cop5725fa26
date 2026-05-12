---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day37 Two Phase Locking — Instructor Only'
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
## Day37 Two Phase Locking

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

T1 holds `X(A)` and wants `S(B)`. T2 holds `X(B)` and wants `S(A)`. PostgreSQL detects this within `deadlock_timeout`. What happens?

A. Both transactions abort
B. The transaction with the higher ID aborts
C. PostgreSQL picks one as victim and aborts it; the other proceeds
D. Both transactions block forever

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. PostgreSQL's deadlock detector picks one victim (cheapest to abort) and cancels it. The other transaction proceeds. The application sees an error code and is expected to retry.
-->

---

# 📊 Clicker Check — Answer

**C. PostgreSQL picks one as victim and aborts it; the other proceeds.**

The victim selection heuristic considers:
- How much work the transaction has done
- Whether the transaction has been chosen as victim recently
- Cost of rollback

The losing transaction gets:
```
ERROR: deadlock detected
```

The application **must catch this and retry** the transaction. Modern ORMs (Django, ActiveRecord, etc.) often retry automatically. Raw SQL applications need explicit retry logic.
