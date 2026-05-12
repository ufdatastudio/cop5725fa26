---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day20 Duckdb Notebooks — Instructor Only'
math: katex
html: true
style: |
  footer { font-size: 0.6em; }
  section.lead h1 { text-align: center; }
  table { font-size: 0.85em; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
---

<!-- _class: lead -->

# Clicker Checks
## Day20 Duckdb Notebooks

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

Which of these reads work in DuckDB without any prior `CREATE TABLE`?

```python
# A
duckdb.sql("SELECT * FROM 'data.parquet'")

# B
duckdb.sql("SELECT * FROM read_csv('s3://bucket/data.csv')")

# C
duckdb.sql("SELECT * FROM read_json_auto('https://api.example.com/events.json')")

# D
duckdb.sql("SELECT * FROM read_parquet('https://example.com/*.parquet')")
```

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: all of them. DuckDB recognizes file extensions and auto-loads httpfs for HTTPS, aws for S3 (you may need to load aws extension explicitly first). The shorthand `FROM 'file.parquet'` is equivalent to `FROM read_parquet('file.parquet')`.
-->

---

# 📊 Clicker Check — Answer

**All four work.** DuckDB recognizes file extensions and auto-loads the right extension (`httpfs` for HTTPS, `aws` for S3 after `LOAD aws;`).

- `FROM 'file.parquet'` is shorthand for `FROM read_parquet(...)`
- `FROM 'file.csv'` becomes `FROM read_csv_auto(...)`
- Glob patterns work in HTTPS and S3 URLs too

The single-line "open this data wherever it lives" UX is the DuckDB promise.

---

# 📊 Clicker Check

You have a daily ETL that:
1. Pulls fresh data from a REST API
2. Joins it with a customer table
3. Computes per-region aggregates
4. Writes the result to a dashboard

Which engine is the best fit for this nightly batch?

A. PostgreSQL — it has a customer table
B. DuckDB — embedded, columnar, fast at scan-and-aggregate
C. Both — Postgres holds the table, DuckDB does the scan via the postgres extension
D. Neither — use Python directly

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. The customer table lives in Postgres (it's transactional data); the analytical workload is what DuckDB excels at. The postgres extension makes the join trivial, and DuckDB's columnar engine wins the scan + aggregate step.
-->

---

# 📊 Clicker Check — Answer

**C. Both — Postgres holds the table, DuckDB does the scan via the postgres extension.**

PostgreSQL is the right home for customer data: transactional, frequently updated, normalized.

DuckDB is the right engine for the nightly aggregation: columnar scans, single-machine concurrency, easy join with Parquet from S3.

The `postgres` extension bridges them. This is a real production pattern — OLTP in Postgres, analytics in DuckDB or a cloud warehouse, with the analytics engine reading the OLTP store directly.
