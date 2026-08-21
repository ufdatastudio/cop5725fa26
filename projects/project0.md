---
layout: default
---

# Project 0: Environment Setup and Dataset Claim

| | |
|---|---|
| **Weight** | Pass / Fail (not weighted in grade table; failure to submit = one letter penalty) |
| **Released** | Friday, August 21, 2026 |
| **Due** | Friday, September 4, 2026 at 11:59 PM |
| **Type** | Individual |
| **Industry analog** | The "onboarding ticket": install tools, pick the dataset you will own |

---

## Goal

Three things:

1. Stand up your **local development environment**: SQLite, DuckDB, and Python with `uv`. SQLite ships inside Python's standard library, so it needs no install of its own.
2. **Select your dataset** with the letter rule below. No sign-up or coordination is needed.
3. Create your **personal project repository** on GitHub.

PostgreSQL is optional in Project 0, and nothing here requires a running server. We will provide class PostgreSQL resources later in the semester. If you already run your own server, you can point the verify script at it with the `DATABASE_URL` environment variable and it will test the connection too.

Bookmark the official documentation now; you will live in these all semester:

- [DuckDB documentation](https://duckdb.org/docs/)
- [Python `sqlite3` module](https://docs.python.org/3/library/sqlite3.html), which wraps the [SQLite documentation](https://sqlite.org/docs.html)
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/)

This project is the lightest of the semester by design. Use the time to read the syllabus, work the first few practice problems, and avoid a frantic week-2 catch-up.

---

## Repository Setup

1. Create a new **private** GitHub repository on your own account named exactly `cop5725fa26-project`.
2. Under Settings → Collaborators, add `cegme` (instructor) and [`rkc8626`](https://github.com/rkc8626) (TA, Ray Chen) as **Admins**.
3. Push your initial commit.
4. Register the repo URL via the Canvas Project 0 assignment.

The repo URL is your project handle for the entire semester. Use the same repo for Projects 1, 2, 3, and Final.

---

## Dataset Selection

Browse the [datasets page](../datasets/) for descriptions of each dataset family, then select yours by the first letter of your last name:

| Last name starts with | Dataset family | You pick the slice |
|-----------------------|----------------|--------------------|
| A–E | NYC Taxi (TLC Trip Records) | any 2024 month, yellow or green |
| F–J | IMDb non-commercial | any genre |
| K–O | Hacker News | any year, 2020–2025 |
| P–T | OpenAlex | any field of study |
| U–Z | US Census | any state or survey table |

Classmates may land in the same family; the slice you pick keeps your work your own. If the assigned family genuinely doesn't fit your interests, propose an alternative dataset by email (subject line including `cop5725fa26`). Approval is required before you commit your time.

---

## Required Repository Contents

By the deadline, your repo's `main` branch must contain:

```
cop5725fa26-project/
├── README.md
├── pyproject.toml
├── data/
│   ├── source.md       # where the raw data lives + license
│   └── sample.csv      # or sample.parquet — first 1000 rows
├── setup/
│   └── verify.py       # runs the four-check script
├── .env.example        # template env vars; copy to .env locally
└── .gitignore          # must list .env and .venv/
```

### `README.md`

At minimum:

- Your name and program
- Dataset family and the slice you selected, and why it interests you
- Local install commands you used
- A short paragraph on the Parquet file format: what it is, how it differs from CSV, and when you would choose each
- One-line summary of what you plan to do across the semester

### `data/source.md`

- The exact URL or instruction to fetch the raw data
- The license (Creative Commons, public domain, etc.)
- Approximate row count and table count
- How frequently the source updates

### `data/sample.csv`

The first 1000 rows of your dataset. This must be reproducible — anyone with `data/source.md` and `setup/verify.py` should be able to regenerate it.

### `pyproject.toml`

Created by `uv init`. The base dependencies are `duckdb` and `pandas`; `psycopg` lives behind an optional extra so the verify script runs without it:

```toml
[project]
name = "cop5725fa26-project"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "duckdb",
    "pandas",
]

[project.optional-dependencies]
postgres = ["psycopg[binary]"]
```

`uv add duckdb pandas` followed by `uv add --optional postgres "psycopg[binary]"` produces this layout. `uv init` also adds fields like `authors`, `readme`, and a build system; keep them.

### `.env.example`

Machine-specific or secret configuration belongs in environment variables rather than in code. The convention you will use all semester is a committed template named `.env.example`, with your real values in a local `.env` that git never sees.

```
# Copy to .env and fill in real values. Never commit .env.
DATABASE_URL=postgresql://user:password@localhost:5432/cop5725fa26
```

Run `cp .env.example .env`, edit the values, and confirm `.env` appears in `.gitignore`. Load it for any command with `uv run --env-file .env ...`.

### `setup/verify.py`

Runs four required checks, plus an optional PostgreSQL check that only runs when `DATABASE_URL` is set. Exits with code 0 if all pass. Run it from the repo root, since the DuckDB check reads your sample file.

Run the required checks with `uv run setup/verify.py`. To opt in to the PostgreSQL check, put your connection string in `.env` and run `uv run --env-file .env --extra postgres setup/verify.py`. The extra pulls in `psycopg[binary]`, so the base environment never needs psycopg or a local libpq.

```python
# setup/verify.py
import sys
from pathlib import Path

def check_uv():
    import shutil
    assert shutil.which("uv"), "uv not on PATH"
    print("uv: OK")

def check_python_packages():
    import duckdb, pandas
    print("duckdb, pandas: OK")

def check_sqlite():
    import sqlite3
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE t (x INTEGER)")
    conn.executemany("INSERT INTO t VALUES (?)", [(1,), (2,), (3,)])
    n = conn.execute("SELECT count(*) FROM t").fetchone()[0]
    conn.close()
    assert n == 3, n
    print(f"SQLite: OK (version {sqlite3.sqlite_version})")

def check_duckdb():
    import duckdb
    sample = next(
        (p for p in ("data/sample.csv", "data/sample.parquet") if Path(p).exists()),
        None,
    )
    assert sample, "data/sample.csv or data/sample.parquet not found"
    rows = duckdb.sql(f"SELECT count(*) FROM '{sample}'").fetchone()[0]
    assert rows >= 100, f"expected at least 100 rows in {sample}, found {rows}"
    print(f"DuckDB: OK ({rows} rows in {sample})")

def check_postgres_optional():
    import os
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("PostgreSQL: skipped (optional; class resources come later)")
        return
    import psycopg
    with psycopg.connect(url) as conn:
        v = conn.execute("SELECT version()").fetchone()[0]
    print(f"PostgreSQL: OK ({v.split(',')[0]})")

if __name__ == "__main__":
    try:
        check_uv()
        check_python_packages()
        check_sqlite()
        check_duckdb()
        check_postgres_optional()
    except Exception as e:
        print(f"FAIL: {e}", file=sys.stderr)
        sys.exit(1)
    print("All checks passed.")
```

---

## Submission

1. Make sure all six files (README, pyproject.toml, source.md, sample.csv, verify.py, .env.example) are committed and pushed.
2. Tag the commit:
   ```bash
   git tag v0
   git push origin v0
   ```
3. Submit the repo URL via Canvas Project 0 assignment.

---

## Grading

Pass if **all** of the following are true:

- [ ] Repo exists at `https://github.com/<your_username>/cop5725fa26-project` (private, with `cegme` and `rkc8626` as Admins)
- [ ] Tag `v0` exists on the main branch
- [ ] `README.md` has your name, dataset choice, and one-paragraph summary
- [ ] `data/source.md` cites the dataset source and license
- [ ] `data/sample.csv` (or `.parquet`) exists with ≥ 100 rows
- [ ] `setup/verify.py` runs to completion with exit code 0 on the TA's machine
- [ ] `.env.example` is committed and no `.env` appears anywhere in the repo history
- [ ] Your dataset family matches the letter rule, or you have written instructor approval for an alternative

Pass = no grade impact.
Fail = one full letter grade reduction at end of semester.

---

## FAQ

**Q: My dataset is too big for my laptop. What do I do?**
A: That's expected. Project 1 will guide you through partial loading. For Project 0, you only need the 1000-row sample.

**Q: My dataset requires authentication.**
A: That counts as "not freely accessible" — pick a different one or propose with the instructor's approval. The course's pedagogical model assumes all artifacts can be reproduced by anyone.

**Q: Can I pick the same slice as a classmate?**
A: Yes. The letter rule spreads the class across sources for variety, but your schema, queries, and writeups must be your own work either way.

---

[back](index)
