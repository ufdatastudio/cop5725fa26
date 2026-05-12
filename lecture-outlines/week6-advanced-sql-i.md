# Week 6: Advanced SQL I — Subqueries, CTEs, Window Functions

## Overview

Week 6 enters the part of SQL most graduate programs skip and most working engineers reach for blindly.
Subqueries become CTEs become window functions in a deliberate progression.
By the end of the week the class can answer "top N per group," "running total," "rank with ties," and "dedupe by key" without a join multiplication trap in sight.
Project 1 closes Friday at 11:59 PM.

**Learning Objectives:**

- Distinguish scalar, table, and correlated subqueries; pick the right form for a given question
- Rewrite a nested subquery as a CTE and vice versa, knowing when each is preferable
- Write multi-CTE queries and the PostgreSQL `MATERIALIZED` / `NOT MATERIALIZED` hints
- Read and write window function expressions with `OVER ( PARTITION BY ... ORDER BY ... )`
- Use `ROW_NUMBER`, `RANK`, `DENSE_RANK`, and window aggregates to solve top-N, ranking, and running-total problems

---

## Day 13 (Monday, September 21): Subqueries

### Topics (50 min)

**1. Three Kinds of Subquery (10 min)**
- Scalar (returns one value)
- Table (used in FROM)
- Correlated (references the outer row)

**2. IN, ANY, SOME, ALL (10 min)**
- The four set-membership predicates
- When ANY equals IN, when ALL equals NOT IN
- The NULL trap one more time

**3. Subqueries in WHERE, SELECT, FROM (10 min)**
- A correlated example: top-2 per group
- A scalar example: column from aggregated subquery
- A table example: pre-aggregate then join

**4. Rewriting Patterns (10 min)**
- Subquery → JOIN
- Subquery → CTE (preview)
- Subquery → window function (preview)

**5. Common Errors (10 min)**
- The IN-with-NULL trap
- Returning more than one row from a scalar subquery
- Correlated subquery performance traps

### Action Items
- Read PostgreSQL docs Ch. 7.2.1.3 (Subqueries) and Ch. 9.24 (Subquery Expressions)
- Project 1 due Fri Sep 25

---

## Day 14 (Wednesday, September 23): Common Table Expressions

### Topics (50 min)

**1. The WITH Clause (8 min)**
- Syntax and semantics
- Replacing deeply nested subqueries

**2. Multiple CTEs in One Query (10 min)**
- Sequential and dependent CTEs
- Self-referencing names

**3. PostgreSQL: MATERIALIZED vs NOT MATERIALIZED (10 min)**
- The default inlining behavior in PostgreSQL 12+
- When to force materialization

**4. CTEs with DML (12 min)**
- `WITH ... INSERT` for derived inserts
- `WITH ... UPDATE` with RETURNING
- `WITH ... DELETE` for cleanup

**5. CTE Patterns (10 min)**
- Pre-aggregate then join
- Step-by-step transformations
- Recursive CTE preview (full coverage Day 17)

### Action Items
- Read PostgreSQL docs Ch. 7.8 (WITH Queries)
- Featured paper this week: Hirn and Grust, *A Fix for the Fixation on Fixpoints*, CIDR 2023

---

## Day 15 (Friday, September 25): Window Functions I

### Topics (50 min)

**1. The Problem Windows Solve (8 min)**
- GROUP BY collapses rows; windows do not
- Side-by-side: "average GPA per major" with and without losing the row

**2. The OVER Clause (10 min)**
- `OVER ()` — the whole table is one window
- `OVER (PARTITION BY ...)` — windows by group
- `OVER (ORDER BY ...)` — ordering inside windows

**3. Ranking Functions (12 min)**
- `ROW_NUMBER` — unique sequence numbers
- `RANK` — gaps for ties
- `DENSE_RANK` — no gaps
- `NTILE(n)` — quantile buckets

**4. Window Aggregates (10 min)**
- `SUM`, `AVG`, `COUNT` over windows
- Running totals
- Comparison to GROUP BY

**5. Patterns and Project 1 Wrap (10 min)**
- Top-N per group (the cleanest form)
- Deduplication
- Project 1 reminder

### Action Items
- Read PostgreSQL docs Ch. 3.5 (Window Functions) and Ch. 4.2.8 (Window Function Calls)
- **Project 1 due tonight at 11:59 PM**

---

## Looking Ahead to Week 7

Three meetings close Section 2:

- **Mon Sep 28** — Window Functions II: frames, LAG, LEAD, FIRST_VALUE, LAST_VALUE
- **Wed Sep 30** — Recursive Queries (`WITH RECURSIVE`); the Hirn-Grust 2023 paper anchors the discussion
- **Fri Oct 2** — Views, Constraints, Triggers; **Quiz 2** closes Section 2
