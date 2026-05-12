---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day14 Ctes — Instructor Only'
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
## Day14 Ctes

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

In PostgreSQL 12+, a single-reference CTE defined without `MATERIALIZED` behaves like:

A. A materialized intermediate result, always computed once
B. An inline subquery (the optimizer can push filters into it)
C. A view that updates with the base tables
D. A temporary table that survives the session

<!--
Answer: B. PG 12 changed CTE behavior — by default, single-reference CTEs are inlined like subqueries, allowing the optimizer to push filters down. Use MATERIALIZED to force the old "optimization fence" behavior. Many online tutorials still describe the old behavior.
-->

---

# Clicker Check — Answer

**B. An inline subquery (the optimizer can push filters into it).**

PostgreSQL 12 changed CTE behavior. Before PG 12, CTEs were always **materialized** — computed once, then read from a temp result. This made them an "optimization fence" that prevented filter pushdown.

PG 12+: single-reference CTEs are inlined by default. The optimizer treats them like derived tables.

Use:
- `WITH x AS MATERIALIZED (...)` — force the old behavior (multiple references, or expensive recompute)
- `WITH x AS NOT MATERIALIZED (...)` — force inlining even with multiple references

Many StackOverflow answers still describe the old behavior. Trust the docs, not internet folklore.
