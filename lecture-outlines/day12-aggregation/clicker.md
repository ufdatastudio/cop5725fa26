---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day12 Aggregation — Instructor Only'
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
## Day12 Aggregation

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

A `users` table has 1000 rows, of which 200 have `last_login_at IS NULL`. What do these two queries return?

```sql
SELECT count(*) FROM users;           -- A
SELECT count(last_login_at) FROM users; -- B
```

A. Both return 1000
B. A returns 1000; B returns 200
C. A returns 1000; B returns 800
D. Both return 800

<!--
Answer: C. count(*) counts every row including NULLs. count(col) counts only non-NULL values, so the 200 NULL last_login_at rows are excluded.
-->

---

# Clicker Check — Answer

**C. A returns 1000; B returns 800.**

- `count(*)` counts **every row** regardless of NULLs
- `count(col)` counts only **non-NULL values** of that column

This trap is the source of many "why does my user count keep dropping?" mysteries — a developer wrote `count(last_login_at)` thinking they were counting "users with logins" but the column has NULLs from never-logged-in users.

The right SQL for "how many users have ever logged in" is `count(last_login_at)`. The right SQL for "how many users exist" is `count(*)`. Pick the question, then the function.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Which clause is the right home for "only show majors with at least 5 students"?

A. `WHERE count(*) >= 5`
B. `HAVING count(*) >= 5`
C. `ORDER BY count(*) >= 5`
D. Either WHERE or HAVING

<!--
Answer: B. WHERE evaluates before GROUP BY, so count(*) doesn't exist yet there. HAVING evaluates after grouping, when count(*) is defined for each group.
-->

---

# Clicker Check — Answer

**B. `HAVING count(*) >= 5`.**

The logical pipeline:

```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

`WHERE` runs before `GROUP BY`. At that point, no groups exist; `count(*)` is undefined.

`HAVING` runs after `GROUP BY`. Each group has its aggregates computed. `count(*)` is a real number per group, and `HAVING` filters which groups to return.

Rule of thumb: if you reference an aggregate function in a filter, use `HAVING`. Otherwise `WHERE`.
