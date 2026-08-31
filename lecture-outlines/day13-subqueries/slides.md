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

# Day 13: Subqueries

**COP 5725 - Database Management Systems**
Monday, September 21, 2026

Scalar, table, and correlated subqueries, and their traps

<!--
Week 6 opens. Subqueries are the gateway drug to CTEs and window functions; today's job is making the three forms (scalar, table, correlated) explicit so Wednesday's CTE lecture lands cleanly. Pace 50 min, with the rewriting and error sections taking 20 of those minutes.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Week 5 covered joins, aggregation, and the logical pipeline.
Week 6 covers queries where the answer to one query is the input to another.

Today covers subqueries.
Wednesday covers CTEs, a cleaner way to write long subquery chains.
Friday covers window functions, a different answer to "subquery per row" problems.

</div>
<div>

```mermaid
graph TB
  S5["Week 5<br/>basic SQL"]
  SubQ["Today:<br/>Subqueries"]
  CTE["Wed:<br/>CTEs"]
  WIN["Fri:<br/>Windows"]
  S5 --> SubQ
  SubQ --> CTE
  CTE --> WIN
  classDef done fill:#e8f5e9,stroke:#388e3c
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef next fill:#e3f2fd,stroke:#1976d2
  class S5 done
  class SubQ now
  class CTE,WIN next
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  K["1. Three<br/>kinds"] --> P["2. IN, ANY,<br/>ALL"]
  P --> W["3. Where they<br/>appear"]
  W --> R["4. Rewriting<br/>patterns"]
  R --> E["5. Common<br/>errors"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class K,P,W,R,E step
```

Reference: PostgreSQL docs [Ch. 7.2.1.3 Subqueries](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-SUBQUERIES) and [Ch. 9.24 Subquery Expressions](https://www.postgresql.org/docs/current/functions-subquery.html).

---

<!-- _class: lead -->

# Part 1: Three Kinds of Subquery

---

# The Taxonomy

```mermaid
graph TB
  SC["Scalar<br/>(one value)"] --> SCEx["...= (SELECT max(...) FROM ...)"]
  T["Table<br/>(used in FROM)"] --> TEx["FROM (SELECT ...) AS t"]
  C["Correlated<br/>(refs outer row)"] --> CEx["WHERE EXISTS (SELECT 1 WHERE outer.x = ...)"]
  classDef kind fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef ex fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
  class SC,T,C kind
  class SCEx,TEx,CEx ex
```

Each form appears in a different location and carries its own pitfalls <span class="cite">(Textbook §6.3, p. 268)</span>.

---

# Scalar Subqueries

```sql run
CREATE OR REPLACE TABLE student(sid INT, name TEXT, dname TEXT, gpa DECIMAL(3,2));
INSERT INTO student VALUES
  (1,'Ada','CS',3.9), (2,'Bose','CS',3.1), (3,'Chen','CS',3.5),
  (4,'Devi','EE',3.8), (5,'Evan','EE',2.9), (6,'Fei','EE',3.4);
-- @query
-- "Students whose GPA exceeds the average"
SELECT name, gpa
FROM   student
WHERE  gpa > (SELECT avg(gpa) FROM student);
```

The inner query must return **exactly one row, one column** <span class="cite">(Textbook §6.3.1, p. 269)</span>. PostgreSQL raises an error at runtime if it returns more than one row.

```sql
-- "Each student plus the campus average"
SELECT name, gpa,
       (SELECT avg(gpa) FROM student) AS campus_avg
FROM   student;
```

Scalar subqueries can appear anywhere a value is allowed: `WHERE`, `SELECT` list, even `ORDER BY`.

<!--
The "exactly one row, one column" constraint is what makes the subquery *scalar*. If the inner query returns zero rows, the result is NULL (which is sometimes surprising). If it returns multiple rows, PostgreSQL throws ERROR: more than one row returned by a subquery used as an expression.
-->

---

# Table Subqueries

```sql run
CREATE OR REPLACE TABLE student(sid INT, name TEXT, dname TEXT, gpa DECIMAL(3,2));
INSERT INTO student VALUES
  (1,'Ada','CS',3.9), (2,'Bose','CS',3.1), (3,'Chen','CS',3.5), (4,'Devi','EE',3.8);
CREATE OR REPLACE TABLE enrollment(sid INT, cid TEXT);
INSERT INTO enrollment VALUES
  (1,'C1'),(1,'C2'),(1,'C3'), (2,'C1'),(2,'C2'), (3,'C1'),
  (4,'C1'),(4,'C2'),(4,'C3'),(4,'C4');
-- @query
-- Pre-aggregate, then join
SELECT s.name, ec.course_count
FROM   student s
JOIN (
  SELECT sid, count(*) AS course_count
  FROM   enrollment
  GROUP BY sid
) ec ON ec.sid = s.sid
WHERE  ec.course_count >= 3;
```

A `SELECT` inside `FROM` is just another table to the outer query <span class="cite">(Textbook §6.3.5, p. 274)</span>. **PostgreSQL requires an alias** for the derived table (here, `ec`).

The pre-aggregate-then-join pattern is one of the most useful shapes in SQL. It avoids the join multiplication trap from Day 11.

---

# Correlated Subqueries

```sql run
CREATE OR REPLACE TABLE student(sid INT, name TEXT, dname TEXT, gpa DECIMAL(3,2));
INSERT INTO student VALUES
  (1,'Ada','CS',3.9), (2,'Bose','CS',3.1), (3,'Chen','CS',3.5),
  (4,'Devi','EE',3.8), (5,'Evan','EE',2.9), (6,'Fei','EE',3.4);
-- @query
-- "Students with GPA above their department's average"
SELECT s.name, s.gpa, s.dname
FROM   student s
WHERE  s.gpa > (
  SELECT avg(s2.gpa)
  FROM   student s2
  WHERE  s2.dname = s.dname    -- correlation: references outer s
);
```

The inner query depends on the outer row <span class="cite">(Textbook §6.3.4, p. 273)</span>. The optimizer re-evaluates it (conceptually) for each outer row.

A correlated subquery is the SQL way to say "for each row, look up something specific to it."

<!--
Correlated subqueries are how most students first solve "compare each row to its group." It's almost always cleaner with a window function (Friday). Showing the correlated form now sets up the comparison.
-->

---

# Correlated Evaluation, Row by Row

<div class="columns">
<div>

**student** — outer row in hand: Ada

<table>
<thead><tr><th>name</th><th>dname</th><th>gpa</th></tr></thead>
<tbody>
<tr style="background:#F8BBD0"><td>Ada</td><td>CS</td><td>3.90</td></tr>
<tr style="background:#FFE082"><td>Bose</td><td>CS</td><td>3.10</td></tr>
<tr style="background:#FFE082"><td>Chen</td><td>CS</td><td>3.50</td></tr>
<tr><td>Devi</td><td>EE</td><td>3.80</td></tr>
<tr><td>Evan</td><td>EE</td><td>2.90</td></tr>
<tr><td>Fei</td><td>EE</td><td>3.40</td></tr>
</tbody>
</table>

<div class="small">

For Ada, the inner query reads every row with her `dname`, her own row included: avg = (3.90 + 3.10 + 3.50) / 3 = 3.50.

</div>

</div>
<div>

**one test per outer row**

<table>
<thead><tr><th>name</th><th>gpa</th><th>dept avg</th><th>gpa &gt; avg?</th></tr></thead>
<tbody>
<tr style="background:#E8F5E9"><td>Ada</td><td>3.90</td><td>3.50</td><td>yes</td></tr>
<tr><td>Bose</td><td>3.10</td><td>3.50</td><td>no</td></tr>
<tr><td>Chen</td><td>3.50</td><td>3.50</td><td>no</td></tr>
<tr style="background:#E8F5E9"><td>Devi</td><td>3.80</td><td>3.37</td><td>yes</td></tr>
<tr><td>Evan</td><td>2.90</td><td>3.37</td><td>no</td></tr>
<tr style="background:#E8F5E9"><td>Fei</td><td>3.40</td><td>3.37</td><td>yes</td></tr>
</tbody>
</table>

<div class="small">

The inner query reruns for each outer row, so every student is tested against their own department's average (EE's 3.37 is rounded).

</div>

</div>
</div>

<div class="small">

Pink is the outer row in hand, amber is what its inner query reads, and green is what the query returns.

</div>

<!--
Walk Ada's test out loud, then point at the right table where the department average changes at Devi's row — the inner query has been recomputed with dname = 'EE'. Chen is the strictness catch: 3.50 > 3.50 is false. Six outer rows means six inner evaluations; that cost sets up the rewriting section and Friday's window functions.
-->

---

<!-- _class: lead -->

# Part 2: IN, ANY, SOME, ALL

---

# Set-Membership Predicates

<div class="columns">
<div>

### IN

```sql
WHERE major IN ('CS', 'EE', 'Math')
WHERE sid IN (SELECT sid FROM enrollment)
```

`x IN (subquery)` is true when `x` equals at least one returned value.

</div>
<div>

### ANY (alias: SOME)

```sql
WHERE gpa > ANY (SELECT gpa FROM honor_roll)
```

`x op ANY (subquery)` is true when `op` holds for at least one returned value.

`x = ANY (...)` is the same as `x IN (...)`.

</div>
</div>

Reference: [Ch. 9.24 Subquery Expressions](https://www.postgresql.org/docs/current/functions-subquery.html).

---

# Universal Quantification with ALL

```sql
-- "Students with GPA above every honor-roll student"
SELECT name FROM student
WHERE gpa > ALL (SELECT gpa FROM honor_roll);
```

`x op ALL (subquery)` is true when `op` holds for **every** returned value (and trivially true for empty subqueries).

`x <> ALL (...)` is equivalent to `x NOT IN (...)`, with the same NULL gotchas.

<div class="error">

**Reminder:** `x NOT IN (subquery)` returns no rows if any value in the subquery is NULL. `NOT EXISTS` (Day 11) is NULL-safe.

</div>

---

<!-- _class: lead -->

# Part 3: Where Subqueries Appear

---

# Subqueries Can Live Anywhere a Value or Table Can

<div class="columns">
<div>

### In WHERE / HAVING

```sql
SELECT name FROM student
WHERE  gpa > (SELECT avg(gpa) FROM student);

SELECT major, count(*) FROM student
GROUP BY major
HAVING count(*) > (
  SELECT count(*) / 7.0 FROM student
);
```

</div>
<div>

### In SELECT

```sql
SELECT name,
       (SELECT count(*) FROM enrollment e
        WHERE  e.sid = s.sid) AS courses
FROM   student s;
```

### In FROM

```sql
SELECT t.major, t.n
FROM   (SELECT major, count(*) AS n
        FROM   student
        GROUP BY major) t
ORDER BY t.n DESC;
```

</div>
</div>

The `SELECT`-list correlated subquery and the `FROM`-clause table subquery do similar work; the FROM version is usually faster because it aggregates once.

---

# Top-2 Per Group via Correlated Subquery

> "For each department, the two highest-paid faculty."

```sql run
CREATE OR REPLACE TABLE faculty(fid INT, dname TEXT, name TEXT, salary INT);
INSERT INTO faculty VALUES
  (1,'CS','Grant',150000), (2,'CS','Hoare',165000), (3,'CS','Liskov',172000),
  (4,'EE','Shannon',180000), (5,'EE','Bode',140000);
-- @query
SELECT f.dname, f.name, f.salary
FROM   faculty f
WHERE  (
  SELECT count(*)
  FROM   faculty f2
  WHERE  f2.dname = f.dname
    AND  f2.salary > f.salary
) < 2
ORDER BY f.dname, f.salary DESC;
```

For each row, count the faculty *in the same department with strictly higher salary*. If that count is < 2, this row is in the top 2.

This is slow on large tables because it runs one inner query per row.

The same query is one line with a window function (Friday).

<!--
This is the classic "top-N per group via correlated subquery" form. Worth running it on a real table and showing the EXPLAIN plan: nested loop with one inner query per outer row. Then preview the window-function form to motivate Friday.
-->

---

<!-- _class: lead -->

# Part 4: Rewriting Patterns

---

# Rewriting a Subquery as a JOIN

<div class="columns">
<div>

### Correlated subquery

```sql
SELECT s.name FROM student s
WHERE s.gpa > (
  SELECT avg(s2.gpa)
  FROM student s2
  WHERE s2.dname = s.dname
);
```

</div>
<div>

### Pre-aggregate + JOIN

```sql
SELECT s.name
FROM   student s
JOIN (
  SELECT dname, avg(gpa) AS dept_avg
  FROM   student
  GROUP BY dname
) d ON d.dname = s.dname
WHERE  s.gpa > d.dept_avg;
```

</div>
</div>

The JOIN form computes each department's average **once**. The correlated subquery computes it once per row.

The PostgreSQL optimizer often rewrites the first form into the second, but not always. Verify with `EXPLAIN`.

---

# Rewriting a Subquery as a CTE

```sql
-- Subquery form
SELECT s.name, ec.course_count
FROM   student s
JOIN (SELECT sid, count(*) AS course_count
      FROM enrollment GROUP BY sid) ec USING (sid);

-- CTE form (Wednesday)
WITH ec AS (
  SELECT sid, count(*) AS course_count
  FROM   enrollment
  GROUP BY sid
)
SELECT s.name, ec.course_count
FROM   student s
JOIN   ec USING (sid);
```

Identical results. The CTE form names the intermediate so the reader does not have to parse a nested SELECT.

<!--
CTEs are mostly aesthetic — the PostgreSQL optimizer inlines them. But "mostly aesthetic" hides a real productivity gain when queries grow to 100 lines.
-->

---

# Rewriting a Subquery as a Window Function

```sql
-- The correlated top-2-per-group from a few slides back
-- becomes one expression in Friday's window-function form:
SELECT dname, name, salary
FROM (
  SELECT dname, name, salary,
         row_number() OVER (PARTITION BY dname ORDER BY salary DESC) AS rk
  FROM   faculty
) ranked
WHERE rk <= 2;
```

Window functions evaluate per partition without the overhead of re-running a correlated subquery for each row.

We cover them on Friday.

---

<!-- _class: lead -->

# Part 5: Common Errors

---

# Returning More Than One Row from a Scalar

```sql
-- Looks fine
SELECT name,
       (SELECT salary FROM faculty WHERE dname = s.dname) AS dept_salary
FROM   student s;
```

<div class="error">

**Runtime error** the moment a department has more than one faculty member:

`ERROR: more than one row returned by a subquery used as an expression`

</div>

The fix is to aggregate (`max`, `avg`, etc.) or add a LIMIT.

```sql
SELECT name,
       (SELECT avg(salary) FROM faculty WHERE dname = s.dname) AS dept_avg_salary
FROM   student s;
```

<!--
This bug appears the moment a previously-singleton row becomes multi-row. A scalar subquery against a UNIQUE column is safe; against any other column is not. The aggregate forces "exactly one row" semantically.
-->

---

# The NULL in NOT IN Trap

```sql
-- enrollment has 1 row with sid IS NULL
SELECT name FROM student
WHERE  sid NOT IN (SELECT sid FROM enrollment);

-- Returns ZERO rows for every student.
```

`NOT IN` is "for all x in the set, value <> x." A NULL in the set means *every* comparison is UNKNOWN, so the predicate never returns TRUE.

```sql
-- NULL-safe forms
WHERE NOT EXISTS (
  SELECT 1 FROM enrollment e WHERE e.sid = student.sid
);

-- or, explicit
WHERE sid NOT IN (SELECT sid FROM enrollment WHERE sid IS NOT NULL);
```

This trap is a common interview question. Memorize it.

---

# Correlated Subquery Performance

```sql
-- N×M cost
SELECT s.name FROM student s
WHERE EXISTS (
  SELECT 1 FROM enrollment e
  WHERE  e.sid = s.sid AND e.grade IS NOT NULL
);

-- Often equivalent and faster
SELECT DISTINCT s.name
FROM   student s
JOIN   enrollment e ON e.sid = s.sid
WHERE  e.grade IS NOT NULL;
```

PostgreSQL's optimizer often rewrites correlated EXISTS into a semi-join, but not always. Check `EXPLAIN` when performance matters.

<div class="small">

A semi-join returns each outer row that has at least one match in the inner table, without duplicating it per match (Day 11).

</div>

---

# Wrap-up

- Subqueries come in scalar, table, and correlated forms
- IN, ANY/SOME, ALL, and EXISTS test values against subquery results
- Subqueries can appear in WHERE, HAVING, SELECT, and FROM
- Many subqueries rewrite as JOINs, CTEs, or window functions
- The classic traps are multi-row scalars, NULL in NOT IN, and correlated performance

---

# Next Lecture

Wednesday covers CTEs.

Read PostgreSQL docs Ch. 7.8 before class.

---

# Practice Before Wednesday

Five queries:

1. Students with GPA above their department's average (correlated subquery).
2. Same question, written as a pre-aggregate JOIN.
3. Top-3 highest-paid faculty per department (correlated subquery form).
4. Departments where every faculty member earns above 80,000 (ALL).
5. Students not enrolled in any course this term (NOT EXISTS).

This is an exercise.

---

# Questions

What is on your mind?

Project 1 due Friday Sep 25.

<!--
Common Day 13 questions: "Is a correlated subquery always slow?" (No — sometimes the optimizer turns it into a semi-join. Use EXPLAIN to check.) "Can I have a subquery without a name in FROM?" (Not in PostgreSQL — aliases are required for derived tables.) "What's the difference between IN and ANY?" (= ANY is exactly IN. The forms differ when the operator is <, >, etc.)
-->
