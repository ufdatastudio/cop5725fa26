---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day11 Sql Joins — Instructor Only'
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
## Day11 Sql Joins

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

```sql
SELECT s.name, e.cid
FROM   student s
LEFT JOIN enrollment e ON e.sid = s.sid
WHERE  e.cid = 'COP5725';
```

The intent is "every student, plus their COP5725 enrollment if any." What actually happens?

A. Works as intended
B. Returns only students enrolled in COP5725 (degrades to inner join)
C. Returns every student with COP5725 in every row
D. Throws an error

<!--
Answer: B. The WHERE clause filters out the NULL rows from unenrolled students, turning the LEFT JOIN into an effective INNER JOIN. The fix: put the cid='COP5725' predicate in the ON clause, not the WHERE.
-->

---

# Clicker Check — Answer

**B. Returns only students enrolled in COP5725 (degrades to inner join).**

The `WHERE e.cid = 'COP5725'` filters out rows where `e.cid` is NULL — which is exactly the unenrolled students the LEFT JOIN was supposed to keep.

The fix: move the predicate into the `ON` clause.

```sql
SELECT s.name, e.cid
FROM   student s
LEFT JOIN enrollment e
       ON e.sid = s.sid AND e.cid = 'COP5725';
```

The rule: **predicates on the kept side go in WHERE; predicates on the optional side go in ON**. This is the most common LEFT JOIN bug in production SQL.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

`enrollment` has a million rows; one row has `sid = NULL`. What does this query return?

```sql
SELECT name FROM student
WHERE  sid NOT IN (SELECT sid FROM enrollment);
```

A. Every student
B. Students not in enrollment
C. Zero rows
D. An error

<!--
Answer: C. NOT IN with NULL is a classic SQL trap. The presence of even one NULL in the subquery causes NOT IN to return zero matching rows for every outer row — the empty set. Use NOT EXISTS instead.
-->

---

# Clicker Check — Answer

**C. Zero rows.**

`NOT IN` is "for every value in the set, x <> value". When even one value in the set is NULL, the comparison evaluates to UNKNOWN, which `NOT IN` treats as not-true.

The fix is `NOT EXISTS`:

```sql
SELECT name FROM student
WHERE  NOT EXISTS (
  SELECT 1 FROM enrollment e WHERE e.sid = student.sid
);
```

`NOT EXISTS` is NULL-safe by construction. This trap is one of the most common interview gotchas.
