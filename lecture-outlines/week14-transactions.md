# Week 14: Transactions, ACID, Two-Phase Locking + Exam 2

## Overview

Section 6 opens.
Monday introduces transactions and ACID; Wednesday is Exam 2 (Sections 4-5); Friday covers two-phase locking.
Project 3 small-group presentations run Monday; winners present Friday.

**Learning Objectives:**

- Define a transaction and the four ACID properties
- Distinguish serial, serializable, and conflict-serializable schedules
- Build and analyze a conflict graph; recognize when a schedule is conflict-serializable
- Identify the four classic anomalies (dirty read, lost update, non-repeatable read, phantom)
- State strict two-phase locking and reason about its safety guarantees
- Detect deadlocks and pick a victim
- Read PostgreSQL's `pg_locks` to diagnose contention

---

## Day 35 (Monday, November 16): Transactions and ACID

### Topics (40 min lecture + 10 min Project 3 group breakouts)

**1. The Transaction Concept (8 min)**
- Bank transfer as canonical example
- BEGIN, COMMIT, ROLLBACK
- Why the database needs the abstraction

**2. ACID (10 min)**
- Atomicity, Consistency, Isolation, Durability
- Each property in one sentence

**3. Schedules and Conflicts (12 min)**
- Serial vs serializable vs conflict-serializable
- Read/write conflict pairs
- The conflict graph

**4. Anomalies (8 min)**
- Dirty read
- Lost update
- Non-repeatable read
- Phantom

**5. Wrap and Project 3 Presentations (12 min)**

### Action Items
- Read GMW Ch. 18.1-18.3
- Project 3 presentations Monday; winners present Friday
- Exam 2 Wednesday

---

## Day 36 (Wednesday, November 18): Exam 2

**50 minutes.** Covers Sections 4-5: storage, indexing, sorting, joins, iterator/vectorized execution, optimization.

Closed notes. Bring a pen.

Practice packet (`practice-exams/exam2.md`) is the best preparation.

---

## Day 37 (Friday, November 20): Two-Phase Locking

### Topics (40 min lecture + 10 min Project 3 winners)

**1. The Locking Idea (5 min)**
- Hand the resource to one transaction at a time
- Shared vs exclusive locks

**2. Strict 2PL (12 min)**
- The growing and shrinking phases
- Why "strict" — release locks at commit/rollback
- Safety guarantees: serializability + recoverability

**3. Deadlocks (10 min)**
- The wait-for graph
- Detection vs prevention vs timeout
- PostgreSQL's deadlock detection

**4. Lock Granularity and Phantoms (8 min)**
- Row vs page vs table locks
- Phantoms and predicate locks
- PostgreSQL's serializable isolation (SSI) preview

**5. pg_locks and Production (5 min)**
- Querying current locks
- Detecting blockers

### Action Items
- Read GMW Ch. 18.4-18.5
- Read PostgreSQL docs [Ch. 13.3 Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)

---

## Looking Ahead to Weeks 15-16

- **Week 15 (Nov 23-28):** Thanksgiving — no classes
- **Mon Nov 30:** MVCC, Snapshot Isolation
- **Wed Dec 2:** Recovery (WAL, ARIES) + Distributed + Modern; **Final Project released**
- **Dec 5-11:** Finals — Final Exam Fri Dec 11, 10:00 AM-12:00 PM (cumulative); Final Project due Wed Dec 9
