---
layout: default
---

# Project 2: Advanced SQL Analytics

| | |
|---|---|
| **Weight** | 6% of course grade |
| **Released** | Monday, September 21, 2026 |
| **Due** | Friday, October 23, 2026 at 11:59 PM |
| **Type** | Individual |
| **Industry analog** | "Write the metrics": analytics queries with CTEs, window functions, recursion |

---

## Goal

Use your dataset (loaded in Project 1) to answer **8-10 analytics questions** that **require** advanced SQL: subqueries, common table expressions, window functions, and recursive CTEs.

Each query must show the kind of work a senior data engineer does. Naive solutions using only `SELECT … FROM … WHERE … GROUP BY` are **not** sufficient.

---

## Deliverables

```
cop5725fa26-project/
├── ... (from previous projects)
├── analytics/
│   ├── a01-running-totals.sql
│   ├── a02-top-n-per-group.sql
│   ├── a03-period-over-period.sql
│   ├── a04-cumulative-distribution.sql
│   ├── a05-recursive-hierarchy.sql
│   ├── a06-cte-pipeline.sql
│   ├── a07-naive-vs-window.sql     # required: shows both
│   ├── a08-deduplication.sql
│   └── ... 1-2 of your own choosing
├── analytics/results/
│   └── *.csv
├── notebook.ipynb                   # results + at least 2 charts
└── README.md                        # updated
```

### Required Patterns

At least one query covering each pattern:

| Pattern | Required SQL features |
|---------|----------------------|
| Top-N per group | `row_number()` or `rank()` with `PARTITION BY` |
| Running total | window aggregate with explicit frame |
| Period-over-period | `lag()` or `lead()` |
| Cumulative distribution | `cume_dist()` or `percent_rank()` |
| Hierarchical traversal | `WITH RECURSIVE` (org chart, comment tree, etc.) |
| Multi-step transformation | A CTE pipeline (`WITH a AS (...), b AS (...)`) |
| Naive vs window comparison | Same question, two implementations with timing |
| Deduplication by key | `row_number() = 1` pattern |

Each query file should have a header comment naming the question and the technique:

```sql
-- a02-top-n-per-group.sql
-- Question: Top 3 most-active users per region per month
-- Technique: row_number() over (PARTITION BY ... ORDER BY ...)
-- Project 2 requirement: top-N per group

WITH ranked AS (
  SELECT
    region, user_id, ym,
    activity_count,
    row_number() OVER (PARTITION BY region, ym ORDER BY activity_count DESC) AS rk
  FROM monthly_activity
)
SELECT region, user_id, ym, activity_count
FROM   ranked
WHERE  rk <= 3
ORDER BY region, ym, rk;
```

### The Naive-vs-Window Query (a07)

Write the same question two ways:

```sql
-- Naive form (correlated subquery or self-join)
SELECT ... ;

-- Window-function form
SELECT ... ;
```

Capture the timing of both with `EXPLAIN ANALYZE` and put the numbers in your `notebook.ipynb`.

The window form will be 10-100× faster in most cases. Show this concretely.

### `notebook.ipynb`

A Jupyter notebook that:

- Connects to your PostgreSQL (via `psycopg` + `pandas`) or DuckDB
- Runs each query (or a representative sample)
- Shows results as DataFrames
- Includes **at least 2 charts** (matplotlib, seaborn, plotly — your choice)
- Narrates findings in markdown cells

The notebook should be runnable end-to-end. The TA will execute it.

### Updated `README.md`

Add a "Project 2 Analytics" section:

- List of the 8-10 questions with one-sentence answers
- Pointer to the naive-vs-window timing
- Pointer to the notebook
- Key finding from your dataset

---

## Submission

```bash
git add analytics/ notebook.ipynb README.md
git commit -m "Project 2: advanced SQL analytics"
git tag v2
git push origin main v2
```

---

## Grading Rubric

100 points total.

| Component | Points | Criteria |
|-----------|--------|----------|
| **Query coverage** | 30 | All required patterns present and correct |
| **Query craftsmanship** | 20 | Clean SQL; readable formatting; appropriate window frames |
| **Naive vs window (a07)** | 15 | Both forms work; timings captured; explanation accurate |
| **Notebook** | 15 | Runnable end-to-end; at least 2 charts; narrative present |
| **Documentation** | 10 | README explains the analytical questions clearly |
| **Repo hygiene** | 10 | Tag `v2`; commit history; one query per file; result CSVs present |

### Peer-Grading Subset

Peer reviewers grade only:

1. **Question interestingness** (0-5): do the queries answer questions a real analyst would ask?
2. **Window-function correctness** (0-5): do `OVER` clauses make sense?
3. **Notebook narrative** (0-5): is there a finding, or just a wall of tables?

Peer scores normalized and contribute **30%**; instructor + TA **70%**.

---

## Presentations

- **Monday, October 26:** small-group breakouts; each student presents one query in 3-4 minutes.
- **Wednesday, October 28:** winners present to the class.

Present the **naive vs window** query if you want to show off the most dramatic improvement.

---

## Common Pitfalls

- Window functions in `WHERE` (they evaluate after; wrap in subquery)
- `last_value()` without explicit frame (returns current row; use `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`)
- Recursive CTE without termination (use a depth bound or path array)
- Reusing Project 1's queries with light tweaks — they should be **new** analytical questions
- Charts that are screenshots of `df.head()` — actually visualize

---

## FAQ

**Q: Can I use DuckDB for Project 2?**
A: Yes — DuckDB supports all the same window functions and recursive CTEs as PostgreSQL. Some students find DuckDB faster for large analytical queries.

**Q: My dataset doesn't have a natural hierarchy. How do I write a recursive CTE?**
A: Most datasets have *some* hierarchy: timestamps form a sequence (Fibonacci-style numeric sequence), categories form parent-child relationships, threads form trees, social networks form graphs. Be creative.

**Q: My naive query is *faster* than the window function version!**
A: That's a real finding. Document it honestly. Sometimes the simpler form is better — the optimizer is smart.

---

[back](index)
