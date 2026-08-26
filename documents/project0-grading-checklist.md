# Project 0 Grading Checklist

Instructor and TA use only. Not published to the course site.

Project 0 is pass/fail. A student passes only if every required item below checks out. A fail costs one full letter grade at the end of the semester, so double-check borderline cases and email the student before recording a fail. Due Friday, September 4, 2026 at 11:59 PM.

Source of truth for requirements: [projects/project0.md](../projects/project0.md).

---

## Setup (once per grader)

- [ ] Confirm `uv` is installed and on PATH on the grading machine.
- [ ] Pull the list of submitted repo URLs from the Canvas Project 0 assignment.

## Per-student checklist

Work from a fresh clone at the `v0` tag:

```bash
git clone git@github.com:<username>/cop5725fa26-project.git
cd cop5725fa26-project
git checkout v0
```

### 1. Canvas and repository access

- [ ] Repo URL was submitted through the Canvas Project 0 assignment.
- [ ] Repo is at `https://github.com/<username>/cop5725fa26-project` with that exact name.
- [ ] Repo is private.
- [ ] `cegme` and `rkc8626` are collaborators with the Admin role (Settings → Collaborators, or `gh api repos/<username>/cop5725fa26-project/collaborators`).

### 2. Tag

- [ ] Tag `v0` exists and points to a commit reachable from `main`:

  ```bash
  git merge-base --is-ancestor v0 origin/main && echo on-main
  ```

- [ ] The tagged commit was pushed by the deadline. Note the commit date if late and apply the syllabus late policy.

### 3. Required files at `v0`

- [ ] `README.md`
- [ ] `pyproject.toml`
- [ ] `data/source.md`
- [ ] `data/sample.csv` or `data/sample.parquet`
- [ ] `setup/verify.py`
- [ ] `.env.example`
- [ ] `.gitignore` listing both `.env` and `.venv/`

### 4. README contents

- [ ] Student name and program.
- [ ] Dataset family, the specific slice chosen, and why it interests them.
- [ ] Local install commands they used.
- [ ] A short paragraph on Parquet covering what it is, how it differs from CSV, and when to choose each.
- [ ] One or two sentences of ideas they could explore with the data. Any plausible brainstorm passes; this is not a commitment (see the errata in the spec).

### 5. Dataset selection

- [ ] Dataset family matches the last-name letter rule (A–E NYC Taxi, F–J IMDb, K–O Hacker News, P–T OpenAlex, U–Z US Census), or written instructor approval for an alternative is on file.
- [ ] `data/source.md` gives the exact URL or fetch instruction for the raw data.
- [ ] `data/source.md` states the license.
- [ ] `data/source.md` gives approximate row count, table count, and update frequency.
- [ ] The sample file has at least 100 rows. The verify script in step 6 counts this for you.
- [ ] Spot check reproducibility. The instructions in `data/source.md` are enough for someone to regenerate the sample without asking the student anything.

### 6. Environment verification

- [ ] `pyproject.toml` lists `duckdb` and `pandas` as base dependencies, puts `psycopg[binary]` behind a `postgres` optional extra, and requires Python 3.11 or newer.
- [ ] From the repo root, the verify script exits 0:

  ```bash
  uv run setup/verify.py
  echo $?
  ```

- [ ] The script output shows the uv, package, SQLite, and DuckDB checks passing. The PostgreSQL check may print skipped; that is fine, since PostgreSQL is optional in Project 0.

### 7. Secrets hygiene

- [ ] `.env.example` contains only template values, no real credentials.
- [ ] No `.env` file appears anywhere in the repo history:

  ```bash
  git log --all --oneline -- .env
  ```

  Empty output passes. Any hit fails this item; also tell the student to rotate the exposed credentials.

### 8. Record the result

- [ ] Enter pass or fail in Canvas.
- [ ] For a fail, list the specific failed items in the Canvas comment and email the student, since the penalty is a full letter grade.

---

## Common judgment calls

- Sample file named differently or in a different directory. The verify script only finds `data/sample.csv` or `data/sample.parquet`, so anything else fails check 6. Ask the student to fix and re-tag rather than failing outright if caught before grades close.
- Sample has between 100 and 999 rows. The published pass criterion is at least 100 rows, so this passes even though the spec asks for the first 1000.
- Alternative dataset without an approval email. This fails the letter rule item. Check the instructor inbox for a `cop5725fa26` subject line before recording it.
- Repo is public instead of private. Ask the student to flip it to private; do not fail solely for this on first contact.
