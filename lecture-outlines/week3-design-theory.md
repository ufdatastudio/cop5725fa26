# Week 3: Design Theory I — Joins, ER, and Translation

## Overview

Week 3 finishes the relational algebra by adding joins, division, and the extended operators every real query uses.
Wednesday turns from algebra to design: entity-relationship modeling.
Friday closes the loop by translating an ER diagram into a relational schema and shipping Project 0 (P/F).

**Learning Objectives:**

- Read and write all relational algebra operators, including theta join, natural join, outer joins, division, and aggregation
- Draw an ER diagram for a small domain (entities, attributes, relationships, cardinality, weak entities)
- Apply the ER-to-relations translation rules and explain the design choices each rule encodes
- Recognize when a relational schema is over- or under-normalized at first glance, in preparation for Week 4

---

## Day 5 (Monday, August 31): Relational Algebra II

### Topics (50 min)

**1. Joins as Cross Product + Selection (10 min)**
- Theta join, equi-join, natural join — derivations from σ and ×
- Notation: ⋈_θ, ⋈
- When the optimizer treats a join as "one operator" vs as the cross-product + filter pair

**2. Outer Joins (10 min)**
- Left, right, full outer — and the NULL columns they introduce
- The cases where outer joins replace difference (−)

**3. Division ÷ (8 min)**
- "Find Xs that match every Y" pattern
- Why ÷ shows up in entitlement and inventory queries

**4. Extended Algebra (15 min)**
- Aggregation γ
- Sorting τ
- Generalized projection π with computed attributes
- Duplicate elimination δ

**5. Wrap-up (7 min)**
- SQL ↔ algebra round-trip
- Preview of ER on Wednesday

### Action Items
- Read Textbook Ch. 2.5
- Complete the Wed Aug 26 handout if you have not

---

## Day 6 (Wednesday, September 2): Entity-Relationship Modeling

### Topics (50 min)

**1. Why ER Comes Before SQL (5 min)**
- Designing in tables makes you commit too early
- ER lets you reason in concepts

**2. Entities, Attributes, Relationships (12 min)**
- Strong vs weak entities
- Simple, composite, derived, multi-valued attributes
- Binary, ternary, n-ary relationships

**3. Cardinality and Participation (12 min)**
- One-to-one, one-to-many, many-to-many
- Total vs partial participation
- ISA hierarchies

**4. Diagramming Conventions (10 min)**
- Chen notation (the textbook's choice)
- Crow's foot notation (the industry default)
- UML class diagrams as a third option

**5. A Worked Example (11 min)**
- The university domain we have been using
- Drawing it from interview transcripts

### Action Items
- Read Textbook Ch. 4.1-4.5
- Project 1 specification posted Wednesday

---

## Day 7 (Friday, September 4): ER to Relations

### Topics (50 min)

**1. The Translation Rules (15 min)**
- Strong entity → table with primary key
- Weak entity → table with composite key including owner key
- 1:1, 1:N, M:N relationship translation
- Multi-valued attribute → separate table

**2. Worked Translation (15 min)**
- Walk the university ER diagram into a SQL DDL script
- Discuss each design choice

**3. Tradeoffs the Rules Hide (10 min)**
- When to embed an attribute vs separate it
- ISA hierarchy: single table, joined table, or class table inheritance
- The cost we pay during translation that Week 4 will fix with normalization

**4. Wrap-up + Project 0 Due (10 min)**
- Project 0 submission demo
- Looking ahead to FDs and normalization

### Action Items
- Read Textbook Ch. 4.5-4.6
- **Project 0 due tonight at 11:59 PM**

---

## Looking Ahead to Week 4

Labor Day Monday Sep 7 closes the week to two meetings.

- **Wed Sep 9** — Functional Dependencies: Armstrong's axioms, closure computation, key derivation
- **Fri Sep 11** — Normal Forms: 1NF → BCNF, lossless and dependency-preserving decomposition; **Quiz 1** closes Section 1
