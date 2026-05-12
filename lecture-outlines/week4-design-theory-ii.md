# Week 4: Design Theory II — Functional Dependencies and Normalization

## Overview

Week 4 closes Section 1.
Labor Day takes Monday, so the week has only two meetings — both compressed and high-density.
Wednesday introduces the formal machinery of functional dependencies; Friday applies the machinery to normalize schemas, then administers Quiz 1 in the last 10 minutes.

**Learning Objectives:**

- Define a functional dependency and compute the closure of an attribute set
- Apply Armstrong's axioms to derive new FDs from a given set
- Find a minimal (canonical) cover for a set of FDs
- Identify candidate keys using attribute closure
- Recognize redundancy, insertion, update, and deletion anomalies in a denormalized schema
- Place a schema into 1NF, 2NF, 3NF, or BCNF
- Decompose a schema using the lossless join and dependency preservation tests

---

## Day 8 (Wednesday, September 9): Functional Dependencies

*Monday Sep 7 — Labor Day, no class*

### Topics (50 min)

**1. Why FDs (5 min)**
- The gap ER thinking leaves
- The need for a formal language to talk about redundancy

**2. Definition and Examples (10 min)**
- $X \rightarrow Y$: same X values force same Y values
- Trivial vs non-trivial FDs

**3. Attribute Closure $X^+$ (12 min)**
- The algorithm
- Worked examples — interactive

**4. Armstrong's Axioms (8 min)**
- Reflexivity, augmentation, transitivity
- Why three axioms are sound and complete

**5. Equivalence and Minimal Cover (10 min)**
- When two FD sets are equivalent
- Finding a minimal cover step by step

**6. Keys via FDs (5 min)**
- Candidate keys as minimal attribute sets whose closure is the relation
- Why this matters for normalization

### Action Items
- Read GMW Ch. 3.1-3.3
- Project 1 work continues; due Fri Sep 25

---

## Day 9 (Friday, September 11): Normal Forms + Quiz 1

### Topics (40 min lecture + 10 min Quiz 1)

**1. The Anomaly Problem (8 min)**
- Insertion, deletion, update anomalies on a denormalized schema
- The redundancy that causes them

**2. 1NF, 2NF, 3NF (12 min)**
- Atomic values (1NF)
- Partial dependency (2NF)
- Transitive dependency (3NF)

**3. BCNF (8 min)**
- Every determinant is a superkey
- When 3NF and BCNF differ

**4. Decomposition (8 min)**
- Lossless join test
- Dependency preservation test
- 3NF synthesis algorithm

**5. Practical Notes (4 min)**
- When to denormalize on purpose
- The role of materialized views

**6. Quiz 1 (10 min)**
- Closes Section 1: relational model, algebra, ER, FDs, normalization
- Lowest of 5 quizzes is dropped

### Action Items
- Read GMW Ch. 3.4-3.7
- Continue Project 1; due Fri Sep 25

---

## Looking Ahead to Week 5

Section 2 opens. Three meetings, all on SQL:

- **Mon Sep 14** — SQL DDL and Basic SELECT
- **Wed Sep 16** — SQL Joins (inner, outer, semi, anti)
- **Fri Sep 18** — Aggregation, GROUP BY, HAVING
