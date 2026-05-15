---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day3 Relational Model — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day3 Relational Model

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

A `text[]` column holding `{555-1234, 555-9999}` per row:

A. Is fully 1NF compliant
B. Violates 1NF (the textbook view) but is acceptable when queries treat it as opaque
C. Is illegal in PostgreSQL
D. Becomes 1NF compliant if you add an index

<!--
Answer: B. The textbook 1NF says every attribute value is atomic. An array is multi-valued, so it's a 1NF violation by that strict reading. PostgreSQL supports arrays as a deliberate engineering escape hatch. Whether to use them depends on access patterns.
-->

---

# Clicker Check — Answer

**B. Violates 1NF (textbook view) but is acceptable when queries treat it as opaque.**

The textbook rule: an attribute value must be **single-valued**. An array is, by definition, multi-valued.

PostgreSQL supports arrays anyway because in real engineering:
- If you treat the array as a blob (read whole, write whole), the violation is harmless
- If you query into the array (`WHERE x = ANY(arr)`, `unnest(arr)`), you've crossed back out of pure relational reasoning

We will return to this on Day 9 with the explicit normal-form decision diagram.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

What does `SELECT count(*) FROM users WHERE manager_id <> 7` return when 158 rows have `manager_id IS NULL` and 800 rows have a non-NULL value other than 7?

A. 958 (all rows that aren't manager_id = 7)
B. 800 (only the non-NULL rows that aren't 7)
C. 158 (only the NULL rows)
D. NULL — the entire query is unknowable

<!--
Answer: B. NULL <> 7 evaluates to UNKNOWN, which is treated as false by WHERE. So 158 NULL rows are filtered out, leaving 800 explicit non-7 rows. This is the most common NULL trap in SQL.
-->

---

# Clicker Check — Answer

**B. 800.**

`manager_id <> 7` evaluates to:
- TRUE for the 800 explicit non-7 values
- UNKNOWN for the 158 NULLs

`WHERE` keeps only TRUE rows, so the 158 NULLs are filtered out.

To include them: `WHERE manager_id <> 7 OR manager_id IS NULL`.

Or use PostgreSQL's NULL-safe operator: `WHERE manager_id IS DISTINCT FROM 7`.
