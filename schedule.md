---
layout: default
---

# Course Schedule - Fall 2026

## Key Dates

- **Classes Begin:** August 20, 2026
- **Labor Day (no class):** September 7, 2026
- **Veterans Day (no class):** November 11, 2026
- **Thanksgiving Break:** November 23-28, 2026
- **Classes End:** December 2, 2026
- **Finals:** December 5-11, 2026

---

## Assignments

| Assignment | Due Date | Points | Description |
|------------|----------|--------|-------------|
| Assignment 0 | Sep 1, 11:59 PM | 25 | PostgreSQL & DuckDB setup, basic SQL |
| Assignment 1 | Sep 18, 11:59 PM | 75 | Relational algebra, schema design, normalization |
| Assignment 2 | Oct 9, 11:59 PM | 75 | Indexing and storage analysis |
| Assignment 3 | Oct 30, 11:59 PM | 75 | Query optimization and execution plans |
| Assignment 4 | Nov 20, 11:59 PM | 75 | Transactions and concurrency control |

## Project Milestones

| Milestone | Due Date | Points | Description |
|-----------|----------|--------|-------------|
| Project Proposal | Sep 25, 11:59 PM | 50 | Problem statement and database design |
| Checkpoint | Oct 23, 11:59 PM | 75 | Working prototype with schema and queries |
| Final Report | Dec 2, 11:59 PM | 125 | Complete report and presentation |

*More details will be released as the semester progresses.*

---

## Weekly Schedule

### Week 0: Course Introduction (Aug 21)

| Day | Topic | Activity |
|-----|-------|----------|
| Fri | Course Introduction | Syllabus, expectations, software setup |

**Assigned:** Assignment 0

---

### Week 1: Relational Model and SQL Fundamentals (Aug 24, 26, 28)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | The Relational Model | Relations, tuples, keys, constraints |
| Wed | Relational Algebra | Selection, projection, joins, set operations |
| Fri | SQL Basics with PostgreSQL | CREATE, INSERT, SELECT, WHERE, GROUP BY |

**Reading:** Silberschatz Ch. 1-2, 6

---

### Week 2: Database Design and Normalization (Aug 31, Sep 2, 4)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Entity-Relationship Modeling | ER diagrams, mapping to relations |
| Wed | Functional Dependencies | Armstrong's axioms, closure algorithms |
| Fri | Normal Forms | 1NF through BCNF, decomposition |

**Due:** Assignment 0 (Sep 1)
**Reading:** Silberschatz Ch. 7-8

---

### Week 3: Storage and File Organization (Sep 9, 11)

*Monday Sep 7 - Labor Day, no class*

| Day | Topic | Activity |
|-----|-------|----------|
| Wed | Disk Storage and File Organization | Pages, records, heap files, sorted files |
| Fri | Row Stores vs Column Stores | PostgreSQL (row) vs DuckDB (columnar) architecture |

**Reading:** Silberschatz Ch. 13

---

### Week 4: Buffer Management and Memory (Sep 14, 16, 18)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Buffer Pool Management | Replacement policies, pin/unpin, dirty pages |
| Wed | Memory Management Strategies | Clock replacement, LRU, DuckDB buffer manager |
| Fri | Advanced SQL Workshop | Window functions, CTEs, analytical queries in DuckDB |

**Assigned:** Assignment 1 (due Sep 18), Project Proposal (due Sep 25)
**Reading:** Silberschatz Ch. 13.5

---

### Week 5: Indexing I (Sep 21, 23, 25)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | B+ Tree Structure | Insertion, deletion, search, bulk loading |
| Wed | B+ Tree Analysis | Cost analysis, fan-out, height calculations |
| Fri | Hash-Based Indexing | Static hashing, extendible hashing, linear hashing |

**Due:** Project Proposal (Sep 25)
**Reading:** Silberschatz Ch. 14

---

### Week 6: Indexing II and External Sorting (Sep 28, 30, Oct 2)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | PostgreSQL Indexing | CREATE INDEX, EXPLAIN ANALYZE, GiST, GIN |
| Wed | External Sorting | Two-way merge sort, multi-way merge sort |
| Fri | Hashing for Grouping and Joins | Hash partitioning, grace hash join |

**Reading:** Silberschatz Ch. 14-15

---

### Week 7: Join Algorithms (Oct 5, 7, 9)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Nested Loop Joins | Simple, block, index nested loop |
| Wed | Sort-Merge Join and Hash Join | Algorithm analysis and comparison |
| Fri | Join Performance Lab | PostgreSQL and DuckDB join strategies (EXPLAIN) |

**Due:** Assignment 2 (Oct 9)
**Reading:** Silberschatz Ch. 15

---

### Week 8: Query Processing and Execution (Oct 12, 14, 16)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Iterator Model (Volcano) | Open-next-close, pipelining |
| Wed | Vectorized Execution | Batch processing, DuckDB's execution engine |
| Fri | **Midterm Review** | Review session |

**Due:** Project Checkpoint (Oct 23)

---

### Week 9: Midterm and Query Optimization (Oct 19, 21, 23)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | **Midterm Exam** | Covers Weeks 0-8 |
| Wed | Query Optimization Overview | Equivalence rules, logical plan enumeration |
| Fri | Cost-Based Optimization | Selectivity estimation, catalog statistics |

**Due:** Project Checkpoint (Oct 23)
**Reading:** Silberschatz Ch. 16

---

### Week 10: Query Optimization II and Transactions (Oct 26, 28, 30)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Query Plan Selection | Dynamic programming, System R optimizer |
| Wed | PostgreSQL and DuckDB Optimizers | EXPLAIN output comparison and analysis |
| Fri | Transaction Concepts | ACID properties, serializability, schedules |

**Due:** Assignment 3 (Oct 30)
**Reading:** Silberschatz Ch. 16-17

---

### Week 11: Concurrency Control (Nov 2, 4, 6)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Lock-Based Protocols | Two-phase locking, deadlock detection |
| Wed | Timestamp and Validation Protocols | Timestamp ordering, optimistic concurrency |
| Fri | Multi-Version Concurrency Control | MVCC in PostgreSQL, snapshot isolation |

**Reading:** Silberschatz Ch. 18

---

### Week 12: Recovery and Logging (Nov 9, 13)

*Wednesday Nov 11 - Veterans Day, no class*

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Write-Ahead Logging | Log records, undo/redo, checkpointing |
| Fri | ARIES Recovery Algorithm | Analysis, redo, undo phases; PostgreSQL WAL |

**Due:** Assignment 4 (Nov 20)
**Reading:** Silberschatz Ch. 19

---

### Week 13: Distributed Databases (Nov 16, 18, 20)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Distributed Storage and Queries | Partitioning, replication, distributed joins |
| Wed | Distributed Transactions | Two-phase commit, consensus |
| Fri | CAP Theorem and Modern Tradeoffs | Consistency models, eventual consistency |

**Due:** Assignment 4 (Nov 20)
**Reading:** Silberschatz Ch. 20-21

---

### Thanksgiving Break (November 23-28)

*No classes. Enjoy your break!*

---

### Week 15: Modern Systems and Review (Nov 30, Dec 2)

| Day | Topic | Activity |
|-----|-------|----------|
| Mon | Column Stores and Analytical Processing | DuckDB architecture, Parquet, data lakes |
| Wed | Course Review and Presentations | Project presentations, final exam review |

**Due:** Final Report (Dec 2)

---

### Finals Period (December 5-11)

- **Final Exam** (date/time TBA per UF exam schedule)

---

[back](index)
