# Week 5: SQL Fundamentals

## Overview

Section 2 opens.
This week walks the day-to-day SQL surface: DDL, single-table SELECT, joins, and aggregation.
Every slide cites the PostgreSQL documentation as the authoritative reference; students should leave the week comfortable navigating the docs on their own.

**Learning Objectives:**

- Read PostgreSQL syntax notation and locate any feature in the documentation
- Write DDL statements that create normalized, constraint-rich schemas in PostgreSQL
- Use the full single-table query shape (`SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT`)
- Pick the right join kind (inner, outer, semi, anti, cross, self, lateral) for a stated question
- Reason about NULL behavior in `WHERE`, joins, and aggregates
- Write `GROUP BY ... HAVING` queries, including `FILTER` and `GROUPING SETS`

---

## Day 10 (Monday, September 14): SQL DDL and Basic SELECT

### Topics (50 min)

**1. The PostgreSQL Documentation (8 min)**
- Why we pick PostgreSQL as the authoritative SQL reference
- Reading the syntax notation (brackets, ellipses, vertical bars)
- A worked tour: looking up `SELECT`

**2. DDL: CREATE, ALTER, DROP (15 min)**
- `CREATE TABLE` with constraints (PK, FK, UNIQUE, CHECK, NOT NULL)
- `ALTER TABLE` for evolution
- `DROP TABLE` and `TRUNCATE` (and the difference)

**3. Single-Table SELECT (20 min)**
- `SELECT` list, `FROM`, `WHERE`
- Predicate building blocks: comparison, `BETWEEN`, `LIKE`, `IN`, `IS NULL`
- `DISTINCT` and bag vs set semantics
- `ORDER BY`, `LIMIT`, `OFFSET`

**4. Practice (7 min)**
- Live demo against the university schema
- Common errors

### Action Items
- Read PostgreSQL docs Ch. 5 (Data Definition) and Ch. 7.1, 7.3, 7.5
- Project 1 active; due Fri Sep 25

---

## Day 11 (Wednesday, September 16): SQL Joins

### Topics (50 min)

**1. Inner Joins (10 min)**
- Comma-list `FROM` (legacy) vs explicit `INNER JOIN`
- `ON` vs `USING`
- Multi-way joins
- Implicit cross product traps

**2. Outer Joins (10 min)**
- LEFT, RIGHT, FULL — when each makes sense
- NULL columns and how filters interact

**3. Semi and Anti Joins (10 min)**
- `EXISTS` for semi-join
- `NOT EXISTS` for anti-join
- Why these are usually preferred over `IN`/`NOT IN` with NULLs

**4. CROSS, Self, LATERAL (12 min)**
- Deliberate cross products
- Self-joins (recall ρ from Day 4)
- `LATERAL` — PostgreSQL's correlated derived tables

**5. Common Errors (8 min)**
- Forgetting the join predicate
- Outer join + WHERE-on-right-side trap
- Multiplying counts via joins

### Action Items
- Read PostgreSQL docs Ch. 7.2 (Table Expressions)
- Project 1 work continues

---

## Day 12 (Friday, September 18): Aggregation, GROUP BY, HAVING

### Topics (50 min)

**1. Aggregate Functions (8 min)**
- `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `STDDEV`, `BOOL_AND`, `BOOL_OR`
- `COUNT(*)` vs `COUNT(col)` and NULL semantics
- `DISTINCT` inside aggregates

**2. GROUP BY (10 min)**
- Single and multi-column grouping
- The "every non-aggregated column must be in GROUP BY" rule
- PostgreSQL's `GROUP BY` flexibility (functional dependency exception)

**3. HAVING (8 min)**
- Filter on groups, not rows
- Why `WHERE count(*) > 5` does not work

**4. FILTER, GROUPING SETS, ROLLUP, CUBE (12 min)**
- `FILTER (WHERE ...)` — modern per-aggregate filtering
- `GROUPING SETS` for multiple groupings in one query
- `ROLLUP` and `CUBE` for subtotals and cross-tabulations

**5. Logical Order of Evaluation (8 min)**
- `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`
- Why this matters when you reference aliases

**6. Wrap and Look Ahead (4 min)**
- Project 1 reminder
- Next week: subqueries, CTEs, window functions

### Action Items
- Read PostgreSQL docs Ch. 7.2.3 (GROUP BY and HAVING) and Ch. 9.21 (Aggregate Functions)
- Continue Project 1; due Fri Sep 25

---

## Looking Ahead to Week 6

Advanced SQL begins. Three meetings:

- **Mon Sep 21** — Subqueries: scalar, table, correlated, `EXISTS`
- **Wed Sep 23** — Common Table Expressions (`WITH`)
- **Fri Sep 25** — Window Functions I (`OVER`, `PARTITION BY`); Project 1 due
