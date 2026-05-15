---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day24 Row Vs Column Stores — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day24 Row Vs Column Stores

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A 200-column `events` table with 10 billion rows. Query:

```sql
SELECT date_trunc('hour', ts), count(*)
FROM events
GROUP BY 1
ORDER BY 1;
```

Which is the right engine for this query?

A. PostgreSQL — battle-tested, default choice
B. DuckDB — column store reads only `ts`, ignoring the other 199 columns
C. Either — schema-agnostic at scale
D. MongoDB — JSON storage avoids the column problem entirely

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. The query touches one column. Column stores read literally one column file; row stores must scan every page (or use a covering index, but that's enormous for 10 B rows). The 10-100x difference is real and reproducible.
-->

---

# 📊 Clicker Check — Answer

**B. DuckDB — column store reads only `ts`, ignoring the other 199 columns.**

The query reads one column out of 200. A row store scans every page (and every column inside each page). A column store reads only the `ts` column file. That is a 200× reduction in I/O before any compression.

Add compression and vectorized execution, and the speedup is often 100-1000× on analytical queries against wide tables. This is the workload C-Store was designed for.

---

# 📊 Clicker Check

Your project's dataset is 10 GB of clickstream logs. You expect:
- Daily ingest of 100 MB
- Hourly dashboard queries that aggregate by region/event
- Rare single-event lookups

What layout makes the most sense?

A. PostgreSQL with B-tree indexes on every column
B. PostgreSQL row store + Parquet replica + DuckDB for dashboards
C. MongoDB — JSON is the right shape
D. CSV files queried by Pandas

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. The hybrid pattern is exactly right for this workload — Postgres handles the writes, DuckDB on Parquet handles the analytics. A would work but index maintenance becomes painful at scale. C avoids the layout question by giving up SQL. D doesn't scale.
-->

---

# 📊 Clicker Check — Answer

**B. PostgreSQL row store + Parquet replica + DuckDB for dashboards.**

The workload is mixed: writes (transactional), analytical aggregates (analytical), and rare lookups (point queries). No single engine is best for all three.

The 2026 industry default splits the workload:
- Postgres handles the ingest and rare lookups
- A periodic export to Parquet (via CDC or scheduled job) feeds DuckDB
- DuckDB powers the dashboards

The split costs replication overhead. Buys 10-100× speedup on the queries that matter.
