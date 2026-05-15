---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management - Fall 2026'
math: katex
html: true
---

<!-- _class: lead -->

# Day 19: Python + psycopg + pandas

**COP 5725 - Database Management**
Monday, October 5, 2026

The bridge between SQL and your application

<!--
First class of Section 3. Many students arrive familiar with psycopg2 from internships; today centers on psycopg3 (the modern version). Pace 50 min, with parameterized queries getting real time because the SQL-injection demo lands the lesson permanently.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Three weeks of SQL. You write queries fluently.

But you've been running them in `psql` and DuckDB shells.
Real systems live behind application code.
The application is usually written in Python (or Java, or Go, or…).

Today: the bridge.
Wednesday: a different bridge — DuckDB for analytical work.

</div>
<div>

```mermaid
graph LR
  S["SQL<br/>(Sections 1-2)"]
  P["Python<br/>(today)"]
  D["DuckDB<br/>(Wed)"]
  S --> P
  S --> D
  P --> A["App / API"]
  D --> N["Notebook"]
  classDef done fill:#e8f5e9,stroke:#388e3c
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef next fill:#e3f2fd,stroke:#1976d2
  class S done
  class P now
  class D,A,N next
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  W["1. Why<br/>Python?"] --> B["2. psycopg<br/>basics"]
  B --> P["3. Parameterized<br/>queries"]
  P --> T["4. Transactions"]
  T --> Pd["5. pandas<br/>bridge"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class W,B,P,T,Pd step
```

Reference: [psycopg 3 documentation](https://www.psycopg.org/psycopg3/docs/).

---

<!-- _class: lead -->

# Part 1: When You Need Python

---

# Push to Server vs Pull to Client

<div class="columns">
<div>

### Push to server (prefer)

```sql
SELECT major, avg(gpa)
FROM   student
GROUP BY major;
```

Database does the aggregation.
Returns ~7 rows.

</div>
<div>

### Pull to client (avoid)

```python
rows = cur.execute("SELECT * FROM student").fetchall()
# 100,000 rows fly across the wire
# Python computes the average per major
```

Database returns everything.
Python does the work.

</div>
</div>

> If SQL can express the work, do it in SQL. Python is for what SQL cannot express.

<!--
The "SQL is faster than your for-loop" principle. The database engine, the optimizer, indexes, and vectorized execution all exist to make SQL fast. Pulling rows to do Python aggregation throws all of that away.
-->

---

# When Python Is the Right Answer

<div class="columns-3">
<div>

### Calling external services

Hitting an API, scraping HTML, running a model — the database can't do these.

</div>
<div>

### Orchestrating pipelines

Reading a CSV, transforming, writing to multiple tables — Python is the glue.

</div>
<div>

### Custom logic

Anything that needs branching, loops, or libraries the database lacks.

</div>
</div>

The rest of the lecture is about the seam — moving SQL results into Python cleanly and pushing Python results back without losing safety.

---

<!-- _class: lead -->

# Part 2: psycopg Basics

---

# Install

```bash
# Modern, recommended
uv add psycopg[binary]

# Older, still common in production
pip install psycopg2-binary
```

We use **psycopg 3** (`import psycopg`).
The API is similar to psycopg2 but cleaner and faster.

Reference: [Installation](https://www.psycopg.org/psycopg3/docs/basic/install.html).

<!--
psycopg2 is in maintenance mode. New code should use psycopg 3. The differences students might encounter: psycopg 3 supports server-side query parameters natively, is async-aware, and uses context managers more idiomatically.
-->

---

# The Three-Line Pattern

```python
import psycopg

with psycopg.connect("postgresql://user:pass@host/dbname") as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT name, gpa FROM student WHERE major = 'CS'")
        for row in cur:
            print(row)
```

Three context managers:
1. The connection
2. The cursor
3. (The iteration, automatically)

Connections and cursors are closed deterministically — no leaked resources.

---

# Cursor Result Shapes

```python
# Default: tuples
cur.execute("SELECT sid, name FROM student LIMIT 3")
cur.fetchone()                # (1, 'Ada')

# Dict rows
from psycopg.rows import dict_row
cur = conn.cursor(row_factory=dict_row)
cur.execute("SELECT sid, name FROM student LIMIT 3")
cur.fetchone()                # {'sid': 1, 'name': 'Ada'}

# Class rows
from dataclasses import dataclass
from psycopg.rows import class_row

@dataclass
class Student:
    sid: int
    name: str

cur = conn.cursor(row_factory=class_row(Student))
cur.execute("SELECT sid, name FROM student LIMIT 3")
cur.fetchone()                # Student(sid=1, name='Ada')
```

Reference: [Row factories](https://www.psycopg.org/psycopg3/docs/api/rows.html).

---

# Connection Strings

```python
# Single URL
conn = psycopg.connect(
    "postgresql://username:password@host:5432/dbname"
)

# Keyword form
conn = psycopg.connect(
    dbname="cop5725",
    user="christan",
    password="...",
    host="localhost",
    port=5432
)

# Environment variables (preferred)
import os
conn = psycopg.connect(os.environ["DATABASE_URL"])
```

**Never** hardcode credentials. Set `DATABASE_URL` in `.env` or your shell.

<!--
The credentials-in-code anti-pattern is the most common SQL-related security incident. A .env file in .gitignore is enough; production systems use secrets managers. Hardcoded passwords in a public repo get scraped by bots within minutes.
-->

---

<!-- _class: lead -->

# Part 3: Parameterized Queries

---

# The Wrong Way

```python
# DANGER: string concatenation
sid_input = input("Student ID: ")
query = f"SELECT name FROM student WHERE sid = {sid_input}"
cur.execute(query)
```

If the input is `1`, this works.
If the input is `1; DROP TABLE student; --`, this also works — and the table is gone.

This is **SQL injection**. The original 2002 [Bobby Tables xkcd](https://xkcd.com/327/) still happens every week somewhere on the internet.

---

# The Right Way

```python
cur.execute(
    "SELECT name FROM student WHERE sid = %s",
    (sid_input,)
)
```

Two changes:
- `%s` is a **placeholder**, not a Python format string
- The values are passed as a separate tuple

psycopg sends the SQL and the parameters separately to PostgreSQL, which never sees the value as code.

This is called a **parameterized** or **prepared** query.
Reference: [Passing parameters to SQL queries](https://www.psycopg.org/psycopg3/docs/basic/params.html).

<!--
The %s in psycopg is NOT the Python % operator. It's a placeholder in the SQL string that psycopg fills server-side. Even %s for strings — the database engine inserts proper quotes, escapes, and quoting. You can't be in danger if you can't accidentally interpolate.
-->

---

# Identifiers vs Values

Placeholders only work for **values**, not for table or column names.

```python
# BREAKS — placeholder cannot quote an identifier
cur.execute("SELECT * FROM %s", ("student",))
```

For dynamic identifiers, use `psycopg.sql`:

```python
from psycopg import sql

cur.execute(
    sql.SQL("SELECT * FROM {table} WHERE sid = %s")
       .format(table=sql.Identifier("student")),
    (1,)
)
```

`sql.Identifier` quotes the name safely. Use it whenever a table or column is determined at runtime.

---

<!-- _class: lead -->

# Part 4: Transactions

---

# Implicit Transactions

```python
with psycopg.connect("...") as conn:
    with conn.cursor() as cur:
        cur.execute("UPDATE faculty SET salary = salary * 1.05 WHERE dname = 'CS'")
        # No commit yet — changes are visible only inside this transaction
    # cursor closed
# connection closed — commit happens automatically on clean exit
```

By default, **psycopg 3 opens a transaction on the first statement**. The context manager commits on success, rolls back on exception.

This differs from psycopg2's `autocommit=True` default behavior. Read the [Transaction docs](https://www.psycopg.org/psycopg3/docs/basic/transactions.html).

---

# Explicit Control

```python
with psycopg.connect("...") as conn:
    try:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO audit ...")
            cur.execute("UPDATE balance ...")
        conn.commit()
    except Exception:
        conn.rollback()
        raise
```

Use explicit `commit()` / `rollback()` when:
- You need to commit a partial batch
- You want to handle exceptions yourself

```python
# Or, finer-grained: nested transactions via SAVEPOINT
with conn.transaction():
    with conn.transaction():
        cur.execute("...")
```

Reference: [psycopg `transaction()`](https://www.psycopg.org/psycopg3/docs/api/connections.html#psycopg.Connection.transaction).

---

<!-- _class: lead -->

# Part 5: pandas Bridge

---

# read_sql_query

```python
import pandas as pd
import psycopg

with psycopg.connect("postgresql://...") as conn:
    df = pd.read_sql_query(
        """
        SELECT major, gpa
        FROM   student
        WHERE  gpa IS NOT NULL
        """,
        conn
    )

df.describe()
df.groupby("major")["gpa"].mean()
```

One function call turns a query result into a DataFrame.
`pd.read_sql_query` accepts a SQLAlchemy connection or a DBAPI connection (psycopg works directly).

---

# Pushing Results Back

```python
new_records = pd.DataFrame({
    "sid": [101, 102],
    "name": ["Test1", "Test2"],
    "gpa": [3.5, 3.7]
})

# Requires SQLAlchemy engine for full feature set
from sqlalchemy import create_engine
engine = create_engine(os.environ["DATABASE_URL"])

new_records.to_sql(
    "student",
    engine,
    if_exists="append",   # or 'replace', 'fail'
    index=False
)
```

For bulk inserts of millions of rows, `to_sql` is too slow. Reach for PostgreSQL's `COPY` via psycopg:

```python
with cur.copy("COPY student FROM STDIN WITH CSV HEADER") as copy:
    with open("students.csv") as f:
        for line in f:
            copy.write(line.encode())
```

---

# Visualizing a Result

```python
import matplotlib.pyplot as plt

df = pd.read_sql_query(
    """
    SELECT major, count(*) AS n, avg(gpa) AS mean_gpa
    FROM student
    GROUP BY major
    """,
    conn
)

fig, ax = plt.subplots()
ax.scatter(df["n"], df["mean_gpa"])
for _, r in df.iterrows():
    ax.annotate(r["major"], (r["n"], r["mean_gpa"]))
ax.set_xlabel("Students enrolled")
ax.set_ylabel("Mean GPA")
plt.savefig("major-gpa.png", dpi=150)
```

The SQL does the aggregation. Python does the plot. The split is on purpose.

<!--
The 80/20 rule of database work: the database aggregates, the client paints. Modern visualization libraries (matplotlib, seaborn, plotly) consume DataFrames as their natural input.
-->

---

# Real Dataset Demo: Pagila

```python
import pandas as pd
import psycopg

with psycopg.connect("postgresql://student:student@localhost/pagila") as conn:
    top_actors = pd.read_sql_query(
        """
        SELECT a.first_name || ' ' || a.last_name AS name,
               count(*)                            AS films
        FROM   actor a
        JOIN   film_actor fa USING (actor_id)
        GROUP BY a.first_name, a.last_name
        ORDER BY films DESC
        LIMIT 10
        """,
        conn
    )

top_actors.plot.barh(x="name", y="films", legend=False)
```

Pagila is the canonical PostgreSQL sample database (DVD rental).
Install: [github.com/devrimgunduz/pagila](https://github.com/devrimgunduz/pagila).
Used here as a real schema with non-trivial joins.

---

# Wrap-up

You now have:

<div class="columns">
<div>

- The three-line psycopg pattern (connection / cursor / iterate)
- Cursor row factories: tuple, dict, dataclass
- Parameterized queries and the `psycopg.sql` module for identifiers

</div>
<div>

- Transactions via context managers (auto-rollback on exception)
- `pandas.read_sql_query` and `DataFrame.to_sql`
- The "aggregate server-side, plot client-side" rule

</div>
</div>

---

# Wednesday: DuckDB

We swap the server for an embedded engine that reads CSV and Parquet from anywhere.

By the end of Wednesday you query a 3 M-row NYC Taxi dataset directly from CloudFront in one line.

Read [duckdb.org/why_duckdb](https://duckdb.org/why_duckdb) and [duckdb.org/docs/data/overview](https://duckdb.org/docs/data/overview) before class.

---

# Practice Before Wednesday

Three exercises in your project repo:

1. Write a `query.py` script that reads `DATABASE_URL` from the environment, runs a query against your project's dataset, prints the first 10 rows.
2. Wrap the query in a transaction that updates one column then rolls back; verify the change does not persist.
3. Plot the top-5 categories from your dataset using `pandas.read_sql_query` + matplotlib.

Commit and push to your `cop5725fa26-project` repo.

---

# Questions

What is on your mind?

Project 2 due Oct 23 — heavy use of advanced SQL through Python.

<!--
Common Day 19 questions: "Can I just use SQLAlchemy?" (Yes — SQLAlchemy adds ORM and DB-agnostic features; psycopg is the underlying driver. For raw queries against Postgres, psycopg is cleaner; for object mapping, reach for SQLAlchemy.) "Why is psycopg2 still around if psycopg3 exists?" (Massive deployed base; many libraries still pin to psycopg2.) "Should I use asyncpg instead?" (For async-only codebases, yes. For sync code, psycopg is the right call.)
-->
