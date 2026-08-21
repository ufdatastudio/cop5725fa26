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

1. Stand up your **local development environment**: DuckDB and Python with `uv`.
2. **Claim a unique dataset** from the approved roster (see [datasets/student-roster.md](../datasets/student-roster.md)).
3. Create your **personal project repository** on GitHub.

PostgreSQL is optional in Project 0, and nothing here requires a running server. We will provide class PostgreSQL resources later in the semester. If you already run your own server, you can point the verify script at it with the `DATABASE_URL` environment variable and it will test the connection too.

This project is the lightest of the semester by design. Use the time to read the syllabus, work the first few practice problems, and avoid a frantic week-2 catch-up.

---

## Repository Setup

1. Create a new **private** GitHub repository on your own account named exactly `cop5725fa26-project`.
2. Under Settings → Collaborators, add `cegme` (instructor) and [`rkc8626`](https://github.com/rkc8626) (TA, Ray Chen) as **Admins**.
3. Push your initial commit.
4. Register the repo URL via the Canvas Project 0 assignment.

The repo URL is your project handle for the entire semester. Use the same repo for Projects 1, 2, 3, and Final.

---

## Dataset Claim

1. Read [datasets/index.md](../datasets/index.md) for the available datasets.
2. Pick a slice from [datasets/student-roster.md](../datasets/student-roster.md) — first PR merged wins.
3. Open a pull request adding your name beside the slice.
4. Once merged, the slice is yours for the rest of the semester.

If none of the listed slices fit, propose your own dataset by PR. Approval is required before you commit your time.

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
│   └── verify.py       # runs the three-check script
└── .gitignore
```

### `README.md`

At minimum:

- Your name and program
- Dataset you claimed and why it interests you
- Local install commands you used
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

### `setup/verify.py`

Runs three required checks, plus an optional PostgreSQL check that only runs when `DATABASE_URL` is set. Exits with code 0 if all pass. Run it from the repo root, since the DuckDB check reads your sample file.

Run the required checks with `uv run setup/verify.py`. To opt in to the PostgreSQL check, set `DATABASE_URL` and run `uv run --extra postgres setup/verify.py`. The extra pulls in `psycopg[binary]`, so the base environment never needs psycopg or a local libpq.

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
        check_duckdb()
        check_postgres_optional()
    except Exception as e:
        print(f"FAIL: {e}", file=sys.stderr)
        sys.exit(1)
    print("All checks passed.")
```

---

## Submission

1. Make sure all five files (README, pyproject.toml, source.md, sample.csv, verify.py) are committed and pushed.
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
- [ ] Your name appears on a merged PR to `datasets/student-roster.md`

Pass = no grade impact.
Fail = one full letter grade reduction at end of semester.

---

## FAQ

**Q: My dataset is too big for my laptop. What do I do?**
A: That's expected. Project 1 will guide you through partial loading. For Project 0, you only need the 1000-row sample.

**Q: My dataset requires authentication.**
A: That counts as "not freely accessible" — pick a different one or propose with the instructor's approval. The course's pedagogical model assumes all artifacts can be reproduced by anyone.

**Q: I missed the claim deadline. What happens?**
A: You can still claim, but you start Project 1 behind. Be quick.

---

[back](index)
