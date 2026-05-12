---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day34 Optimization Ii — Instructor Only'
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
## Day34 Optimization Ii

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A query has 4 chained predicates. Each predicate's estimated selectivity is off by 2× (in either direction, independently). The compounded estimate error can reach:

A. 2×
B. 4×
C. 16×
D. 256×

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. 2^4 = 16. Each predicate independently miscost by 2x; compounded multiplicatively gives 16x. Real systems see worse than this because predicates often correlate.
-->

---

# 📊 Clicker Check — Answer

**C. 16×.**

Four independent 2× errors compound multiplicatively: $2^4 = 16$.

In practice it's often worse because predicates **correlate** (the independence assumption breaks):
- Customers in California also tend to use ZIP codes starting with 9
- High GPA correlates with major (some majors easier than others)
- Most users come from one country

The optimizer assumes independence; the data doesn't.
Real-world cardinality errors of **100-1000×** are common.

This is what Leis 2015 measured systematically.

---

# 📊 Clicker Check

According to Leis 2015, fixing which of the following recovers the most performance lost to bad estimates?

A. Tuning the cost model coefficients (random_page_cost, etc.)
B. Picking better join orders
C. Using vectorized execution
D. Adding more indexes

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. Leis's central finding. Join order matters more than cost model accuracy. The optimizer can be "wrong by 10x" and still pick a fast plan as long as it picks the right join shape.
-->

---

# 📊 Clicker Check — Answer

**B. Picking better join orders.**

Leis 2015's central finding: the join order accounts for ~95% of the performance variance across different optimizers.

The cost model coefficients (A) are tuned but rarely catastrophic to get wrong.

Vectorized execution (C) speeds up the **chosen plan**; it doesn't fix the plan **choice**.

More indexes (D) gives the optimizer more options but doesn't help if it picks badly.

The practical implication: when a query is slow, the first diagnosis is **join order** (and the cardinality estimates that drove it), not execution.
