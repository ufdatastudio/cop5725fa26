---
layout: default
---

# Projects

Projects in COP 5725 mirror the work a junior data engineer does in industry:

- **Pick a real dataset.** A letter rule assigns your dataset family; you choose the slice within it.
- **Build it up over the semester.** Each project iterates on the same data.
- **Ship to a GitHub repo.** Submissions are git tags on a personal repository.
- **Document like onboarding.** Each repo's README should let a new engineer load and run your work.

Projects are **individual**.
Each student creates a **private** GitHub repository on their own account named exactly `cop5725fa26-project`, and adds `cegme` (instructor) and [`rkc8626`](https://github.com/rkc8626) (TA, Ray Chen) as Admins so the TA and instructor can review.

The repo URL becomes your project handle; you register it once in Project 0 (P/F) and use the same repo through the Final Project.

---

## Project Schedule

Project weights grow with scope; each builds on the same dataset.

| Project | Weight | Released | Due | Topic |
|---------|--------|----------|-----|-------|
| [Project 0](project0) | P/F | Fri, Aug 21 | Fri, Sep 4 | Setup + dataset selection + initial load |
| Project 1 | 4% | Wed, Sep 2 | Fri, Sep 25 | Schema design + SQL ETL + basic queries |
| Project 2 | 6% | Mon, Sep 21 | Fri, Oct 23 | Advanced SQL analytics on your dataset |
| Project 3 | 10% | Mon, Oct 19 | Fri, Nov 13 | Indexing and query optimization investigation |
| Final Project | 15% | Mon, Nov 16 | Wed, Dec 9 | Capstone — full database-backed solution |

The full specification for each project is posted here when it is released.

---

## Project 0: Setup and Dataset Selection (P/F)

**Goal:** Establish your repo, install your tools, select your dataset.

**Deliverables in your repo:**

- `README.md` — your name, dataset choice, why you picked it
- `setup/verify.py` — runs the four-check script (`uv` on PATH, packages import, SQLite round-trip, DuckDB queries your sample), plus an optional PostgreSQL check via `DATABASE_URL`
- `data/source.md` — pointer to where the raw data lives, including licence
- `data/sample.csv` (or `.parquet`) — first 1000 rows you can already query

**Submission:** Tag the commit `v0` and push.

**How to select a dataset:** The first letter of your last name maps to a dataset family; you pick the slice within it. The table is in the [Project 0 spec](project0).

**Repo setup checklist:**
1. Create a new private repo on GitHub named `cop5725fa26-project`
2. Add `cegme` and [`rkc8626`](https://github.com/rkc8626) as Admins under Settings → Collaborators
3. Push your Project 0 work
4. Register the repo URL via the Canvas Project 0 submission

---

{% comment %} Hidden until each project is released. Move a section above this block to publish it.

## Project 1: Schema Design + SQL ETL (4%)

**Goal:** Turn raw data into a queryable PostgreSQL schema, then answer 10-15 business-style questions.

**Industry analog:** the "load the new data source" ticket you get in week one of a real data team.

**Deliverables in your repo:**

- `schema.sql` — `CREATE TABLE` statements, normalized to at least 3NF
- `er-diagram.png` or `er-diagram.md` — ER diagram for your schema
- `load.py` — script that ETLs raw source into your tables
- `queries/q01.sql` through `q15.sql` — one file per question, with a comment naming the question
- `queries/results/` — captured outputs (CSV or markdown table)
- `README.md` updated with: schema explanation, query summaries, how to reproduce

**Submission:** Tag the commit `v1` and push.

---

## Project 2: Advanced SQL Analytics (6%)

**Goal:** Use the same dataset and answer 8-10 questions that *require* advanced SQL — CTEs, window functions, recursive queries.

**Industry analog:** the "write the metrics" ticket. Mature data teams expect every analytics engineer to reach for windows and CTEs by reflex.

**Deliverables:**

- `analytics/` — one SQL file per question with a header comment naming the question and which advanced feature(s) it uses
- At least one query rewritten **two ways** (naive vs window or recursive), with timing comparison
- `notebook.ipynb` — Jupyter notebook showing results and at least two charts
- `README.md` updated: list of questions answered, key findings

**Submission:** Tag the commit `v2` and push.

---

## Project 3: Indexing and Query Optimization (10%)

**Goal:** Treat your database as a system that can be **measured and tuned**. Identify slow queries, add indexes, restructure where useful, prove it worked.

**Industry analog:** the "this dashboard is slow, fix it" ticket. By Section 5 the class will have the language and tools to do this seriously.

**Deliverables:**

- `bench/` — scripts that run a set of queries and capture timings (use `\timing` or `EXPLAIN ANALYZE`)
- `bench/plans-before/` and `bench/plans-after/` — `EXPLAIN ANALYZE` output before and after your changes
- `tuning.md` — narrative report: what was slow, why, what you did, how much faster
- `README.md` updated: how to reproduce the benchmark

**Submission:** Tag the commit `v3` and push.

---

## Final Project: Capstone (15%)

**Goal:** Ship something complete. The dataset you have been growing all semester now drives a real artifact.

**Choose one shape:**

- **Analytics report** — a 4-6 page report with embedded queries, charts, and interpretation that answers a substantive question
- **Data API** — a Postgres-backed REST API (FastAPI, Flask, or similar) exposing queries you wrote in Projects 1-3
- **Dashboard** — a small interactive dashboard (Streamlit, Dash, Observable) backed by your schema
- **Pipeline** — an automated daily-refresh pipeline that loads new data, runs validation, updates a materialized view

**Deliverables:**

- The artifact itself (running locally or recorded)
- A 3-5 minute demo video showing it work
- `README.md` framed as if onboarding the next engineer
- `architecture.md` — a single page on how the pieces fit, with one diagram
- Tagged release `final` and pushed before the deadline

---

{% endcomment %}

## Peer Grading and Presentations

Each project gets three peer reviews from anonymized classmates using the published rubric.
Peer scores are 30% of the project grade; instructor/TA grade is 70%.

After each deadline (except Project 0 and Final):

- **Monday after deadline:** small breakout groups (4-5 students) — each student demos for 3-4 minutes; group votes for the strongest presentation.
- **Wednesday:** the highest-voted student from each group presents to the full class.

For the Final Project, presentations happen during the final exam block on Fri Dec 11, 10:00 AM-12:00 PM in MALA 1000.

---

## Why Individual GitHub Repos

Three reasons this model worked in [CIS 6930 Spring 2026](https://github.com/cegme/cis6930sp26):

1. **Unique work by construction.** Different students pick different datasets → different schemas, queries, results.
2. **Visible iteration.** Commit history tells the story; the TA sees how you arrived at the answer, not just the answer.
3. **Portfolio value.** You leave the semester with a public repo demonstrating database engineering skill — useful for internships and interviews.

---

## Rubrics

Each project rubric is published in [`rubrics/`](../rubrics/) at the time the project is released.
Every rubric has two sections: the full instructor rubric and a peer-grading subset (3-5 dimensions).

---

[back](../index)
