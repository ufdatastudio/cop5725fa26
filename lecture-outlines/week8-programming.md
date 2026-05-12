# Week 8: Programming and Tools

## Overview

Section 3 opens and closes inside one week.
Homecoming takes Friday, so the section has just two meetings.
Their job: hand the class working tools to keep pulling on real data — `psycopg` for transactional Postgres work, `DuckDB` for analytical exploration — and to set up the Python notebook pattern that the rest of the semester relies on.

The practice exam packet for Exam 1 ships at the end of Wednesday's class.

**Learning Objectives:**

- Connect to PostgreSQL from Python using `psycopg` (v3) and run parameterized queries safely
- Manage transactions explicitly: `commit`, `rollback`, context managers
- Move query results into pandas DataFrames; move DataFrames back to the database
- Read CSV, Parquet, JSON, and remote HTTPS data into DuckDB in a single line
- Identify when to push computation to the database and when to pull into the client
- Generate a Jupyter notebook that documents both the SQL and the resulting analysis

---

## Day 19 (Monday, October 5): Python + psycopg + pandas

### Topics (50 min)

**1. When You Need Python at All (5 min)**
- Pull-to-client vs push-to-server
- When SQL is enough; when it isn't

**2. psycopg Basics (15 min)**
- Connection, cursor, `fetchone` / `fetchall` / iteration
- `psycopg.dict_row` for friendlier results
- Connection strings and environment variables

**3. Parameterized Queries (10 min)**
- The `%s` placeholder
- Why string concatenation is dangerous
- The SQL injection demo

**4. Transactions (10 min)**
- Implicit transactions and the `autocommit` switch
- Context managers as transaction scopes
- `commit` vs `rollback`

**5. pandas Bridge (10 min)**
- `pandas.read_sql_query` and `DataFrame.to_sql`
- Reading a 1M-row query without melting RAM
- A quick visualization with matplotlib

### Action Items
- Read [psycopg documentation: Basic module usage](https://www.psycopg.org/psycopg3/docs/basic/usage.html)
- Project 2 work continues; due Fri Oct 23

---

## Day 20 (Wednesday, October 7): DuckDB and Notebooks

### Topics (50 min)

**1. What DuckDB Is (5 min)**
- Embedded, columnar, single-binary
- The DuckDB / SQLite analogy
- The DuckDB / Postgres relationship

**2. DuckDB CLI and Python (10 min)**
- `duckdb` CLI; `pip install duckdb`
- In-memory vs file databases
- Persistent vs ephemeral

**3. Reading Real Data in One Line (15 min)**
- `read_csv`, `read_parquet`, `read_json_auto`
- HTTPS URLs as data sources
- NYC Taxi Parquet demo — open a 3 M-row dataset directly from CloudFront

**4. PostgreSQL vs DuckDB SQL (8 min)**
- Where the dialects match
- Where DuckDB extends (LIST, MAP, STRUCT, ASOF joins, sample syntax)
- Where Postgres extends (operator overloading, triggers)

**5. Notebook Patterns (7 min)**
- Mixing SQL cells and Python cells
- `duckdb.sql(...)` as the entry point
- Pandas / Arrow / Polars round-trip with zero copy

**6. Practice Exam Packet Drop (5 min)**
- The packet covers Sections 1-3
- One week to work it; Exam 1 next Wednesday

### Action Items
- Read [DuckDB Why DuckDB](https://duckdb.org/why_duckdb) and [Data Import](https://duckdb.org/docs/data/overview)
- Practice exam packet released at end of class
- No class Friday Oct 9 (Homecoming)

---

## Looking Ahead to Week 9

Storage opens Section 4. Three meetings, all on the physical layer:

- **Mon Oct 12** — Storage Hierarchy: disks, SSDs, pages, records
- **Wed Oct 14** — **Exam 1** (covers Sections 1-3)
- **Fri Oct 16** — Buffer Management and Memory
