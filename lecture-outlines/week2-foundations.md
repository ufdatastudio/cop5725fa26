# Week 2: From History to the Relational Model

## Overview

Week 2 starts the work of Section 1.
The week moves from history (already covered Mon Aug 24) into the formal definition of the relational model and the first half of relational algebra.
Project 1 is released Wednesday; Project 0 setup is due the following Friday (Sep 4).

**Learning Objectives:**

- Define a relation, a tuple, a schema, and the standard integrity constraints
- Locate the PostgreSQL type system on the relational map (atomic types, composite types, arrays, JSON, ranges, geometric)
- Read and write the symbols of relational algebra: σ, π, ∪, ∩, −, ×, ρ
- Translate a simple natural-language query into a relational algebra expression

---

## Day 2 (Monday, August 24): Database History

Covered in [week1-introduction.md](week1-introduction.md). Slide deck at [day2-database-history/slides.md](day2-database-history/slides.md).

---

## Day 3 (Wednesday, August 26): The Relational Model and Data Types

### Topics (50 min)

**1. The Formal Relational Model (12 min)**
- Relations as sets of tuples over named attributes
- Schemas, domains, and the difference between *attribute* and *column*
- Keys: superkey, candidate, primary, foreign
- The three integrity rules: domain, entity, referential

**2. Data Types and the Domain Question (15 min)**
- PostgreSQL type families: numeric, character, date/time, boolean, UUID, JSON/JSONB, arrays, ranges, geometric, network, enum, composite, user-defined
- 1NF vs the modern type system
- When an array or a JSON column violates the relational model and when it does not

**3. Integrity Constraints in SQL (10 min)**
- NOT NULL, UNIQUE, CHECK, PRIMARY KEY, FOREIGN KEY
- Custom domains and CHECK expressions
- Where constraints belong: schema vs application vs database trigger

**4. NULL Semantics (8 min)**
- Three-valued logic
- Two queries that produce different results because of NULLs
- When to forbid NULL at the column level

**5. Wrap-up and Friday Preview (5 min)**
- Where types stress the relational model
- Algebra symbols you should arrive on Friday already comfortable seeing

### Action Items
- Read GMW Ch. 2.1-2.3
- Skim PostgreSQL data types docs (Ch. 8)
- Project 1 released Wednesday; one-page Codd reading response embedded in Project 1

---

## Day 4 (Friday, August 28): Relational Algebra I

### Topics (50 min)

**1. Why an Algebra (5 min)**
- Closure: operators take relations and return relations
- The relational algebra is the compile target for SQL

**2. Selection σ (8 min)**
- Predicates over a single relation
- Boolean combinations of comparisons
- Selectivity as a number we will care about later in Section 5

**3. Projection π (8 min)**
- Set semantics: duplicates removed
- The difference between π in relational algebra and SELECT in SQL

**4. Set Operations: ∪, ∩, − (8 min)**
- Union compatibility
- Why DBMSes optimize ∪ ALL faster than ∪

**5. Cross Product × (5 min)**
- The first multi-relation operator
- Cardinality and why × alone is rarely what you want

**6. Rename ρ (5 min)**
- Renaming a relation; renaming attributes
- Self-joins as the use case that forces rename

**7. Composition and Equivalence (8 min)**
- π_{a}(σ_{p}(R)) and why ordering matters for cost (Section 5 preview)

**8. Wrap-up (3 min)**
- Monday: joins, division, and extended algebra
- Quiz 1 in two weeks closes this section

### Action Items
- Read GMW Ch. 2.4
- Three practice problems on the Wednesday handout — answers due before Mon Aug 31 class

---

## Looking Ahead to Week 3

Three meetings:

- **Mon Aug 31** — Relational Algebra II: joins (theta, equi, natural), division, extended algebra (aggregation, sorting, outer join)
- **Wed Sep 2** — Entity-Relationship Modeling: entities, relationships, attributes, cardinality, weak entities; how an ER diagram becomes a candidate schema
- **Fri Sep 4** — ER to Relations: the translation rules; Project 0 due tonight; Project 1 active
