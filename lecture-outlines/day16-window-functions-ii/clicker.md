---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day16 Window Functions Ii — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day16 Window Functions Ii

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

```sql
SELECT name, salary,
       last_value(salary) OVER (
         PARTITION BY dname
         ORDER BY salary DESC
       ) AS top
FROM faculty;
```

What does `top` return for any given row?

A. The highest salary in the department
B. The lowest salary in the department
C. The current row's salary
D. The next row's salary

<!--
Answer: C. With ORDER BY but no explicit frame, the default frame is UNBOUNDED PRECEDING ... CURRENT ROW. So last_value() returns the current row's salary, not the partition's last salary.
-->

---

# Clicker Check — Answer

**C. The current row's salary.**

With `ORDER BY` and no explicit frame, the default frame is `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`. The "last" row of *that frame* is the current row.

This is one of the most surprising default-frame behaviors in SQL. The fix:

```sql
last_value(salary) OVER (
  PARTITION BY dname
  ORDER BY salary DESC
  ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
) AS top
```

Or just use `first_value(salary)` with `ORDER BY salary DESC` — the smallest "first" of a descending order is the largest value.
