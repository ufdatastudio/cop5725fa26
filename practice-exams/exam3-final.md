---
layout: default
---

# Final Exam Practice Packet

**Coverage:** Cumulative across all seven sections.
**Released:** Wednesday, December 2, 2026.
**Final Exam:** Friday, December 11, 2026, 10:00 AM-12:00 PM in MALA 1000.

Solutions live in [`exam3-final-solutions.md`](exam3-final-solutions.md).

> Format and difficulty match the real exam. Topic mix:
> - 30% Sections 6-7 (transactions, concurrency, recovery, distributed, modern)
> - 30% Sections 4-5 (storage, indexing, query processing, optimization)
> - 25% Sections 1-3 (relational model, SQL, programming)
> - 15% short answer + paper recall (Codd, C-Store, ARIES, DuckDB, Leis 2015)

---

## Problem 1 — ACID and Anomalies

Define each ACID property in one sentence.

For each anomaly below, name the lowest PostgreSQL isolation level that prevents it:

1. Dirty read
2. Lost update
3. Non-repeatable read
4. Phantom read
5. Write skew

---

## Problem 2 — MVCC

For each statement, mark TRUE or FALSE and give one sentence of justification.

1. PostgreSQL's UPDATE modifies the tuple in place.
2. After `DELETE`, the row is immediately removed from disk.
3. A reader in PostgreSQL never blocks waiting on a writer holding an X lock on a row.
4. `VACUUM FULL` requires an exclusive lock on the table.
5. Snapshot isolation prevents all anomalies.

---

## Problem 3 — Conflict Serializability

Given the schedule:

```
T1: r(A)            w(B)
T2:       w(A) r(B)
```

1. Build the conflict graph.
2. Is this schedule conflict serializable? Justify.

---

## Problem 4 — Deadlock

T1 holds `X(A)` and wants `S(B)`.
T2 holds `X(B)` and wants `S(A)`.

1. Draw the wait-for graph.
2. What does PostgreSQL do? In how much time? What error does the application see?

---

## Problem 5 — Recovery (ARIES)

A crash occurs. The log contains:

```
LSN  TX     Type     Table  Old   New
100  T1     UPDATE   acc    100   200
105  T1     COMMIT
110  T2     UPDATE   acc    200   150
115  CHECKPOINT
120  T2     UPDATE   acc    150   80
125  T3     UPDATE   acc    80    60
```

The system crashes after LSN 125 with no commits beyond LSN 105.

1. Which transactions are committed? Which are not?
2. After the redo phase, what is `acc`?
3. After the undo phase, what is `acc`?

---

## Problem 6 — Index Selection

For each column on a 10 million-row table, name the best PostgreSQL index type and justify in one sentence:

1. `user_id BIGINT` — only equality lookups
2. `created_at TIMESTAMPTZ` — append-only table, range queries
3. `tags TEXT[]` — array contains queries
4. `email TEXT` — equality on `lower(email)`
5. `is_active BOOLEAN` — 99% are inactive, queries usually want active

---

## Problem 7 — Join Algorithms

You have:
- `users` table: 1 million rows, 50 MB
- `orders` table: 100 million rows, 50 GB
- `work_mem`: 256 MB
- Both tables have a btree index on `user_id`

For the query `SELECT u.name, o.total FROM users u JOIN orders o USING (user_id) WHERE u.country = 'US'`:

1. Estimate which join algorithm PostgreSQL picks.
2. State the dominant cost (in pages or rows).
3. If `users.country = 'US'` matches 200,000 rows, does the answer change?

---

## Problem 8 — Optimization

```sql
SELECT s.name, count(*)
FROM student s
JOIN enrollment e ON e.sid = s.sid
WHERE s.gpa > 3.5 AND e.grade = 'A'
GROUP BY s.name;
```

1. Draw the logical plan tree.
2. Apply selection pushdown and projection pushdown. Show the resulting tree.
3. State one further equivalence rule the optimizer might apply.

---

## Problem 9 — Advanced SQL

Write a single PostgreSQL query for each:

1. Top-3 students by GPA per major, with ties broken alphabetically. Use a window function.
2. A 7-day moving average of daily enrollments. Use an explicit frame.
3. Find every faculty member who reports (transitively) to "Dr. Provost". Use a recursive CTE.

---

## Problem 10 — Storage

A row is 250 bytes; the page is 8 KB; there are 50 million rows.

1. How many pages does the table occupy (assuming 100-byte page overhead)?
2. The table has a btree index on `sid` (8 bytes) with fan-out 250. What's its height?
3. A point lookup with the index: how many page reads?

---

## Problem 11 — Featured Papers

For each paper, give the central idea in one sentence:

1. Codd 1970 — *A Relational Model of Data for Large Shared Data Banks*
2. Selinger 1979 — *Access Path Selection in a Relational Database Management System*
3. Mohan 1992 — *ARIES*
4. Stonebraker 2005 — *C-Store: A Column-oriented DBMS*
5. Leis 2015 — *How Good Are Query Optimizers, Really?*
6. Raasveldt & Mühleisen 2019 — *DuckDB: An Embeddable Analytical Database*

---

## Problem 12 — Open-Ended Design

You are asked to design a database for **real-time sports analytics**:
- 50,000 events per second ingested during games
- Analysts run queries on the last 30 days at any time
- Dashboards update once per second
- Historical archive of 10 years required

In 150 words, sketch the architecture: what engines, what indexes, what isolation, what replication, what storage formats.

---

## Logistics

- 90 minutes
- Closed notes
- Bring two pens; the exam is hand-written
- Scratch paper provided
- Calculator unnecessary

Good luck.

[back](../index)
