---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day9 Normalization — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day9 Normalization

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Table $R(cid, course\_title, instructor, dept)$, PK = `cid`, with FDs $\{cid \rightarrow course\_title, cid \rightarrow instructor, cid \rightarrow dept, instructor \rightarrow dept\}$. What normal form is $R$ in?

A. 1NF only
B. 2NF only
C. 3NF
D. BCNF

<!--
Answer: B. 1NF and 2NF both satisfied (PK is single-attribute, so partial dependency cannot occur). But instructor → dept is a non-key determinant — that's a transitive dependency violating 3NF. So R is in 2NF only.
-->

---

# Clicker Check — Answer

**B. 2NF only.**

Walk through the forms:
- **1NF:** all values atomic — yes
- **2NF:** no partial dependency on a composite PK — vacuously true (PK is single-attribute)
- **3NF:** no transitive dependency — **violated**. `instructor → dept` is a transitive dependency: cid → instructor → dept.

To reach 3NF, decompose:
- `course(cid, title, instructor)`
- `instructor_dept(instructor, dept)`

Now no non-key attribute determines another non-key attribute.
