---
layout: default
---

# Project 1: Schema Design and SQL ETL
{: .no_toc}

| | |
|---|---|
| **Weight** | 4% of course grade |
| **Released** | Wednesday, September 2, 2026 |
| **Due** | Friday, September 25, 2026 at 11:59 PM |
| **ER diagram in repo** | Friday, September 11, 2026 at 11:59 PM (see [Schema Reconstruction Review](#schema-reconstruction-review))\* |
| **Schema reviews** | Friday, September 18, 2026 at 11:59 PM\* |

\* Submission details for the review steps may change. We will announce them before each step.

---

Project 1 turns the dataset you selected in Project 0 into a normalized PostgreSQL database.
You will design a schema in at least third normal form, write a Python script that loads your raw data into it, and answer 8 questions in SQL that a named stakeholder would ask.
Your repo's `README.md` should let a data engineer who has never seen your code load the database and run every query.

Midway through the project, two classmates rebuild a schema from your ER diagram alone, and you rebuild schemas from two of theirs.
You then write a short response to the differences and revise your design before the deadline.
That exchange is the peer-review component of this project.

The work continues in the same `cop5725fa26-project` repository, you will need to tag the new version when you submit.

## Contents
{: .no_toc}

* TOC
{:toc}

---

## Building on Project 0

Project 0 gave you a repository, a `pyproject.toml` managed by `uv`, a `.env.example` template, a `data/source.md` that documents where your raw data lives, and a 1000-row `data/sample.csv`.
Project 1 uses each of these.

- `data/source.md` stays a human-readable description of where the raw data comes from. `load.py` fetches from the URL or follows the steps you wrote there, so a reader can check that the two agree.
- `data/sample.csv` stays in the repo as a smoke test. Point `load.py` at it while you develop, then at the full slice.
- `setup/verify.py` still runs. Once `DATABASE_URL` is set, its PostgreSQL check confirms your connection before you start loading.
- `pyproject.toml` needs `psycopg` as a base dependency now that PostgreSQL is required. Run `uv add "psycopg[binary]"` once; the `postgres` optional extra from Project 0 can stay or go. [Introduction to uv and pyproject.toml](../documents/uv-pyproject-intro) covers the commands.

Raw downloads belong in `data/raw/`, which you add to `.gitignore`.
The repository holds the instructions for fetching the data, never the multi-gigabyte files themselves.

### Your dataset

Keep the dataset you selected in Project 0.
You may add to it, for example a second month of trips, the ratings table alongside the titles, or a neighboring field of study, and adding is encouraged when your scenario needs it.
Ask the instructor by email before removing any of the Project 0 data or switching to a different dataset.

### What goes in `.env`

`.env` holds the values that differ between your machine and the TA's, and nothing else.
It must contain:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

If `load.py` reads anything else from the environment, such as a Census API key or a directory for raw files, add that variable too.
`.env.example` lists every variable `.env` needs, with placeholder values and a comment saying where to get the real one, so the TA can build a working `.env` from it in under a minute.
`.env` itself never enters git.

---

## PostgreSQL for This Project

PostgreSQL was optional in Project 0 and is required here.
Your deliverable is a pair of scripts, `schema.sql` and `load.py`, that create and populate a database from scratch.
The TA grades by running them against an empty PostgreSQL server on HiPerGator, so the scripts cannot assume anything about the server except the connection string in `DATABASE_URL`.

We recommend developing on HiPerGator as well, so that your load and queries run in the same place we will grade them.
But, HiPerGator is not required.
Every student has an account on the class allocation.
[HiPerGator for COP 5725](../documents/hipergator-getting-started) covers logging in, storage under `/blue/cop5725/`, and running jobs, and [Running Your Own PostgreSQL Server on HiPerGator](../documents/hipergator-postgres-apptainer) starts a server for you with a few commands.
Its `pg-info.sh` script prints the `DATABASE_URL` line for your `.env`.
HiPerGator is also the only option that fits a full-size slice for the larger dataset families.

Any of these servers works for development as long as `schema.sql` and `load.py` behave the same on the grading server.

1. A local install. [Postgres.app](https://postgresapp.com/) on macOS, the [EDB installer](https://www.postgresql.org/download/windows/) on Windows, or your distribution's package on Linux.
2. Docker. One command starts a disposable server on port 5432:

   ```bash
   docker run --name cop5725 -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```

   The matching connection string is `postgresql://postgres:postgres@localhost:5432/postgres`.
3. The department's hosted server. Follow [Connecting to CISE PostgreSQL](../documents/cise-postgres-guide) for registration and the SSH tunnel.

Whichever you choose, put the connection string in `.env` as `DATABASE_URL` and confirm it with the Project 0 verify script:

```bash
uv run --env-file .env setup/verify.py
```

The `psql` examples below read `DATABASE_URL` from your shell.
Export the variables in `.env` once per terminal session with `set -a; source .env; set +a`.

---

## Design Scenarios

A schema is easier to design when you know who will query it.
Pick one of the scenarios below for your dataset family, adapt it, or write your own.
Your own scenario is welcome as long as it names a stakeholder and the decisions they make with the data.
State your scenario in one sentence at the top of your README's schema overview.
The business questions in `queries/` should be questions your stakeholder would ask.

A scenario names a stakeholder and their concerns, and the schema follows from them.
Two students who pick the same scenario will still produce different schemas because their slices, entities, and questions differ.

### NYC Taxi (A-E)

- You are an analyst at the Taxi and Limousine Commission (TLC). The commissioners want monthly reporting on trip volume, fare revenue, and tipping behavior broken down by pickup zone and payment type.
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

By the September 25 deadline, the `main` branch of `cop5725fa26-project` must contain:

```
cop5725fa26-project/
├── README.md            # Project 0 content plus the Project 1 sections below
├── pyproject.toml       # from Project 0, now with psycopg as a base dependency
├── .env.example         # from Project 0, plus any new variables
├── .gitignore           # from Project 0, plus data/raw/
├── data/
│   ├── source.md        # from Project 0
│   ├── sample.csv       # from Project 0
│   └── raw/             # gitignored; load.py fetches or reads raw files here
├── setup/
│   └── verify.py        # from Project 0
├── schema.sql           # CREATE TABLE statements, 3NF or better
├── er-diagram.png       # anonymous; the Sep 11 version goes to two classmates
├── load.py              # ETL script
├── queries/
│   ├── q01.sql          # one file per question
│   ├── q02.sql
│   ├── ...
│   ├── q08.sql
│   └── results/
│       ├── q01.csv      # first 100 rows of each query's output
│       └── ...
├── schema.md            # your response to the two reviews of your diagram
└── COLLABORATORS.md     # who and what helped, or a statement that nothing did
```

### `schema.sql`

A complete script that drops and recreates your tables. It must:

- Begin with `DROP TABLE IF EXISTS ... CASCADE` for each table so the script can run repeatedly
- Define one table per entity and per many-to-many relationship in your diagram, which we expect to be more than 5 tables
- Reach at least 3NF for every table
- Declare `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, and `NOT NULL` constraints where the data justifies them
- Use PostgreSQL data types that fit the values, such as `numeric` for money, `bigint` for identifiers that can exceed two billion, and `timestamptz` for instants
- Carry a `COMMENT ON TABLE` or a SQL comment naming each table's role

The schema should reflect your slice's natural structure.
Your tables, columns, and constraints will differ from a classmate's even inside the same dataset family.

### `er-diagram.png`

A diagram of your schema in Chen or crow's-foot notation, matching the tables in `schema.sql`.
We expect more than 5 entities and more than 5 relationships.
A real dataset in any of the five families supports that comfortably, and a diagram with fewer usually means a flat file has not been broken apart yet.

Two classmates will write DDL from this file without seeing your `schema.sql`, so the diagram has to carry everything a schema needs:

- Every entity with its attributes, and the key attributes marked
- Every relationship with cardinality on both ends, and participation (optional or mandatory) where it matters
- Weak entities and multi-valued attributes drawn as such, since they become separate tables
- No name, GatorLink, GitHub handle, or repository URL anywhere in the image

Acceptable sources:

- dbdiagram.io
- DataGrip's Diagrams view
- A mermaid `erDiagram` block rendered to PNG. You may also commit the source as `er-diagram.md`, but the PNG is what gets exchanged.
- A legible photo of a hand-drawn diagram

### `load.py`

A Python script that populates the database. It must:

- Connect using `DATABASE_URL` from the environment, never a hardcoded connection string or file path
- Run `schema.sql` first, so a second run rebuilds the same tables with the same row counts
- Fetch the raw data from the location described in `data/source.md` into `data/raw/` if it is not already there
- Insert rows through `psycopg`, or stage them with DuckDB and pandas before inserting
- Log progress with loguru or print statements, including the final row count per table

You may write the loading logic in another language, such as Go, Rust, or shell with `psql`, but `load.py` must still exist and run it, for example through `subprocess.run`.
The TA runs one command, and it is the one below.

The TA runs it with:

```bash
uv run --env-file .env load.py
```

Load the whole slice you selected in Project 0 when it fits on your machine.
Otherwise load a documented subset, such as one month of trips or one year of stories, and describe the cut in your README.
A loader that only handles the 1000-row sample does not meet the requirement.

### `queries/`

8 business questions, with at least one SQL file per question.
A question that takes two queries to answer gets two files, such as `q07a.sql` and `q07b.sql`.
Each file has this shape:

```sql
-- q01.sql
-- Question: How many trips started in each borough last month?
-- Difficulty: easy

SELECT z.borough, count(*) AS trips
FROM   trip t
JOIN   zone z ON z.zone_id = t.pickup_zone_id
GROUP BY z.borough
ORDER BY trips DESC;
```

Across the set, the queries must:

- Read as requests your [design scenario](#design-scenarios)'s stakeholder would make
- Include at least 3 queries that join two or more tables
- Include at least 2 queries with `GROUP BY`
- Include at least 1 `LEFT JOIN` that surfaces missing relationships, such as zones with no trips or authors with no citations
- Name their output columns instead of using `SELECT *`
- Range from easy (a count) to medium (multi-table joins with filtering and ordering)

Capture the first 100 rows of each result into `queries/results/`, one CSV per SQL file:

```bash
psql "$DATABASE_URL" --csv -f queries/q01.sql | head -n 101 > queries/results/q01.csv
```

### `COLLABORATORS.md`

A file documenting all collaboration and assistance on this project. List:

- Classmates you discussed concepts or approaches with, and what was discussed
- AI tools you used, such as ChatGPT, Claude, or Copilot, with what you used them for and how they contributed to your solution
- Online resources beyond those linked from this page, such as Stack Overflow posts, blog articles, or tutorials
- If you received no outside help, say so explicitly

This project is individual.
Discussing concepts with classmates is fine; the schema, the loader, the queries, and the writing must be your own.
The file is required for academic integrity, so be thorough and honest.

### Updated `README.md`

Keep the Project 0 sections and add:

- Your design scenario in one sentence, then a paragraph describing the schema
- How to fetch the raw data and run the load
- How to run a query, for example `psql "$DATABASE_URL" -f queries/q01.sql`
- Which subset you loaded, if not the whole slice
- Caveats you discovered in the data, such as duplicate keys, sentinel values, or columns that changed meaning over time

---

## Schema Reconstruction Review

Peer review for this project is an exchange of ER diagrams.
A diagram is a specification.
If a classmate cannot rebuild your schema from it, the diagram did not say what you meant, and finding that out two weeks before the deadline leaves time to fix it.

The plan below is how we intend to run the exchange.\*
We will contact you with the exact details, such as where the diagrams are posted, where you submit your reconstructions, and how your reviews come back to you, before each step.

### Step 1: commit your diagram (Friday, September 11)

Have `er-diagram.png` committed and pushed on `main` by 11:59 PM.
At the deadline we pull every diagram from every repository, so there is nothing to upload and no tag to make.
This is the draft that goes to your reviewers, so it must already meet the [diagram requirements](#er-diagrampng) above, including the rule that nothing in the image identifies you.
You will revise it before September 25; that is expected.

### Step 2: reconstruct two classmates' schemas (Friday, September 18)

We number the diagrams and post them where the class can fetch them, most likely a shared folder on HiPerGator.
Each student receives two numbers.
Those are the diagrams you reconstruct.
You do not learn whose they are, and you do not see their `schema.sql`.

For each diagram, write the DDL it specifies and save it as a `.sql` file named after the diagram number.
The file follows the same rules as your own `schema.sql`: it drops and creates the tables, declares keys and constraints, and runs cleanly against an empty database.
Where the diagram left a choice open, such as a missing cardinality or an attribute that could be a key, make a reasonable decision and list it in a comment block at the top of the file.
Keep your name out of the files.

Submit both files by 11:59 PM on Friday, September 18, most likely by placing them in a folder on HiPerGator that we will name when the diagram numbers go out.\*

### Step 3: respond and revise (with the September 25 submission)

We deliver the two reconstructions of your diagram to you, as an issue on your repository, by email, or by another method we will announce.
Expect them by Monday, September 21.

Compare them with your own `schema.sql` and write `schema.md` in your repository.
For each difference, say what it is and put it in one of three categories.

1. My diagram was ambiguous. The reviewer could not have known. Say what the diagram should have shown.
2. The reviewer misread the diagram. Point to the element they missed.
3. The reviewer found a real flaw. Say what was wrong with your schema and what the fix is.

Where the two reviewers disagree with each other, say which reading you intended and why the diagram allowed both.
Close with a short paragraph on what you changed in your diagram and schema as a result.
The `er-diagram.png` and `schema.sql` you tag on September 25 are the revised versions, and `schema.md` is the record of how they got there.

### What "match" means

The staff compare each reconstruction with the original on structure, using your `schema.md` to decide who owns each difference, and read the result as evidence for the schema design and documentation scores.
A match has the same set of tables, the same primary keys, and the same foreign keys pointing the same direction, with optional and mandatory participation reflected in `NOT NULL` on the foreign key columns.
Column types and names may differ without penalty.
Differences you file under category 1 count against your diagram.
Differences under category 2 count against the reviewer's reconstruction.
Differences under category 3 count for you when you own the flaw and revise, and the reviewer gets credit for finding it.
Two reviewers who independently reach the same schema as yours are strong evidence the diagram was clear.

---

## Pacing

The lectures that cover each piece of the project are scheduled during the three weeks it is open.

| Week | Lectures | Project 1 step |
|------|----------|----------------|
| Sep 2 to 4 | ER modeling, ER-to-relations | Pick a scenario, draw the ER diagram, list candidate tables |
| Sep 9 to 11 | Functional dependencies, normalization | Check every table for 3NF; push the diagram by Fri Sep 11 |
| Sep 14 to 18 | SQL DDL, joins, aggregation | Reconstruct your two assigned diagrams by Fri Sep 18; draft `schema.sql` and `load.py` |
| Sep 21 to 25 | Subqueries, CTEs, windows | Read your reviews, write `schema.md`, revise, finish the queries, tag `v1` |

Start the ER diagram this week, since it is due in nine days.
The data-loading step usually takes longer than students expect because real data has quirks the sample hid.

---

## Submission

Tag the commit you want graded `v1` and push it with `main` by September 25.

```bash
git add README.md COLLABORATORS.md pyproject.toml uv.lock .env.example .gitignore schema.sql schema.md er-diagram.png load.py queries/
git commit -m "Project 1: schema, ETL, queries"
git tag v1
git push origin main v1
```

The September 11 diagram is read from `main`, and the two reconstructions are submitted separately on September 18.\* Neither needs a tag.

---

## Grading Rubric

100 points total.
The staff grade the `v1` tag on HiPerGator by running `schema.sql` and `load.py` against an empty database, then every query, then reading the README, `schema.md`, and `COLLABORATORS.md`.

| Component | Points | Criteria |
|-----------|--------|----------|
| Schema design | 25 | 3NF or better; types fit the values; constraints declared; relationships between tables |
| ETL | 15 | `load.py` runs from an empty database; runs twice without duplicating rows; reports errors instead of silently skipping rows |
| Queries | 30 | 8 questions answered; required patterns present; results correct; readable SQL |
| Documentation | 10 | README reproduces the load; ER diagram matches `schema.sql` and gave your reviewers enough to rebuild it |
| Schema reviews | 10 | Diagram on `main` by Sep 11; both reconstructions submitted by Sep 18; each runs and follows its diagram; the header comments name the real ambiguities |
| Review response | 5 | `schema.md` classifies every difference honestly and explains the revisions you made |
| Repo hygiene | 5 | Tag `v1` exists; `COLLABORATORS.md` present and honest; commit history readable; no committed credentials or raw data |

The review points are yours alone: they depend on what you submitted and when, not on what your reviewers did.
The two reconstructions of your diagram are evidence when the staff grade your schema design and documentation, so a clear diagram protects you and a careful reconstruction protects your classmate.

---

## Presentations

- Monday, September 28: Small breakout groups of 4 to 5 students. Each student presents in 3 to 4 minutes. The group votes for the strongest presentation.
- Wednesday, September 30: Winners present to the full class.

Present one question your stakeholder cares about, the SQL that answers it, and what the result shows.

---

## Common Pitfalls

- One giant table. A flat file copied into a single table is not a schema. Normalize.
- Missing constraints. A primary key without `NOT NULL`, or two tables that obviously relate with no foreign key between them.
- A diagram that only you can read. Missing cardinalities and unmarked keys cost points twice, once in documentation and again when your reviewer has to guess.
- Hardcoded paths or credentials in `load.py`. Use `DATABASE_URL` and paths relative to the repo root.
- A loader that is not repeatable. Running `load.py` twice should leave the same row counts. Running `schema.sql` first, or using `ON CONFLICT`, both work.
- Eight counts. Eight `SELECT count(*)` queries do not show eight questions.
- Committing raw data. Multi-gigabyte files in git make the repo unusable. Keep them in `data/raw/` and gitignored.

---

## FAQ

**Q: Can I use DuckDB instead of PostgreSQL?**
A: The database you deliver must be PostgreSQL, since Project 3 tunes it with PostgreSQL indexes and query plans. DuckDB is welcome inside `load.py` for reading Parquet or CSV files before you insert.

**Q: My dataset is too big to load locally.**
A: Run the server on HiPerGator, where the full slice fits. If you still need to cut, load a documented subset, such as one month of taxi trips or one year of stories, and say in your README what you cut and why.

**Q: My dataset is a single denormalized CSV.**
A: That is expected for most real-world data. Your `load.py` splits it into normalized tables, which is the point of the project.

**Q: A diagram I received is unreadable or missing.**
A: Email the course staff the day you receive it. You will get a different diagram, and the original author hears about it through their documentation score.

**Q: A reconstruction of my diagram is nothing like my schema.**
A: That is the case `schema.md` is for. Classify each difference and argue it. The staff read both sides before grading either of you.

**Q: My diagram was not on `main` at the September 11 deadline.**
A: You lose the review points for it and the class cannot review you, but the rest of the project is unaffected. Email the staff, since a late diagram can still be numbered if the assignments have not gone out.

**Q: I proposed an alternative dataset in Project 0.**
A: Write your own scenario in the style of the ones above and state it in your README.

---

[back](index)
