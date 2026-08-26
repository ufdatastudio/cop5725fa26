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

# Day 17: Recursive Queries

**COP 5725 - Database Management Systems**
Wednesday, September 30, 2026

`WITH RECURSIVE` and fixed-point iteration

<!--
This is the day SQL becomes Turing-complete (or close to it). Most students have never seen recursive CTEs even after multiple database courses. Today's job is making the shape concrete (base + recursive case + UNION ALL) and showing three different problem shapes that benefit.
The Hirn-Grust 2023 paper is the anchor — students should have read it Tuesday night. Reserve the last 10 min to discuss it.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Day 14 introduced CTEs.
Days 15-16 covered window functions.

Today covers recursive CTEs, where a CTE references itself. That change lets SQL handle hierarchies, graph traversal, and iterative computation.

The PostgreSQL syntax is `WITH RECURSIVE`. The semantics are a fixed-point iteration that we walk through step by step.

</div>
<div>

```mermaid
graph TB
  CTE["CTE<br/>(Day 14)"]
  REC["RECURSIVE CTE<br/>(today)"]
  CTE --> REC
  REC --> Org["Org chart"]
  REC --> Graph["Graph traversal"]
  REC --> Seq["Sequence<br/>generation"]
  classDef done fill:#e8f5e9,stroke:#388e3c
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef use fill:#e3f2fd,stroke:#1976d2
  class CTE done
  class REC now
  class Org,Graph,Seq use
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  S["1. The shape<br/>of recursion"] --> O["2. Org<br/>chart"]
  O --> G["3. Graph<br/>traversal"]
  G --> Seq["4. Sequence<br/>generation"]
  Seq --> H["5. Hirn-Grust<br/>paper"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class S,O,G,Seq,H step
```

Reference: PostgreSQL docs [Ch. 7.8.2 Recursive Queries](https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-RECURSIVE). The Textbook treats recursion briefly in §10.2, p. 437; the PostgreSQL docs are the working reference.

---

<!-- _class: lead -->

# Part 1: The Shape of Recursion

---

# Three Pieces

```sql
WITH RECURSIVE name AS (
  -- 1. Base case (non-recursive)
  SELECT ...
  WHERE  ...

  UNION ALL

  -- 2. Recursive case (references "name")
  SELECT ...
  FROM   source JOIN name ON ...
)
SELECT * FROM name;
```

<div class="columns-3">
<div>

### Base case
The starting set of rows. Runs once.

</div>
<div>

### Recursive case
Produces new rows from the previous iteration's output. Runs repeatedly.

</div>
<div>

### Termination
The loop stops when the recursive case produces no new rows.

</div>
</div>

---

# Execution as a Fixed-Point Loop

```mermaid
graph TB
  B["Base case<br/>seeds the working set"] --> W["Working set"]
  W --> R["Recursive case:<br/>SELECT ... FROM name JOIN ..."]
  R --> N{"Any<br/>new rows?"}
  N -->|"yes"| Add["Add to result<br/>+ replace working set"]
  Add --> R
  N -->|"no"| End["Terminate"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef cond fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef done fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class B,W,R,Add step
  class N cond
  class End done
```

PostgreSQL calls the working set the *recursive term's input*. Each iteration replaces it with the rows produced in the previous iteration, not the cumulative result.

<!--
The "working set replaces, doesn't accumulate" semantic is the source of subtle bugs. The recursive case sees only the *new* rows from the previous iteration. Reference cumulative results via a separate column (depth, path, etc.).
-->

---

<!-- _class: lead -->

# Part 2: Org Chart

---

# The Schema

```sql
CREATE TABLE faculty_supervision (
  faculty_id           bigint PRIMARY KEY,
  name          text NOT NULL,
  supervisor_id bigint REFERENCES faculty_supervision(faculty_id)
);

INSERT INTO faculty_supervision VALUES
  (1, 'Dr. Provost',  NULL),
  (2, 'Dr. Dean',     1),
  (3, 'Dr. Chair',    2),
  (4, 'Dr. Grant',    3),
  (5, 'Dr. Sahni',    3),
  (6, 'Dr. Lee',      2);
```

The `supervisor_id` is a self-referencing foreign key.
The org structure is a tree, encoded in the column.

---

# The Recursive Query

```sql run
CREATE OR REPLACE TABLE faculty_supervision(faculty_id INT, name TEXT, supervisor_id INT);
INSERT INTO faculty_supervision VALUES
  (1,'Dr. Provost',NULL), (2,'Dr. Dean',1), (3,'Dr. Chair',2),
  (4,'Dr. Grant',3), (5,'Dr. Sahni',3), (6,'Dr. Lee',2);
-- @query
WITH RECURSIVE chart AS (
  -- Base: roots (no supervisor)
  SELECT faculty_id, name, supervisor_id, 1 AS depth, name AS path
  FROM   faculty_supervision
  WHERE  supervisor_id IS NULL

  UNION ALL

  -- Recursive: direct reports of the previous level
  SELECT f.faculty_id, f.name, f.supervisor_id, c.depth + 1, c.path || ' > ' || f.name
  FROM   faculty_supervision f
  JOIN   chart c ON f.supervisor_id = c.faculty_id
)
SELECT depth, repeat('  ', depth - 1) || name AS indented, path
FROM   chart
ORDER BY path;
```

`depth` and `path` are computed columns that survive across iterations.

---

# Iteration by Iteration

<div class="columns">
<div>

### Iteration 0 (base)
| faculty_id | name | depth |
|-----|------|-------|
| 1 | Dr. Provost | 1 |

### Iteration 1
| faculty_id | name | depth |
|-----|------|-------|
| 2 | Dr. Dean | 2 |

### Iteration 2
| faculty_id | name | depth |
|-----|------|-------|
| 3 | Dr. Chair | 3 |
| 6 | Dr. Lee | 3 |

</div>
<div>

### Iteration 3
| faculty_id | name | depth |
|-----|------|-------|
| 4 | Dr. Grant | 4 |
| 5 | Dr. Sahni | 4 |

### Iteration 4
Recursive case produces no rows → terminate.

The final result is the **union** of every iteration's output.

</div>
</div>

<!--
Walk this on the board. Students often try to compute the cumulative set in their head and get confused. The "each iteration sees only the previous iteration's new rows" rule keeps the math tractable.
-->

---

<!-- _class: lead -->

# Part 3: Graph Traversal

---

# Undirected Friendship Schema

```sql
CREATE TABLE friend (
  sid_a bigint REFERENCES student(student_id),
  sid_b bigint REFERENCES student(student_id),
  PRIMARY KEY (sid_a, sid_b),
  CHECK  (sid_a < sid_b)
);

-- Logical symmetric view
CREATE VIEW friend_sym AS
  SELECT sid_a AS sid_x, sid_b AS sid_y FROM friend
  UNION ALL
  SELECT sid_b AS sid_x, sid_a AS sid_y FROM friend;
```

The `CHECK` constraint stores each pair only once.
The view exposes the symmetric form for traversal.

---

# Friends Within 3 Hops

```sql
WITH RECURSIVE network AS (
  -- Base: direct friends
  SELECT sid_y AS friend_id, 1 AS hops, ARRAY[sid_x, sid_y] AS path
  FROM   friend_sym
  WHERE  sid_x = :seed_student

  UNION ALL

  -- Recursive: friends of friends, up to 3 hops, no cycles
  SELECT fs.sid_y, n.hops + 1, n.path || fs.sid_y
  FROM   network n
  JOIN   friend_sym fs ON fs.sid_x = n.friend_id
  WHERE  n.hops < 3
    AND  NOT fs.sid_y = ANY(n.path)
)
SELECT DISTINCT friend_id, min(hops) AS shortest_hops
FROM   network
GROUP BY friend_id
ORDER BY shortest_hops;
```

The `path` array tracks visited vertices to prevent cycles.

<!--
Cycle detection via path arrays is the standard pattern. Without it, friend-of-friend traversal in a connected graph never terminates. The WHERE n.hops < 3 is a defensive cap that bounds the depth even if cycle detection fails.
-->

---

# When Recursive CTEs Are the Wrong Tool

<div class="columns">
<div>

### They are right when

- The data structure is recursive (tree, DAG, graph)
- The traversal depth is unknown
- You need set-based reasoning across hops

</div>
<div>

### They are wrong when

- You need shortest-path with weighted edges (use a graph DB or Dijkstra in app code)
- The graph has high fan-out and you need only one path (recursive will explore all)
- You need PageRank or eigenvalue computations

</div>
</div>

Graph extensions such as [Apache AGE](https://age.apache.org/) cover the cases where recursive CTEs hit limits.

---

<!-- _class: lead -->

# Part 4: Sequence Generation

---

# generate_series

```sql
SELECT generate_series(1, 10) AS n;

SELECT generate_series(
  '2026-08-21'::date,
  '2026-12-02'::date,
  '1 day'::interval
)::date AS class_day;
```

`generate_series` is PostgreSQL's set-returning function for numeric and date sequences. Reference: [Ch. 9.27 Set Returning Functions](https://www.postgresql.org/docs/current/functions-srf.html).

Reach for it before recursion. Most sequence problems do not need iteration.

---

# Fibonacci

```sql run
WITH RECURSIVE fib(n, a, b) AS (
  SELECT 1, 0::bigint, 1::bigint
  UNION ALL
  SELECT n + 1, b, a + b FROM fib WHERE n < 20
)
SELECT n, a FROM fib;
```

The base case seeds `(n=1, a=0, b=1)`.
The recursive case advances the pair, incrementing `n`.
The loop stops when `n = 20`.

Real data work rarely uses recursion for sequences. Fibonacci is the simplest demonstration of the loop structure.

<!--
Fibonacci is a tutorial example. The interesting recursive queries in production are graph and tree traversal, not arithmetic sequences. But the Fibonacci form is the simplest "show me the loop" demo.
-->

---

<!-- _class: lead -->

# Part 5: Hirn and Grust 2023

---

# A Fix for the Fixation on Fixpoints

<div class="columns">
<div>

> Hirn, D. and Grust, T.
> *A Fix for the Fixation on Fixpoints.* CIDR 2023.

[Local PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/hirn2023.pdf)

The paper's argument:

- `WITH RECURSIVE` computes a fixpoint. The result is the union of every iteration's output, and the recursive term sees only the previous iteration's rows.
- Many iterative algorithms need only the final state, and accumulating every intermediate row costs time and space.
- The authors propose an iteration form that replaces the working table each round instead of accumulating it.

</div>
<div>

### Restrictions in PostgreSQL

The recursive term of `WITH RECURSIVE` ([Ch. 7.8](https://www.postgresql.org/docs/current/queries-with.html)):

- may reference the CTE only once (linear recursion),
- may not apply aggregates or `GROUP BY` to that reference,
- does not support mutual recursion between CTEs.

</div>
</div>

<!--
Keep the summary honest to the paper: the critique is aimed at the accumulate-everything fixpoint semantics, not at UNION vs UNION ALL (PostgreSQL supports both in recursive CTEs). Students should have read the paper before class.
-->

---

# What the Paper Means for Us

`WITH RECURSIVE` covers the recursive queries in this course and most production schemas.

<div class="columns">
<div>

### When the standard form is enough

- Org charts and bills of materials
- Friendship graphs with bounded depth
- Iterating a fixed number of times

</div>
<div>

### When you hit limits

- Algorithms that update state each round (PageRank, weighted shortest paths)
- Mutual recursion (A depends on B, B depends on A)
- Aggregation inside the loop

The workaround today is materializing intermediates or moving the computation out of SQL.

</div>
</div>

<!--
Take 10 minutes on this slide and the previous one; the paper is short and readable. The discussion goal is for students to articulate what the fixpoint semantics can and cannot express.
-->

---

# Wrap-up

- `WITH RECURSIVE` combines a base case, a recursive case, and `UNION ALL`; iteration stops when no new rows appear.
- The recursive case sees only the previous iteration's rows, not the cumulative result.
- Hierarchies, graph traversal, and sequence generation are the three problem shapes; path arrays prevent cycles.
- `generate_series` handles most sequence needs without recursion.
- Hirn and Grust critique the accumulate-everything fixpoint semantics and the restrictions on the recursive term.

---

# Friday: Views, Constraints, Triggers + Quiz 2

Topic: views and materialized views, EXCLUDE and DEFERRABLE constraints, and triggers. Section 2 closes Friday.

Quiz 2 runs in the last 10 minutes.

Reading: Textbook §8.1-8.2, p. 341 and §7.1-7.2, §7.5, p. 311, plus PostgreSQL docs on [CREATE VIEW](https://www.postgresql.org/docs/current/sql-createview.html), [Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), and [Triggers](https://www.postgresql.org/docs/current/triggers.html).

---

# Practice Before Friday

Five recursive queries:

1. Build the org chart for `faculty_supervision`.
2. Find all employees managed (transitively) by a given supervisor.
3. Find all friends-of-friends within 2 hops, no cycles.
4. Generate every Monday for the Fall 2026 semester.
5. Compute the first 30 Fibonacci numbers.

Answers due in your repo before 8:30 AM Fri Oct 2.

---

# Questions

What is on your mind?

Project 2 work continues. Quiz 2 on Friday.

<!--
Common Day 17 questions: "Why UNION ALL instead of UNION?" (Performance — UNION dedupes, UNION ALL doesn't. If you want dedup, do it at the end. Standard SQL allows both in recursive CTEs; PostgreSQL supports both but UNION ALL is conventional.) "What if I forget cycle detection?" (The query runs until OOM or your statement timeout. Always use a path column or depth bound.) "Can recursive queries return more than one type of row?" (Yes — different shapes per iteration, as long as the column types match.)
-->
