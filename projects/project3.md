---
layout: default
---

# Project 3: Indexing and Query Optimization

| | |
|---|---|
| **Weight** | 10% of course grade |
| **Released** | Monday, October 19, 2026 |
| **Due** | Friday, November 13, 2026 at 11:59 PM |
| **Type** | Individual |

---

## Goal

Treat your database as a **system that can be measured and tuned**. Identify the slowest queries on your dataset. Form hypotheses about why. Apply remedies (indexes, restructuring, materialization). **Measure** before and after. Write a tuning report that a senior engineer would believe.

This is the most rigorous project before the capstone. The optimization material from Days 24-34 directly informs every part of it.

---

## Deliverables

```
cop5725fa26-project/
├── ... (from previous projects)
├── bench/
│   ├── benchmark.py         # runs the workload and captures timings
│   ├── queries/             # 5-10 queries to benchmark
│   │   ├── b01.sql
│   │   └── ...
│   ├── plans-before/        # EXPLAIN ANALYZE output before tuning
│   │   ├── b01.txt
│   │   └── ...
│   └── plans-after/         # EXPLAIN ANALYZE output after tuning
│       ├── b01.txt
│       └── ...
├── tuning.md                # narrative report
├── schema-changes.sql       # CREATE INDEX, ALTER TABLE, etc.
└── README.md                # updated
```

### `bench/queries/`

5-10 representative queries from your project. These should be queries that **actually matter** for your dataset — the kind a real user would run frequently. Mix of:

- 2-3 simple point lookups (good for `WHERE pk = ?`)
- 2-3 range queries (good for `WHERE date BETWEEN ?`)
- 2-3 aggregations (good for `GROUP BY`)
- 1-2 joins (good for multi-table)

Each query gets a header comment explaining the question.

### `bench/benchmark.py`

A Python script that:

- Connects to PostgreSQL (and optionally DuckDB)
- Runs each query 3-5 times, captures `EXPLAIN (ANALYZE, BUFFERS)`
- Records elapsed time per run
- Outputs a CSV: query_id, run_number, elapsed_ms

The script should be runnable both **before** and **after** schema changes. The same code, two outputs.

### `bench/plans-before/` and `bench/plans-after/`

For each benchmark query:

- One `.txt` file with the full `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` output, **before** any tuning
- One matching `.txt` file with the output **after** tuning

These plans are the evidence. The grader will read them.

### `schema-changes.sql`

Every change you made: `CREATE INDEX`, `ALTER TABLE`, `CLUSTER`, `CREATE MATERIALIZED VIEW`, etc.

```sql
-- Index for the date-range query
CREATE INDEX idx_events_created_at_brin
  ON events USING BRIN (created_at);

-- Index for the lookup query
CREATE INDEX CONCURRENTLY idx_users_email
  ON users (lower(email));

-- Partial index for the active-rows query
CREATE INDEX idx_orders_pending
  ON orders (created_at)
  WHERE status = 'pending';
```

Each statement gets a comment explaining what query it accelerates.

### `tuning.md`

The narrative report. 2-4 pages. Required sections:

#### 1. Workload Summary

What queries does your dataset's real use case run? Why these and not others?

#### 2. Initial Measurements

For each benchmark query, the baseline:
- What plan does PostgreSQL choose?
- What's the bottleneck (Seq Scan? Sort spill? Hash Join with disk batches?)
- Median elapsed time across runs

#### 3. Hypotheses and Interventions

For each slow query:
- What did you think the bottleneck was?
- What did you try?
- How did the plan change?
- How did the timing change?

Be honest about failed experiments. A change that made things slower is still data.

#### 4. Final Measurements

Same table as Section 2, post-tuning. Side-by-side comparison with the baseline.

#### 5. What You Would Do Differently

If you were running this on production data 10× the size, what additional tools would you reach for? (Partitioning, replication, materialized views, etc.) One paragraph.

### Updated `README.md`

Add a "Project 3 Tuning" section:

- Pointer to `tuning.md`
- Top three improvements with numbers ("Query b03: 4.2s → 38ms after BRIN index")
- The reproduction recipe

---

## Submission

```bash
git add bench/ tuning.md schema-changes.sql README.md
git commit -m "Project 3: indexing and query optimization"
git tag v3
git push origin main v3
```

---

## Grading Rubric

100 points total.

| Component | Points | Criteria |
|-----------|--------|----------|
| **Workload selection** | 10 | Queries reflect real use cases; mix of patterns |
| **Baseline measurements** | 15 | All `plans-before/` present; timings captured |
| **Tuning interventions** | 25 | Index/restructure choices are appropriate; multiple types tried |
| **Post-tuning measurements** | 15 | `plans-after/` present; clear improvement (or honest no-change) |
| **`tuning.md` narrative** | 25 | Hypotheses stated; interventions explained; measurements compared |
| **Repo hygiene** | 10 | Tag `v3`; `benchmark.py` reproducible; commit history readable |

### Peer-Grading Subset

Peer reviewers grade only:

1. **Tuning narrative clarity** (0-5): does the report tell a coherent story?
2. **Plan-reading skill** (0-5): are the EXPLAIN outputs interpreted correctly?
3. **Honesty** (0-5): does the student admit failed experiments and surprising results?

Peer scores normalized and contribute **30%**; instructor + TA **70%**.

---

## Presentations

- **Monday, November 16:** small-group breakouts. Each student picks **one** before/after comparison and walks through it in 3-4 minutes.
- **Friday, November 20:** winners present to the class.

The best presentations are the most surprising ones — a 100× speedup, or a tuning intervention that *backfired* and taught something interesting.

---

## Common Pitfalls

- **Adding indexes to every column** — many indexes hurt write performance and waste space. The point is **which** index.
- **Single-run timing** — variance is high. Use median across 3-5 runs.
- **Not capturing cold/warm cache** — your second run is always faster. Either capture both, or run a `RESET` between runs.
- **Ignoring autovacuum / statistics** — sometimes `ANALYZE` alone fixes a "slow query".
- **Comparing different machines** — keep before/after on the same machine, same load.

---

## FAQ

**Q: Can I use DuckDB for Project 3?**
A: PostgreSQL is required for the indexing portion (DuckDB has limited explicit-index support). You may use DuckDB for some queries to compare engines.

**Q: My dataset is too small to show meaningful tuning effects.**
A: Document that. Run the same workload on a scaled-up version (DuckDB's `INSERT INTO ... SELECT * FROM ... CROSS JOIN generate_series(1, 100)` is one way to amplify).

**Q: My query is already fast. Should I still tune it?**
A: Find a slower one. The point of Project 3 is the tuning process, not chasing milliseconds on already-fast queries.

**Q: Do I have to use partial / expression / BRIN indexes?**
A: No — use whatever fits. But the rubric rewards demonstrating multiple index types appropriately.

---

[back](index)
