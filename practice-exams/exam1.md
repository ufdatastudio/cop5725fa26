---
layout: default
---

# Exam 1 Practice Packet

**Coverage:** Sections 1-3 (relational model, algebra, ER, normalization, all SQL, Python + DuckDB).
**Released:** Wednesday, October 7, 2026.
**Exam:** Wednesday, October 14, 2026, 8:30-9:20 AM in class.

Work this packet without looking at solutions. Solutions live in [`exam1-solutions.md`](exam1-solutions.md) (released alongside this packet) so you can check yourself.

> This packet matches the real exam in form and difficulty. It is *not* the same problems.

---

## Problem 1 — Relational Algebra

Given relations:
- `student(sid, name, major, gpa)`
- `enrollment(sid, cid, term, grade)`

Write a relational algebra expression for:
*"Names of students enrolled in COP5725 in Fall 2026 whose GPA is above 3.5."*

---

## Problem 2 — ER to Schema

Translate the following ER diagram description into a normalized PostgreSQL `CREATE TABLE` script.

> A **library** has many **branches**. Each branch holds many **copies** of **books**. A book has many copies; a copy belongs to one branch. **Patrons** check out copies; each checkout records the patron, the copy, the checkout date, and the return date (NULL if not yet returned).

Mark every primary and foreign key. State which constraints are total participation.

---

## Problem 3 — Normalization

Given relation `R(A, B, C, D, E)` and FDs `F = {A → B, A → C, BC → D, D → E}`:

1. Compute `{A}+`.
2. Find a candidate key.
3. State which normal form `R` is in. Justify.
4. Decompose `R` into a set of BCNF relations (or argue why BCNF is not reachable while preserving dependencies).

---

## Problem 4 — Advanced SQL

Schema: `enrollment(sid, cid, term, grade)`.

Write a single SQL query that, for each `cid`, returns the term with the highest enrollment count, breaking ties alphabetically by term.

Constraint: must use a window function.

---

## Problem 5 — Window Functions

Schema: `daily_signups(signup_date, count)`.

Write a query that returns each day's count along with the 7-day moving average (including the current day). Use an explicit frame.

---

## Problem 6 — Recursive CTE

Schema: `employee(eid, name, manager_id)`, where `manager_id` is a self-FK or NULL for the CEO.

Write a recursive CTE that returns every employee with their depth in the org chart (CEO is depth 1).

---

## Problem 7 — Python + Safety

You are writing a Python script with `psycopg`. Which of the following is safe against SQL injection? For each, mark **safe** or **unsafe** and one sentence why.

```python
# A
cur.execute(f"SELECT * FROM student WHERE name = '{name}'")

# B
cur.execute("SELECT * FROM student WHERE name = %s", (name,))

# C
cur.execute("SELECT * FROM " + table_name)

# D
cur.execute(
    psycopg.sql.SQL("SELECT * FROM {t}").format(t=psycopg.sql.Identifier(table_name))
)
```

---

## Problem 8 — DuckDB

In a Jupyter notebook, write the Python/DuckDB code to:

1. Read `https://duckdb.org/data/flights.csv` directly
2. Aggregate by `OriginCityName`, computing the number of flights
3. Return the top 10 as a pandas DataFrame

You may not write any intermediate file.

---

## Logistics

- Bring a pen.
- No notes, no laptops, no phones.
- 50 minutes. Pacing target: 5-7 minutes per problem.
- Partial credit awarded generously for clearly-written work.

Good luck.

[back](../index)
