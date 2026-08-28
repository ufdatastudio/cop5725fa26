---
layout: default
---

# Project 1: Schema Design and SQL ETL

| | |
|---|---|
| **Weight** | 4% of course grade |
| **Released** | Wednesday, September 2, 2026 |
| **Due** | Friday, September 25, 2026 at 11:59 PM |

---

## Goal

Turn raw data from your claimed dataset into a queryable, normalized PostgreSQL schema, and answer 12-15 business-style questions in SQL.

Your repo's `README.md` should let any data engineer load and run your work without reading your code.

---

## Design Scenarios

A schema is easier to design when you know who will query it.
Pick one of the scenarios below for your dataset family, adapt it, or invent your own.
State your scenario in one sentence at the top of your README's schema overview.
Your business questions in `queries/` should be questions your stakeholder would actually ask.

The scenario names a stakeholder, not a table list.
Two students using the same scenario will still produce different schemas because their slices, entities, and questions differ.

### NYC Taxi (A-E)

- You are an analyst at the TLC. The commissioners want monthly reporting on trip volume, fare revenue, and tipping behavior broken down by pickup zone and payment type.
- You run operations for a fleet company. Dispatch wants to know where and when to stage vehicles, so they need demand by borough, hour of day, and day of week.

### IMDb (F-J)

- You work on the acquisitions team of a streaming service. They want to build a catalog in your genre and need to know which titles, people, and eras rate well with audiences.
- You maintain the research database for an entertainment newsroom. Reporters ask career-trajectory questions, such as how a director's ratings have moved across their filmography.

### Hacker News (K-O)

- You lead developer relations for a company in your slice's topic area. Marketing wants to know how the topic is discussed, which stories drew the deepest comment threads, and who the recurring voices are.
- You build moderation tooling for a discussion forum. The trust-and-safety team needs posting patterns per user, comment-tree depth, and activity trends over time.

### OpenAlex (P-T)

- You work in a university research office. The provost wants an annual report on your field's output, covering venues, collaboration patterns, and citation impact.
- You are building a literature-mapping tool for new graduate students. It needs works, authors, and the citation links between them to suggest what to read next.

### US Census (U-Z)

- You are a data analyst for a state economic development agency. Site-selection consultants ask for county comparisons on population, income, and housing.
- You support a nonprofit that places services by need. The program team asks which areas have the largest populations matching the groups they serve.

---

## Deliverables

By the deadline, the `main` branch of `cop5725fa26-project` must contain:

```
cop5725fa26-project/
├── README.md            # updated with Project 1 instructions
├── data/                # from Project 0
├── setup/               # from Project 0
├── schema.sql           # CREATE TABLE statements (3NF or better)
├── er-diagram.png       # or er-diagram.md if Chen notation in text
├── load.py              # ETL script
├── queries/
│   ├── q01.sql          # one file per question
│   ├── q02.sql
│   ├── ...
│   └── q15.sql
├── queries/results/
│   ├── q01.csv          # captured outputs
│   └── ...
├── readings/
│   └── codd-1970.md     # one-page reading response
└── .gitignore
```

### `schema.sql`

A complete `CREATE TABLE` script that:

- Defines at least 3 tables (more is fine)
- Reaches **at least 3NF** for every table
- Declares appropriate `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL` constraints
- Uses appropriate PostgreSQL data types (no `text` for amounts, no `int` for IDs > 2 billion, etc.)
- Includes comments naming each table's role

The schema should reflect your dataset's natural structure. Two students cannot have identical schemas (different datasets → different schemas).

### `er-diagram.png`

A diagram of your schema in Chen or crow's-foot notation. Tools that produce acceptable output:

- dbdiagram.io
- DataGrip's "Diagrams"
- mermaid `erDiagram` rendered to PNG
- Hand-drawn (legible) photo of paper

### `load.py`

A Python script that:

- Reads `data/source.md` to locate the raw data
- Loads the raw data into PostgreSQL via `psycopg` or `duckdb` + `INSERT ... SELECT`
- Is idempotent (running twice should not double the rows)
- Prints progress (loguru, simple print, your call)

The TA must be able to run `python load.py` against an empty schema and get a populated database.

### `queries/`

12-15 SQL files, one per business question. Each file is structured:

```sql
-- q01.sql
-- Question: How many records are in each major category?
-- Difficulty: easy

SELECT category, count(*) AS n
FROM   your_table
GROUP BY category
ORDER BY n DESC;
```

Questions should:

- Read as requests your [design scenario](#design-scenarios)'s stakeholder would make
- Include at least **3 joins**
- Include at least **2 GROUP BY** queries
- Include at least **1 LEFT JOIN** to find missing relationships
- Avoid `SELECT *` in final answers (be intentional about columns)
- Range from easy (count) to medium (multi-table joins + filtering + ordering)

Results in `queries/results/qN.csv` show the first 100 rows of each query's output.

### `readings/codd-1970.md`

A one-page (300-500 words) response to Codd's 1970 paper. Address:

- What is Codd's central claim?
- Why was the relational model controversial in 1970?
- How does your dataset benefit from being structured relationally?

This is a reading response, not a summary. We grade based on engagement, not coverage.

### Updated `README.md`

Update Project 0's README to add:

- Schema overview (one paragraph)
- How to reproduce the load (`python load.py`)
- How to run a query (`psql -f queries/q01.sql`)
- Any caveats about the dataset you discovered

---

## Submission

```bash
git add schema.sql er-diagram.png load.py queries/ readings/
git commit -m "Project 1: schema, ETL, queries"
git tag v1
git push origin main v1
```

---

## Grading Rubric

100 points total.

| Component | Points | Criteria |
|-----------|--------|----------|
| **Schema design** | 25 | 3NF or better; appropriate types; constraints; cross-table relationships |
| **ETL** | 15 | `load.py` runs end-to-end; idempotent; handles errors gracefully |
| **Queries** | 30 | 12-15 queries; cover required patterns; correct results; readable |
| **Documentation** | 15 | README explains how to reproduce; ER diagram matches schema |
| **Reading response** | 10 | Engages with Codd 1970; not a summary; reasonable arguments |
| **Repo hygiene** | 5 | Tag `v1` exists; commit history readable; no committed credentials |

### Peer-Grading Subset

Peer reviewers grade only:

1. **Schema clarity** (0-5): can a stranger understand the design?
2. **Query quality** (0-5): do the queries answer the questions cleanly?
3. **Reproducibility** (0-5): can you reproduce the load from the README?

Peer scores are normalized and contribute **30%** of the final score. Instructor + TA contribute the remaining **70%**.

---

## Presentations

- **Monday, September 28:** Small breakout groups (4-5 students). Each student presents in 3-4 minutes. Group votes for the strongest presentation.
- **Wednesday, September 30:** Winners present to the full class.

The presentation should answer one of your interesting questions and show the SQL behind it.

---

## Common Pitfalls

- **Unnormalized schemas** — flat files copied directly into one giant table. Normalize.
- **Missing constraints** — PK without NOT NULL, no FK between obviously related tables.
- **Hardcoded paths** in `load.py` — use `os.environ` or relative paths.
- **No idempotency** — running `load.py` twice creates duplicates. Add `TRUNCATE` or `ON CONFLICT`.
- **Trivial queries** — 15 `SELECT count(*)` queries do not show 15 questions.

---

## FAQ

**Q: Can I use DuckDB instead of PostgreSQL?**
A: PostgreSQL is required for Project 1 specifically (we test schema constraints, which DuckDB handles differently). Projects 2-onwards may use either or both.

**Q: My dataset is too big to load locally.**
A: Load a representative sample (e.g., one year). Document the sampling in your README.

**Q: My dataset is a single denormalized CSV.**
A: That's expected for most real-world data. Your `load.py` should split it into normalized tables.

---

[back](index)
