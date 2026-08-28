# Week 13: Vectorized Execution and Query Optimization

## Overview

Section 5 closes.
Veterans Day takes Wednesday, leaving Monday and Friday.
Monday packages vectorized execution and the first half of query optimization (RA equivalences, plan space).
Friday delivers cost estimation, the Selinger optimizer, and the Leis 2015 paper.
Project 3 (Indexing + Query Plans) is due Friday.

**Learning Objectives:**

- Compare tuple-at-a-time and vector-at-a-time execution
- Explain why vectorization reaches column-store speeds
- Identify the standard relational algebra equivalence rules
- Describe the optimizer's plan-space search and System R's dynamic programming
- Read PostgreSQL `pg_stats` and reason about how statistics drive plan choice
- Recognize where cardinality estimation fails and what to do about it (Leis 2015)

---

## Day 33 (Monday, November 9): Vectorized Execution + Optimization I

### Topics (50 min)

**1. Vectorized Execution (15 min)**
- The Volcano overhead problem (recap)
- MonetDB/X100 (Boncz et al., CIDR 2005) — the modern starting point
- Vectors as the new "tuple"
- SIMD, branch elimination, code generation

**2. Where PG Stands (5 min)**
- Volcano + JIT compilation (PG 11+)
- The DuckDB / Velox / Photon family

**3. The Optimizer's Job (5 min)**
- SQL → algebra → plan → execution
- Logical plan vs physical plan
- The exponential plan space

**4. RA Equivalence Rules (15 min)**
- Selection pushdown
- Projection pushdown
- Join commutativity and associativity
- Cross product ↔ join with predicate

**5. Plan Space Search (10 min)**
- Bottom-up dynamic programming (System R)
- Greedy join order
- Cost-driven choices

### Action Items
- Read Textbook Ch. 16.1-16.3
- Project 3 due Fri Nov 13

---

## Day 34 (Friday, November 13): Optimization II + Project 3 Due

### Topics (50 min)

**1. Statistics — What the Optimizer Knows (12 min)**
- `pg_class.reltuples`, `pg_stats`
- Histograms, most-common-values, n_distinct
- When and how `ANALYZE` runs

**2. Cost Estimation (10 min)**
- I/O cost + CPU cost
- Selectivity from histograms
- The 0.005 default for unknowns

**3. The Selinger Optimizer (10 min)**
- Selinger et al., SIGMOD 1979
- Dynamic programming over join orders
- Interesting orders
- Why this still runs in PostgreSQL

**4. Where Optimizers Fail (8 min)**
- Leis et al. 2015 — *How Good Are Query Optimizers, Really?*
- Cardinality errors compound
- The "join-order-is-everything" finding

**5. Section 5 Wrap (5 min)**
- What you now know
- Exam 2 next week

**6. Project 3 Wrap (5 min)**
- Due tonight at 11:59 PM
- Presentations next week

### Action Items
- Read Selinger et al., [*Access Path Selection*](https://ufdatastudio.com/cop5725fa26/papers/pdfs/selinger1979.pdf), SIGMOD 1979
- Read Leis et al., [*How Good Are Query Optimizers, Really?*](https://ufdatastudio.com/cop5725fa26/papers/pdfs/leis2015.pdf), PVLDB 2015
- **Project 3 due tonight at 11:59 PM**
- Exam 2 practice packet released today

---

## Looking Ahead to Week 14

Section 6 opens. Three meetings:

- **Mon Nov 16** — Transactions and ACID; Project 3 presentations
- **Wed Nov 18** — **Exam 2** (covers Sections 4-5)
- **Fri Nov 20** — Two-Phase Locking; Project 3 winners present
