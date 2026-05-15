---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day10 Sql Ddl Select — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day10 Sql Ddl Select

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Given a table with `gpa numeric(3, 2) CHECK (gpa BETWEEN 0 AND 4.0)`, which of these inserts succeeds?

A. `INSERT INTO student VALUES (1, 'Ada', NULL)`
B. `INSERT INTO student VALUES (2, 'Bob', 5.0)`
C. `INSERT INTO student VALUES (3, 'Chia', -0.5)`
D. `INSERT INTO student VALUES (4, 'Dev', 'A+')`

<!--
Answer: A. CHECK constraints don't reject NULL by default — only IS NULL — IS NOT NULL applies. B violates the > 4.0 boundary. C is negative. D is a type mismatch (string into numeric).
-->

---

# Clicker Check — Answer

**A. Ada with NULL gpa succeeds.**

A surprising fact about `CHECK` constraints: they reject only rows where the predicate evaluates to **FALSE**. NULL produces UNKNOWN, which `CHECK` treats as passing.

To prevent NULL: add `NOT NULL` to the column.

```sql
gpa numeric(3, 2) NOT NULL CHECK (gpa BETWEEN 0 AND 4.0)
```

B and C violate the CHECK; D is a type error from PostgreSQL before the constraint even runs.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

```sql
SELECT name FROM student LIMIT 20 OFFSET 20;
```

What does this query return?

A. The 21st through 40th students alphabetically
B. The 21st through 40th students in some unspecified order
C. An error — needs ORDER BY
D. Always the same 20 rows

<!--
Answer: B. Without ORDER BY, the "second page" depends on the executor's row order, which can change between runs. Pagination without ORDER BY is the most common SQL bug. The query is legal but meaningless.
-->

---

# Clicker Check — Answer

**B. The 21st through 40th students in some unspecified order.**

The query is **legal** but **meaningless**. Without `ORDER BY`, the row order is whatever the executor chose — index scan, sequential scan, even parallel workers' interleaving.

The "second page" could be different rows on every run. It could be the same rows in a different order. The optimizer is allowed to pick any plan.

The fix is always: `ORDER BY some_stable_column` before `LIMIT/OFFSET`. For pagination, the order key should be deterministic across runs.
