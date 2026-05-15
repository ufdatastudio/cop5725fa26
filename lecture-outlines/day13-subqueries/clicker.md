---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day13 Subqueries — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day13 Subqueries

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

```sql
SELECT name,
       (SELECT salary FROM faculty WHERE dname = s.dname) AS dept_salary
FROM   student s;
```

What happens when a department has more than one faculty member?

A. The query returns one row per student with one faculty salary each
B. The query returns one row per (student, faculty) pair
C. The query errors out with "more than one row returned"
D. The query returns the average salary

<!--
Answer: C. A scalar subquery (one used as a value) must return exactly one row. If the subquery returns multiple rows, PostgreSQL raises an error at runtime. The fix is to aggregate (avg, max) or use a join.
-->

---

# Clicker Check — Answer

**C. The query errors out: `more than one row returned by a subquery used as an expression`.**

A scalar subquery must return **exactly one row, one column**.

If you want the value when multiple matches exist, aggregate:

```sql
SELECT name,
       (SELECT avg(salary) FROM faculty WHERE dname = s.dname) AS dept_avg_salary
FROM   student s;
```

Or restructure into a join. This is the trap that makes scalar subqueries dangerous when the inner relation has more rows than you expected — code that "worked" with one row per department breaks the moment a department hires a second faculty member.
