---
layout: default
---

# Real-World Datasets for COP 5725

The university schema (`student`, `course`, `section`, `enrollment`, `faculty`, `department`) is the running continuity example.
The datasets below give every concept a real-data demonstration.

Many are accessible directly from DuckDB with a single `read_csv` or `read_parquet` call — no setup, no signup.

---

## DuckDB-Friendly Public Datasets

| Dataset | URL pattern | Best for |
|---------|-------------|----------|
| **NYC Yellow Taxi** | `read_parquet('https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet')` | Window functions, time-series, aggregation at scale |
| **TPC-H** (built in) | `INSTALL tpch; LOAD tpch; CALL dbgen(sf=1);` | Joins, optimization, the benchmark every engine targets |
| **Flights** (1M+ rows) | `read_csv('https://duckdb.org/data/flights.csv')` | Joins, group-by, subqueries |
| **IMDb non-commercial** | `read_csv('https://datasets.imdbws.com/title.basics.tsv.gz', delim='\t')` | M:N, ranking, recursion (genres) |
| **GHTorrent / GH Archive** | `read_parquet('s3://ghtorrent-bigquery/...')` | Real events, complex aggregations |

---

## API-Backed Datasets

| Dataset | API | Best for |
|---------|-----|----------|
| **OpenAlex** | https://api.openalex.org | Citation graphs (recursive CTEs), text analysis |
| **Hacker News** | https://hn.algolia.com/api or BigQuery mirror | Time-series, tree structure (comments form a tree) |
| **GitHub** | https://api.github.com or BigQuery | Event streams, large-scale aggregation |
| **OpenStreetMap** | Overpass API | Geometric / geographic queries (Section 1 type discussion) |
| **US Census** | https://api.census.gov | Demographics, joins, percentile reporting |

---

## PostgreSQL Sample Databases

For PostgreSQL-side demos (where DuckDB is overkill), the following ship as standard practice databases.

| Database | Domain | Source |
|----------|--------|--------|
| **Pagila** | DVD rental, full normalized | https://github.com/devrimgunduz/pagila |
| **Chinook** | Music store | https://github.com/lerocha/chinook-database |
| **AdventureWorks** | Bicycle store, complex schema | Microsoft sample, ported to Postgres |

---

## When to Reach for Which

| Class topic | Suggested dataset |
|-------------|-------------------|
| Day 10 SQL basics | Flights — straightforward, ~1M rows |
| Day 11 Joins | TPC-H (small scale) — joins were the original benchmark goal |
| Day 12 Aggregation | NYC Taxi — group by day, hour, borough |
| Day 13-14 Subqueries / CTEs | IMDb — actor-movie graph |
| Day 15-16 Windows | NYC Taxi for time-series, IMDb for ranking |
| Day 17 Recursion | OpenAlex citation graph, HN comment tree |
| Day 18 Views/Triggers | Pagila — full audit-log demos |
| Section 3 (Python + DuckDB) | Bring out the big ones: NYC Taxi multiple files |
| Section 4 Storage | TPC-H scale-factor experiments |
| Section 5 Optimization | TPC-H — EXPLAIN plan comparisons across engines |

---

## Privacy and Ethics Note

All datasets above are public.
Some (taxi, GitHub events) are pseudonymized but **not anonymized** — license terms apply.
Students using these for projects should:
- Cite the source in their report
- Respect the license (most are CC, Apache, or public-domain equivalent)
- Treat any human-identifiable column with appropriate care

---

[back](../index)
