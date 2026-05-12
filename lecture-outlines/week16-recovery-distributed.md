# Week 16: MVCC, Recovery, Distributed, and Course Wrap

## Overview

The final two lectures.
Monday introduces MVCC and snapshot isolation — the answer that lets PostgreSQL run high concurrency without locking every read.
Wednesday closes the textbook with recovery (WAL + ARIES) and a one-class survey of distributed and modern systems.
The Final Exam runs during the Dec 5-11 finals window; the Final Project is due Wed Dec 9.

**Learning Objectives:**

- Explain multi-version concurrency control and why it makes reads lock-free
- Read PostgreSQL's `xmin`, `xmax`, and tuple-visibility rules
- Describe snapshot isolation and the anomalies it allows vs disallows
- State the write-ahead log invariant and the three phases of ARIES recovery
- Recognize the architecture choices in modern distributed databases (Spanner, CockroachDB, Snowflake)
- Place PostgreSQL and DuckDB on the modern systems map

---

## Day 38 (Monday, November 30): MVCC and Snapshot Isolation

### Topics (50 min)

**1. Why MVCC (8 min)**
- The locking-everything cost
- Readers don't block writers; writers don't block readers
- The version-chain idea

**2. The Mechanics (15 min)**
- `xmin`, `xmax`, transaction snapshots
- Visibility rules
- How a single row gets multiple physical versions

**3. PostgreSQL VACUUM (10 min)**
- Dead tuples and bloat
- Autovacuum
- The "vacuum is not optional" lesson

**4. Snapshot Isolation Anomalies (10 min)**
- Write skew (the textbook canonical anomaly)
- Why standard SI is not serializable
- PostgreSQL's SSI fix

**5. Wrap (7 min)**
- Wednesday: recovery + distributed
- Final Project work intensifies

### Action Items
- Read GMW Ch. 18.7-18.9
- Read PostgreSQL docs [Ch. 13.4 Caveats](https://www.postgresql.org/docs/current/applevel-consistency.html) and [Ch. 25.1 Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html)

---

## Day 39 (Wednesday, December 2): Recovery, Distributed, Modern, Course Wrap

### Topics (50 min)

**1. The Crash Problem (5 min)**
- Why durability needs more than just writing to disk
- Buffer pool + dirty pages + crash = ?

**2. Write-Ahead Log (10 min)**
- The WAL invariant: log the change before applying it
- Log records and the log sequence number (LSN)
- PostgreSQL's `pg_wal` directory

**3. ARIES Recovery (12 min)**
- Mohan 1992 (featured paper)
- Three phases: analysis, redo, undo
- Why this still runs in 2026

**4. Distributed Databases (8 min)**
- Sharding and replication
- Two-phase commit
- Spanner, CockroachDB

**5. Modern Systems and DuckDB Paper (8 min)**
- Lakehouses, vector DBs, semantic operators
- Raasveldt & Mühleisen, *DuckDB: An Embeddable Analytical Database*, SIGMOD 2019

**6. Course Wrap (5 min)**
- What you can now do
- Final Exam logistics

**7. Final Project (2 min)**
- Due Wed Dec 9
- Capstone presentations in finals window

### Action Items
- Read Mohan et al., [*ARIES*](https://ufdatastudio.com/cop5725fa26/papers/pdfs/mohan1992.pdf), ACM TODS 17(1), 1992
- Read Raasveldt & Mühleisen, [*DuckDB*](https://ufdatastudio.com/cop5725fa26/papers/pdfs/raasveldt2019.pdf), SIGMOD 2019
- **Final Project due Wed Dec 9 at 11:59 PM**

---

## Finals Week (December 5-11)

- **Final Exam:** scheduled in the Dec 5-11 window per UF's finals schedule
- **Final Project:** due Wed Dec 9 at 11:59 PM
- **Final Project presentations:** during the assigned final exam block (or via recorded demo)

Practice Final Exam packet released Wed Dec 2 as `practice-exams/exam3-final.md`.
