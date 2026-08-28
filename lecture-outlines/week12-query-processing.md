# Week 12: Query Processing — Joins and the Iterator Model

## Overview

Section 5 opens.
This is the week the course turns from "how does the data sit on the machine" to "how does the engine actually run a query."
Three days, two on joins and one on the iterator model that every query engine uses.

**Learning Objectives:**

- Implement and analyze the cost of nested loop, block nested loop, and index nested loop joins
- Implement and analyze sort-merge, hash, grace hash, and hybrid hash joins
- Pick the right join algorithm for a given workload and read PostgreSQL's plan to verify
- Describe the iterator (Volcano) model and walk through `open / next / close` on a small plan tree
- Distinguish pipelining from blocking operators and recognize the consequences in `EXPLAIN ANALYZE`

---

## Day 30 (Monday, November 2): Join Algorithms I

### Topics (50 min)

**1. The Join Problem (5 min)**
- Recap algebra (Day 4-5)
- The naive plan and why it fails

**2. Nested Loop Join (10 min)**
- The simplest algorithm
- O(B_R × B_S) page accesses
- When it's actually optimal

**3. Block Nested Loop (12 min)**
- Use M-2 pages for the outer relation
- The (B_R / (M-2)) × B_S cost
- Pick the smaller relation as outer

**4. Index Nested Loop (12 min)**
- One relation has an index on the join key
- Cost: B_R + |R| × (h + 1)
- When this dominates everything else

**5. Cost Comparison (8 min)**
- Real numbers on small/medium/large relations
- The decision table

**6. Wrap (3 min)**
- Wed: sort-merge, hash, grace hash
- Project 3 work continues

### Action Items
- Read Textbook Ch. 15.2-15.3
- Project 3 due Fri Nov 13

---

## Day 31 (Wednesday, November 4): Join Algorithms II

### Topics (50 min)

**1. Sort-Merge Join (15 min)**
- Sort both relations on the join key (Day 29 sort!)
- Merge in lockstep
- O(B_R log B_R + B_S log B_S) — minus a constant when sorted already

**2. Hash Join (10 min)**
- Build a hash table on the smaller relation
- Probe with the larger
- O(B_R + B_S) when build fits in memory

**3. Grace Hash Join (10 min)**
- When build side doesn't fit
- Partition both relations into buckets
- Per-bucket hash join

**4. Hybrid Hash Join (8 min)**
- PostgreSQL's variant
- Keep the first partition in memory

**5. Comparison (7 min)**
- The big decision table
- What PostgreSQL picks and when

### Action Items
- Read Textbook Ch. 15.4-15.5
- Continue Project 3

---

## Day 32 (Friday, November 6): The Iterator (Volcano) Model

### Topics (50 min)

**1. Why an Execution Model (5 min)**
- The plan tree needs to actually run
- The interface that makes operators composable

**2. The Volcano Model (15 min)**
- Graefe 1994
- Open / Next / Close
- One tuple at a time

**3. Walking a Plan (10 min)**
- A 3-operator plan
- Trace the calls
- See pull-based execution

**4. Pipelining vs Blocking (10 min)**
- Pipelined operators (filter, project, NL join)
- Blocking operators (sort, hash build, aggregation)
- Why `LIMIT` can short-circuit pipelined plans

**5. Where Volcano Falls Short (8 min)**
- The function-call overhead problem
- The lead-in to vectorized execution (Monday)

**6. Wrap (2 min)**
- Monday: vectorized execution + Optimization I
- Project 3 due next Friday

### Action Items
- Read Graefe, [*Volcano: An Extensible and Parallel Query Evaluation System*](https://ufdatastudio.com/cop5725fa26/papers/pdfs/graefe1994.pdf), IEEE TKDE 6(1), 1994

---

## Looking Ahead to Week 13

Two meetings — Veterans Day takes Wednesday:

- **Mon Nov 9** — Vectorized Execution and Optimization I (RA equivalences, plan space)
- **Fri Nov 13** — Optimization II: Cost Estimation, System R; **Project 3 due**

Then Exam 2 on Wed Nov 18.
