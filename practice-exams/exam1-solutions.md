---
layout: default
---

# Exam 1 Practice Packet — Solutions

Solutions for [`exam1.md`](exam1). Work the packet first; then check yourself here.

---

## Problem 1 — Relational Algebra

*"Names of students enrolled in COP5725 in Fall 2026 whose GPA is above 3.5."*

$$
\pi_{name}\Big( \sigma_{gpa > 3.5}(student) \bowtie_{sid}
                \sigma_{cid = \text{'COP5725'} \,\land\, term = \text{'Fall2026'}}(enrollment) \Big)
$$

Equivalently with pushed-down filters as a single expression:

$$
\pi_{name}\Big( \sigma_{gpa > 3.5 \,\land\, cid='COP5725' \,\land\, term='Fall2026'}( student \bowtie_{sid} enrollment ) \Big)
$$

Either form earns full credit. The first form is cheaper because filters are pushed below the join — the optimizer would rewrite the second into the first.

---

## Problem 2 — ER to Schema

A reasonable normalized translation:

```sql
CREATE TABLE branch (
  branch_id   bigserial PRIMARY KEY,
  name        text NOT NULL,
  address     text
);

CREATE TABLE book (
  book_id     bigserial PRIMARY KEY,
  isbn        text NOT NULL UNIQUE,
  title       text NOT NULL,
  author      text
);

CREATE TABLE copy (
  copy_id     bigserial PRIMARY KEY,
  book_id     bigint NOT NULL REFERENCES book(book_id),     -- total participation
  branch_id   bigint NOT NULL REFERENCES branch(branch_id)  -- total participation
);

CREATE TABLE patron (
  patron_id   bigserial PRIMARY KEY,
  name        text NOT NULL,
  email       text UNIQUE
);

CREATE TABLE checkout (
  checkout_id   bigserial PRIMARY KEY,
  patron_id     bigint NOT NULL REFERENCES patron(patron_id),
  copy_id       bigint NOT NULL REFERENCES copy(copy_id),
  checkout_date timestamptz NOT NULL DEFAULT now(),
  return_date   timestamptz                                  -- NULL = still out
);

CREATE INDEX checkout_open_idx ON checkout (copy_id) WHERE return_date IS NULL;
```

**Total participation** (every X must have a Y):

- `copy.book_id NOT NULL` — every copy must belong to a book
- `copy.branch_id NOT NULL` — every copy must be held at a branch
- `checkout.patron_id NOT NULL` and `checkout.copy_id NOT NULL` — a checkout requires both

The partial index on open checkouts is a bonus that the rubric rewards.

---

## Problem 3 — Normalization

Schema: `R(A, B, C, D, E)` with `F = {A → B, A → C, BC → D, D → E}`.

**1. Compute $\{A\}^+$:**

| Pass | Result | Applied FD |
|------|--------|------------|
| 0 | $\{A\}$ | — |
| 1 | $\{A, B\}$ | $A \rightarrow B$ |
| 2 | $\{A, B, C\}$ | $A \rightarrow C$ |
| 3 | $\{A, B, C, D\}$ | $BC \rightarrow D$ |
| 4 | $\{A, B, C, D, E\}$ | $D \rightarrow E$ |

$\{A\}^+ = \{A, B, C, D, E\}$.

**2. Candidate key:** $\{A\}$ alone is a superkey (its closure covers $R$). It is minimal (we cannot remove anything from a one-attribute set). So $\{A\}$ is the unique candidate key.

**3. Normal form:** $R$ is in 1NF (atomic values, by assumption). It is in 2NF (PK is single-attribute, so no partial dependency possible).

It is **not** in 3NF: $D \rightarrow E$ is a transitive dependency through $A \rightarrow D$. $D$ is not a superkey, $E$ is not part of a candidate key.

So $R$ is in **2NF only**.

**4. BCNF decomposition:**

Apply 3NF synthesis from the minimal cover:
- $A \rightarrow B$
- $A \rightarrow C$
- $BC \rightarrow D$  *(check whether implied; $\{B, C\}^+$ under remaining = $\{B, C, D, E\}$ — not implied without it, keep)*
- $D \rightarrow E$

Group by left side:
- $R_1(A, B, C)$ — from $\{A \rightarrow B, A \rightarrow C\}$
- $R_2(B, C, D)$ — from $BC \rightarrow D$
- $R_3(D, E)$ — from $D \rightarrow E$

$R_1$ contains the candidate key $\{A\}$, so we don't need an extra relation. Each $R_i$ is in BCNF (every determinant is a superkey within its relation):

- $R_1(A, B, C)$: $A$ determines all; $A$ is the key.
- $R_2(B, C, D)$: $\{B, C\} \rightarrow D$ and $\{B, C\}$ is the key.
- $R_3(D, E)$: $D \rightarrow E$ and $D$ is the key.

The decomposition is **lossless** (the chain of joins on shared attributes recovers $R$) and **dependency-preserving** (every FD lives inside one of the relations).

---

## Problem 4 — Advanced SQL with Window Function

For each `cid`, the term with the highest enrollment count, breaking ties alphabetically by term:

```sql
SELECT cid, term
FROM (
  SELECT
    cid,
    term,
    count(*) AS n,
    row_number() OVER (
      PARTITION BY cid
      ORDER BY count(*) DESC, term ASC
    ) AS rk
  FROM   enrollment
  GROUP BY cid, term
) ranked
WHERE rk = 1
ORDER BY cid;
```

The inner query aggregates by (cid, term). The window function ranks within each cid by enrollment count, with ties broken alphabetically. The outer `WHERE rk = 1` picks the winner per cid.

---

## Problem 5 — 7-Day Moving Average

```sql
SELECT
  signup_date,
  count,
  avg(count) OVER (
    ORDER BY signup_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d
FROM   daily_signups
ORDER BY signup_date;
```

The frame `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW` gives a 7-row trailing window (today plus the 6 prior days).

A common mistake: omitting the frame and getting the default running-average frame `UNBOUNDED PRECEDING ... CURRENT ROW` — which is a *cumulative* average, not a 7-day average.

---

## Problem 6 — Recursive CTE

```sql
WITH RECURSIVE org_chart AS (
  -- Base case: the CEO (no manager)
  SELECT eid, name, manager_id, 1 AS depth
  FROM   employee
  WHERE  manager_id IS NULL

  UNION ALL

  -- Recursive case: direct reports of the previous level
  SELECT e.eid, e.name, e.manager_id, oc.depth + 1
  FROM   employee e
  JOIN   org_chart oc ON e.manager_id = oc.eid
)
SELECT eid, name, depth
FROM   org_chart
ORDER BY depth, name;
```

The base case selects the root (no manager). The recursive case joins employees onto the previously-found set via `e.manager_id = oc.eid`, incrementing depth.

Add a depth bound (`WHERE oc.depth < 20`) for safety if the graph might contain cycles. A well-formed org chart is a tree, so cycles shouldn't occur — but defensive coding wins quiz points.

---

## Problem 7 — Python + Safety

| Snippet | Safe? | Why |
|---------|-------|-----|
| **A** `cur.execute(f"SELECT * FROM student WHERE name = '{name}'")` | **unsafe** | The f-string interpolates `name` into the SQL string before psycopg ever sees it. A value like `'; DROP TABLE student; --` becomes part of the query. |
| **B** `cur.execute("SELECT * FROM student WHERE name = %s", (name,))` | **safe** | psycopg's `%s` is a placeholder, not Python formatting. psycopg sends the SQL and the value separately to PostgreSQL, which never confuses the value with code. |
| **C** `cur.execute("SELECT * FROM " + table_name)` | **unsafe** | `table_name` is concatenated into the SQL string. Same vulnerability as A, but for identifiers rather than values. |
| **D** `cur.execute(psycopg.sql.SQL("SELECT * FROM {t}").format(t=psycopg.sql.Identifier(table_name)))` | **safe** | `psycopg.sql.Identifier` quotes the identifier safely. This is the correct pattern for dynamic table or column names. |

The rule: anything where Python builds the SQL string before psycopg sees it is dangerous. Anything where psycopg gets the SQL and the parameters separately (via `%s` for values or `sql.Identifier` for identifiers) is safe.

---

## Problem 8 — DuckDB Flights Aggregation

```python
import duckdb

result = duckdb.sql("""
  SELECT OriginCityName, count(*) AS flights
  FROM   read_csv('https://duckdb.org/data/flights.csv')
  GROUP BY OriginCityName
  ORDER BY flights DESC
  LIMIT 10
""").df()
```

`duckdb.sql(...)` runs the query against the default in-memory database. `read_csv` fetches the URL directly (DuckDB loads the `httpfs` extension on demand). `.df()` returns the result as a pandas DataFrame with zero copies.

Acceptable variants:
- `FROM 'https://duckdb.org/data/flights.csv'` (DuckDB's shorthand)
- `duckdb.query(...).to_df()` (older method name)
- Using a persistent file: `duckdb.connect("flights.duckdb")` instead of the default in-memory

Any solution that writes to disk first loses points — the prompt says "no intermediate file."

---

[back to exam](exam1) · [back to course](../index)
