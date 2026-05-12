# Week 7: Advanced SQL II — Frames, Recursion, Views

## Overview

Week 7 closes Section 2.
Monday extends window functions with frames and neighbor-peeking; Wednesday devotes the entire hour to recursive CTEs (anchored by the Hirn-Grust 2023 paper); Friday surfaces views, advanced constraints, and triggers, then runs Quiz 2 in the last 10 minutes.

**Learning Objectives:**

- Specify a window frame (`ROWS BETWEEN`, `RANGE BETWEEN`) and explain the default
- Use `LAG`, `LEAD`, `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE` for neighbor and boundary lookups
- Write a recursive CTE with a base and recursive case; reason about termination
- Apply recursive queries to hierarchical, graph-traversal, and sequence-generation problems
- Choose between `CREATE VIEW` and `CREATE MATERIALIZED VIEW` based on freshness and cost
- Use `EXCLUDE` constraints and deferred constraints to enforce invariants SQL would otherwise miss
- Write a simple PL/pgSQL trigger and recognize when it is the wrong tool

---

## Day 16 (Monday, September 28): Window Functions II

### Topics (50 min)

**1. Frame Clauses (12 min)**
- `ROWS BETWEEN n PRECEDING AND CURRENT ROW`
- `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`
- `RANGE BETWEEN ...` and what the difference is from `ROWS`
- The default frame, and why ORDER BY changes behavior

**2. Neighbor Functions (10 min)**
- `LAG(value, offset, default)` — peek backward
- `LEAD(value, offset, default)` — peek forward
- Period-over-period comparisons

**3. Boundary Functions (8 min)**
- `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`
- The "LAST_VALUE returns the current row" surprise

**4. Moving Averages and Cumulative Statistics (10 min)**
- 7-day moving average
- Cumulative distribution
- Gap-and-island problems

**5. Wrap and Project 1 Presentations (10 min)**
- Project 1 small-group breakout in last 20 min — see schedule

### Action Items
- Read PostgreSQL docs Ch. 9.22 (Window Functions) end-to-end
- Project 2 (Advanced SQL) released today; due Fri Oct 23

---

## Day 17 (Wednesday, September 30): Recursive Queries

### Topics (50 min)

**1. The Shape of a Recursive CTE (8 min)**
- `WITH RECURSIVE name AS (base UNION ALL recursive)`
- Base case, recursive case, termination

**2. Worked Example: Org Chart (10 min)**
- Build the org_chart CTE from Day 14's preview
- Add a depth column; print indented names

**3. Worked Example: Graph Traversal (12 min)**
- A `friends` table
- Find all friends-of-friends within 3 hops
- Cycle detection via path arrays

**4. Worked Example: Sequence Generation (8 min)**
- `generate_series` vs recursive CTE for arithmetic sequences
- Fibonacci numbers as a tutorial recursion

**5. Hirn and Grust, "A Fix for the Fixation on Fixpoints" (10 min)**
- Why standard SQL recursive CTEs are unnecessarily restrictive
- PostgreSQL extensions to recursion
- What this means for graph queries in 2026

**6. Patterns and Caveats (2 min)**
- Termination as a real risk
- `UNION ALL` vs `UNION` performance

### Action Items
- Read Hirn and Grust, [*A Fix for the Fixation on Fixpoints*](https://ufdatastudio.com/cop5725fa26/papers/pdfs/hirn2023.pdf)
- Project 2 work continues

---

## Day 18 (Friday, October 2): Views, Constraints, Triggers + Quiz 2

### Topics (40 min lecture + 10 min Quiz 2)

**1. Views (10 min)**
- `CREATE VIEW` — a named SELECT
- Updatable views (PostgreSQL specifics)
- `CREATE MATERIALIZED VIEW` and `REFRESH MATERIALIZED VIEW`
- When to use which

**2. Advanced Constraints (10 min)**
- `EXCLUDE USING gist` for overlap prevention
- `DEFERRABLE INITIALLY DEFERRED` for cycle-breaking
- `CHECK` revisited with subquery-free predicates

**3. Triggers (12 min)**
- `CREATE TRIGGER` and the trigger lifecycle
- BEFORE vs AFTER, ROW vs STATEMENT
- A simple audit-log trigger
- When triggers are the wrong answer

**4. Section 2 Wrap (8 min)**
- What you can now do
- Section 3 preview: Python + DuckDB
- Exam 1 in two weeks

**5. Quiz 2 (10 min)**
- Closes Section 2: SQL fundamentals through recursive queries
- Coverage map on the next slide

### Action Items
- Read PostgreSQL docs Ch. 5.4 (Constraints), Ch. 38 (Triggers), Ch. 40 (Views)
- Continue Project 2; due Fri Oct 23
- Exam 1 on Wed Oct 14

---

## Looking Ahead to Week 8

Section 3 opens. Two meetings (Homecoming closes Friday):

- **Mon Oct 5** — Python + psycopg + pandas for SQL results
- **Wed Oct 7** — DuckDB + notebooks + visualization

*Friday Oct 9 — Homecoming, no class*
