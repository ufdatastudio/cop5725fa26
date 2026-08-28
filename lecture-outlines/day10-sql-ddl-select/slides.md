---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management Systems - Fall 2026'
math: katex
html: true
---

<!-- _class: lead -->

# Day 10: SQL DDL and Basic SELECT

**COP 5725 - Database Management Systems**
Monday, September 14, 2026

Section 2 opens with the working SQL surface

<!--
First class of Section 2. Section 1 is graded, Quiz 1 results are back. Open by acknowledging the transition into SQL.
Pace: 50 min. Spend the first 8 minutes on the doc-reading section even though it feels like overhead. It pays off through the whole semester.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Section 1 covered why relational systems work the way they do.
Section 2 covers how to use them, and the vehicle is SQL.

The section runs three weeks and nine meetings, ending with Quiz 2 on Oct 2.

Today covers DDL, single-table SELECT, predicates, and ordering.

</div>
<div>

```mermaid
graph TB
  S1["Section 1<br/>(done)"]
  S2A["Week 5<br/>Basic SQL"]
  S2B["Week 6<br/>Subqueries, CTEs"]
  S2C["Week 7<br/>Windows, Recursion"]
  Q2["Quiz 2<br/>Oct 2"]
  S1 --> S2A
  S2A --> S2B
  S2B --> S2C
  S2C --> Q2
  classDef done fill:#e8f5e9,stroke:#388e3c
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef next fill:#e3f2fd,stroke:#1976d2
  classDef milestone fill:#ffebee,stroke:#c62828
  class S1 done
  class S2A now
  class S2B,S2C next
  class Q2 milestone
```

</div>
</div>

<!--
Keep this transition short. Section 1 material is graded and closed; today starts the SQL section. The diagram carries the three-week arc, so the prose only needs the schedule facts.
-->

---

# Today's Roadmap

```mermaid
graph LR
  D["1. PostgreSQL<br/>docs"] --> DDL["2. DDL:<br/>CREATE, ALTER, DROP"]
  DDL --> S["3. SELECT:<br/>basics"]
  S --> P["4. Predicates,<br/>DISTINCT, ORDER BY"]
  P --> W["5. Example<br/>queries"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class D,DDL,S,P,W step
```

The first stop is the documentation itself. Reading the docs well is a skill we use all semester.

---

<!-- _class: lead -->

# Part 1: The PostgreSQL Documentation

---

# One Authoritative Reference

<div class="columns">
<div>

There is no single SQL.

| Year | Standard | What changed |
|------|----------|--------------|
| 1986 | SQL-86 | first ANSI standard |
| 1992 | SQL-92 | outer joins, CHECK |
| 1999 | SQL:1999 | recursion, OLAP, triggers |
| 2003 | SQL:2003 | window functions, XML |
| 2016 | SQL:2016 | row pattern matching, JSON |
| 2023 | SQL:2023 | property graph queries |

Every engine implements a different subset.

</div>
<div>

> We anchor on the **PostgreSQL 16 documentation** as the authoritative reference for this course.

PostgreSQL has the most thorough, accessible docs of any production engine, and you will run against PostgreSQL for projects, so you can verify everything you read.

[postgresql.org/docs/current](https://www.postgresql.org/docs/current/)

</div>
</div>

<!--
This framing matters: students often hold an implicit "SQL is one thing" model from intro classes. Surfacing the version history once now prevents months of "but the docs I read said..." confusion when they bump into Oracle or MySQL syntax later.
-->

---

# The Structure of the Docs

```mermaid
graph TB
  P1["Part I<br/>Tutorial"]
  P2["Part II<br/>The SQL Language"]
  P3["Part III<br/>Server Admin"]
  P4["Part IV<br/>Client Interfaces"]
  P5["Part V<br/>Server Programming"]
  P6["Part VI<br/>Reference"]
  P2 --> Q["Ch. 7 Queries"]
  P2 --> F["Ch. 9 Functions"]
  P2 --> I["Ch. 11 Indexes"]
  P6 --> SQL["SQL Commands"]
  classDef part fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  classDef chap fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class P1,P2,P3,P4,P5,P6 part
  class Q,F,I,SQL chap
```

<!--
Most undergrad students never venture past Part I (the tutorial). Section 2 will live in Part II (Ch. 7) and Part VI (SQL Commands). Part III through V is server administration and extension; useful but outside our scope.
-->

---

# Reading SQL Syntax Notation

The Reference section uses a consistent notation:

```
SELECT [ ALL | DISTINCT [ ON ( expression [, ...] ) ] ]
    [ * | expression [ [ AS ] output_name ] [, ...] ]
    [ FROM from_item [, ...] ]
    [ WHERE condition ]
    [ GROUP BY ... ]
    [ HAVING condition ]
    [ ORDER BY expression [ ASC | DESC ] [, ...] ]
    [ LIMIT { count | ALL } ]
```

<div class="columns-3">
<div>

### `[ ... ]`
Optional. Brackets do not appear in the actual SQL.

</div>
<div>

### `|`
Choose one of the alternatives.

</div>
<div>

### `[, ...]`
The preceding element may repeat, separated by commas.

</div>
</div>

<!--
This BNF-like notation is universal in DB documentation. Once you can read it, every command page tells you everything in 10 seconds. The brackets-are-optional rule is the most-missed piece for new readers.
-->

---

# A Doc Read

<div class="doc">

**Task:** "Look up how to limit the number of rows returned by a SELECT."

**Steps:**

1. Open the docs at [postgresql.org/docs/current/sql-select.html](https://www.postgresql.org/docs/current/sql-select.html)
2. Search the page for `LIMIT`
3. Read the synopsis line: `[ LIMIT { count | ALL } ]`
4. Skip to the LIMIT section for prose

</div>

The synopsis shows that LIMIT is optional and that it takes either a count or the word ALL. The prose below it gives the semantics.

The whole exercise takes 90 seconds. Treat it as the first reflex when you forget syntax.

<!--
Do this live on the projector. The "I'll grep the SQL command page" reflex is the most useful habit a SQL writer develops; build it in students by demonstrating it now.
-->

---

<!-- _class: lead -->

# Part 2: DDL

<div class="caption">

DDL, the Data Definition Language, is the part of SQL that defines and changes schemas (CREATE, ALTER, DROP, TRUNCATE).

</div>

---

# CREATE TABLE Recap

```sql
CREATE TABLE student (
  sid   bigint        PRIMARY KEY,
  name  text          NOT NULL,
  gpa   numeric(3, 2) CHECK (gpa BETWEEN 0 AND 4.0),
  dname text          REFERENCES department(dname)
);
```

We met this on Day 7. The PostgreSQL reference for the full syntax is at [postgresql.org/docs/current/sql-createtable.html](https://www.postgresql.org/docs/current/sql-createtable.html).

A few features the synopsis surfaces:

- `IF NOT EXISTS` makes creation idempotent (a second run changes nothing)
- `TEMPORARY` and `UNLOGGED` create non-durable variants
- `PARTITION OF` declares partitioning (we return to this in Section 4)
- `INHERITS` is a PostgreSQL extension for table inheritance

---

# Constraint Forms

```sql
-- Column-level constraints
CREATE TABLE example (
  id      bigint PRIMARY KEY,
  email   text   NOT NULL UNIQUE,
  age     int    CHECK (age >= 0),
  dname   text   REFERENCES department(dname) ON DELETE SET NULL
);

-- Named table-level constraints
CREATE TABLE enrollment (
  sid bigint REFERENCES student(sid),
  cid text   REFERENCES course(cid),
  CONSTRAINT enrollment_pkey PRIMARY KEY (sid, cid),
  CONSTRAINT valid_grade CHECK (grade IS NULL OR grade IN ('A','B','C','D','F'))
);
```

<div class="columns">
<div>

### When to name
Named constraints produce readable error messages and survive `ALTER TABLE` cleanly.

</div>
<div>

### When to use ON DELETE
Pick the referential action that matches reality: `CASCADE`, `SET NULL`, `RESTRICT`, `NO ACTION`.

</div>
</div>

Reference: [postgresql.org/docs/current/ddl-constraints.html](https://www.postgresql.org/docs/current/ddl-constraints.html).

---

# Schema Evolution with ALTER TABLE

```sql
ALTER TABLE student ADD COLUMN graduation_year int;
ALTER TABLE student DROP COLUMN dname;
ALTER TABLE student ALTER COLUMN name SET NOT NULL;
ALTER TABLE student RENAME COLUMN name TO full_name;
ALTER TABLE student ADD CONSTRAINT gpa_valid CHECK (gpa BETWEEN 0 AND 4.0);
```

<div class="error">

**Production warning:** Each `ALTER TABLE` may rewrite the table or take an exclusive lock. Read [postgresql.org/docs/current/sql-altertable.html](https://www.postgresql.org/docs/current/sql-altertable.html) carefully before running on a live system.

</div>

Most of Project 1 is `CREATE`. Live systems are mostly `ALTER`. The difference in stakes is real.

<!--
The "ALTER TABLE is dangerous on production" warning is worth landing now even though Project 1 is greenfield. Later in their careers students will encounter migration tools (Flyway, Alembic, Postgres pg_repack) that exist exactly to mitigate this issue.
-->

---

# DROP TABLE vs TRUNCATE

<div class="columns">
<div>

### DROP TABLE

```sql
DROP TABLE student;
DROP TABLE IF EXISTS student CASCADE;
```

Removes the table and its data.
`CASCADE` removes dependent objects (views, FKs).

</div>
<div>

### TRUNCATE

```sql
TRUNCATE student;
TRUNCATE student RESTART IDENTITY;
TRUNCATE student CASCADE;
```

Removes **all rows**, keeps the table.
Faster than `DELETE` because it skips per-row WAL.

</div>
</div>

`TRUNCATE` is a Postgres extension to standard SQL with its own semantics around triggers and FKs. Reference: [postgresql.org/docs/current/sql-truncate.html](https://www.postgresql.org/docs/current/sql-truncate.html).

<div class="small">

WAL is the write-ahead log, the journal PostgreSQL writes before touching data pages; Section 6 studies it.

</div>

<!--
DELETE FROM table can take an hour on a billion-row table; TRUNCATE on the same table runs in milliseconds. The difference is huge once datasets get nontrivial.
-->

---

<!-- _class: lead -->

# Part 3: Single-Table SELECT

---

# The Six Clauses of SELECT

```sql
SELECT  column_or_expression, ...
FROM    table
WHERE   row_predicate
ORDER BY column [ASC|DESC], ...
LIMIT   count
OFFSET  count;
```

The order you write the clauses differs from the order the engine evaluates them. We see the difference on Day 12.

Reference: [postgresql.org/docs/current/sql-select.html](https://www.postgresql.org/docs/current/sql-select.html).

<!--
Don't drill on order-of-eval yet — it's a Day 12 topic. Today is about understanding what each clause does in isolation. Reserve the trick "WHERE filters before SELECT, so SELECT aliases can't appear in WHERE" for Friday.
-->

---

# SELECT List

```sql
-- All columns
SELECT * FROM student;

-- Explicit projection
SELECT sid, name FROM student;

-- Computed columns
SELECT name, gpa * 25 AS percent FROM student;

-- Column aliases
SELECT name AS full_name FROM student;
```

`SELECT *` is convenient for exploration but discouraged in production code, because column order changes silently when the schema evolves.

---

# WHERE Predicates

<div class="columns">
<div>

```sql
WHERE gpa >= 3.5
WHERE gpa BETWEEN 3.0 AND 4.0
WHERE name LIKE 'A%'
WHERE name ILIKE '%lovelace%'
WHERE name SIMILAR TO 'A%(da|lan)'
WHERE major IN ('CS', 'EE')
WHERE grade IS NULL
WHERE gpa IS NOT NULL AND gpa < 2.0
```

</div>
<div>

### PostgreSQL specifics

- `ILIKE` is case-insensitive `LIKE`
- `SIMILAR TO` mixes LIKE and regex syntax (rarely used)
- `~` and `~*` match POSIX regular expressions
- `IS DISTINCT FROM` compares NULL-safely

Reference: [postgresql.org/docs/current/functions-matching.html](https://www.postgresql.org/docs/current/functions-matching.html).

</div>
</div>

---

# NULL in WHERE

```sql
SELECT count(*) FROM enrollment;                       -- 100
SELECT count(*) FROM enrollment WHERE grade = 'A';     -- 10
SELECT count(*) FROM enrollment WHERE grade <> 'A';    -- 30
-- 60 rows with grade IS NULL match neither.
```

<div class="columns">
<div>

### To match "anything that isn't A, including in-progress"

```sql
WHERE grade IS DISTINCT FROM 'A';
```

PostgreSQL's NULL-safe inequality. Treats NULL as a distinct value.

</div>
<div>

### To match "anything not A, ignoring in-progress"

```sql
WHERE grade <> 'A' AND grade IS NOT NULL;
```

Explicit NULL handling.

</div>
</div>

`IS DISTINCT FROM` is PostgreSQL-friendly shorthand. Use it whenever you want NULL to behave like any other value in a comparison.

<!--
This is one of the most useful PostgreSQL features for new SQL writers. The SQL standard added IS DISTINCT FROM in SQL:1999 but many engines don't implement it. PostgreSQL does. Worth the 30 seconds of class time.
-->

---

# DISTINCT, ORDER BY, LIMIT

```sql
-- Unique majors
SELECT DISTINCT major FROM student;

-- Top 5 by GPA
SELECT name, gpa FROM student
ORDER BY gpa DESC
LIMIT 5;

-- Pagination
SELECT name FROM student
ORDER BY sid
LIMIT 20 OFFSET 40;
```

<div class="interactive">

**Your turn:** What is wrong with this query for "second page of 20 students alphabetically"?

```sql
SELECT name FROM student LIMIT 20 OFFSET 20;
```

</div>

<!--
Answer: no ORDER BY means the "second page" depends on the row order the executor chose, which can change with each run. Pagination without ORDER BY is meaningless; it's one of the most common production bugs.
-->

---

# Query 1: Top GPA in CS

> "List the top 3 CS-major students by GPA, name and GPA only."

```sql run
CREATE OR REPLACE TABLE student(sid INT, name TEXT, major TEXT, gpa DECIMAL(3,2));
INSERT INTO student VALUES
  (1,'Ada Lovelace','CS',3.9), (2,'Alan Turing','CS',3.7),
  (3,'Grace Hopper','EE',4.0), (4,'Edsger Dijkstra','CS',2.8),
  (5,'Barbara Liskov','EE',3.5), (6,'Donald Knuth','CS',4.0);
-- @query
SELECT name, gpa
FROM   student
WHERE  major = 'CS'
ORDER BY gpa DESC
LIMIT  3;
```

The mapping from English to SQL is mechanical. Run it, then edit the data and re-run.

---

# Query 2: Active Enrollments

> "Find all sections of COP5725 in any term where at least one student is still enrolled (grade is NULL)."

```sql run
CREATE OR REPLACE TABLE enrollment(
  sid INT, cid TEXT, term TEXT, section_num INT, grade TEXT);
INSERT INTO enrollment VALUES
  (1,'COP5725','Fall 2026',1,NULL), (2,'COP5725','Fall 2026',1,NULL),
  (3,'COP5725','Fall 2026',2,'A'), (4,'COP5725','Spring 2026',1,NULL),
  (5,'COP3530','Fall 2026',1,NULL);
-- @query
SELECT DISTINCT term, section_num
FROM   enrollment
WHERE  cid = 'COP5725'
  AND  grade IS NULL
ORDER BY term, section_num;
```

`DISTINCT` collapses multiple enrolled students into one (term, section_num) row.

---

# Query 3: Recent Hires

> "List faculty hired in the past five years, by name, salary descending."

```sql run
CREATE OR REPLACE TABLE faculty(name TEXT, salary INT, hire_date DATE);
INSERT INTO faculty VALUES
  ('Ada Byron',   152000, DATE '2024-08-16'),
  ('Tenured Ted', 168000, DATE '2008-01-10'),
  ('New Nadia',   128000, DATE '2025-08-18'),
  ('Mid Marcus',  141000, DATE '2017-03-01');
-- @query
SELECT name, salary, hire_date
FROM   faculty
WHERE  hire_date > current_date - interval '5 years'
ORDER BY salary DESC;
```

`current_date` and `interval` are PostgreSQL date arithmetic. Reference: [postgresql.org/docs/current/functions-datetime.html](https://www.postgresql.org/docs/current/functions-datetime.html).

---

# Common Errors

<div class="columns">
<div>

<div class="error">

### Forgetting quotes

```sql
WHERE major = CS         -- error: column CS does not exist
WHERE major = 'CS'       -- ok
```

PostgreSQL uses single quotes for strings, double quotes for identifiers.

</div>

</div>
<div>

<div class="error">

### Counting NULLs

```sql
SELECT count(grade) FROM enrollment;   -- ignores NULL
SELECT count(*)     FROM enrollment;   -- counts all rows
```

`count(col)` skips NULLs. `count(*)` does not.

</div>

</div>
</div>

<div class="error">

### Aliases in WHERE

```sql
SELECT name, gpa * 25 AS percent FROM student WHERE percent > 75;
-- error: column percent does not exist
```

`WHERE` runs before `SELECT`. We see why on Day 12.

</div>

---

# Wrap-up

- The PostgreSQL docs (Ch. 5, Ch. 7, SQL Commands) are the course's SQL reference
- DDL covers CREATE, ALTER, DROP, and TRUNCATE
- Single-table SELECT has six clauses
- Predicates build from comparison, LIKE, IN, IS NULL, and IS DISTINCT FROM
- DISTINCT, ORDER BY, LIMIT, and OFFSET shape the result
- NULL matches neither `= 'A'` nor `<> 'A'`

---

# Next Lecture

Wednesday covers joins.

Read PostgreSQL docs Ch. 7.2 before class.

---

# Practice Before Wednesday

Five queries to run against the university schema in your repo:

1. Find all departments whose name contains 'Computer'.
2. Find the highest-paid faculty member.
3. Count distinct majors.
4. List students with GPA strictly between 3.0 and 3.9, sorted by name.
5. Page 3 of student names alphabetically, 10 per page.

This is an exercise.

---

# Questions

What is on your mind?

Project 1 work continues. Due Fri Sep 25.

<!--
Common Day 10 questions: "Should I use TEXT or VARCHAR?" (TEXT in PostgreSQL — there's no practical difference, but TEXT signals "no arbitrary length limit" which is usually what you mean). "Should I use SERIAL or BIGSERIAL?" (BIGSERIAL or, in modern PG, GENERATED ALWAYS AS IDENTITY — covered in Day 3 follow-ups). "Do I need to know the exact PostgreSQL version?" (16 is the course version; PostgreSQL 17 was released in late 2024 and is also fine — features are stable across versions).
-->
