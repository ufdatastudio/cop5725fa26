---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day5 Relational Algebra Ii — Instructor Only'
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
## Day5 Relational Algebra Ii

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

`student LEFT JOIN enrollment` produces a row for every student. What value appears in the `course` column for a student with no enrollments?

A. The empty string `''`
B. `NULL`
C. The student is excluded from the result
D. 0

<!--
Answer: B. LEFT OUTER JOIN keeps every left-side row; columns from the right side are NULL when there's no match. This is the defining property of an outer join.
-->

---

# Clicker Check — Answer

**B. `NULL`.**

The defining property of LEFT OUTER JOIN: keep every row from the left side, regardless of whether a match exists on the right. The right-side columns become **NULL** for unmatched left rows.

This is how you find what's *missing*: `LEFT JOIN ... WHERE right_col IS NULL`.

If the student were excluded (option C), the result would be an INNER JOIN, not a LEFT JOIN.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Which English phrase is the giveaway that you might need **division** in your query?

A. "How many..."
B. "Either / or..."
C. "All / every / each..."
D. "More than..."

<!--
Answer: C. Division answers questions of the form "find X that match every Y." Universal quantification — "all", "every", "each" — is the English signal. count is for A. union/or for B. comparison for D.
-->

---

# Clicker Check — Answer

**C. "All / every / each..."**

Division is the algebra operator for **universal quantification**:

- "Suppliers who supply **every** part"
- "Students who took **all** required courses"
- "Customers who bought **each** product in a category"

In SQL, you spell it out with `GROUP BY ... HAVING count(*) = (SELECT count(*) FROM required)` or the double `NOT EXISTS` form.

A is count. B is union or intersection. D is selection.
