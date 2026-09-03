---
layout: default
---

# Introduction to uv and pyproject.toml

This guide introduces `uv`, the Python package manager the course uses, and `pyproject.toml`, the configuration file that describes a Python project.
Every project repository in this course is a `uv` project, and the commands below are the ones you will run all semester.

## Contents
{: .no_toc}

* TOC
{:toc}

---

## What is uv?

`uv` is a Python package and project manager written in Rust.
It replaces several tools you may have used before.

- `pip` for installing packages
- `virtualenv` or `venv` for creating virtual environments
- `pip-tools` for dependency resolution

`uv` installs packages in seconds because it resolves dependencies in parallel and caches downloaded wheels, and it gives one command-line interface for the whole project lifecycle.

## What is pyproject.toml?

`pyproject.toml` is the standard configuration file for Python projects, defined by [PEP 518](https://peps.python.org/pep-0518/) and [PEP 621](https://peps.python.org/pep-0621/).
It replaces `setup.py`, `setup.cfg`, and `requirements.txt`.

The one from Project 0 looks like this:

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

### Key sections

| Section | Purpose |
|---------|---------|
| `[project]` | Core metadata: name, version, Python version, dependencies |
| `[project.optional-dependencies]` | Extras that install only when asked for, such as `--extra postgres` |
| `[project.scripts]` | Command-line entry points |
| `[tool.*]` | Configuration for tools like pytest and ruff |
| `[build-system]` | Build backend, added by `uv init` |

## Installing uv

macOS and Linux:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Confirm the install:

```bash
uv --version
```

## Essential commands

### Creating a new project

```bash
uv init my-project
cd my-project
```

This creates a directory with `pyproject.toml`, `.python-version`, a starter `main.py`, and a `README.md`.

### Adding dependencies

```bash
uv add duckdb
uv add pandas
```

Each `uv add` writes the package into `pyproject.toml` and updates `uv.lock`, the file that pins exact versions.

### Adding optional dependencies

```bash
uv add --optional postgres "psycopg[binary]"
```

The package is listed under `[project.optional-dependencies]` and installs only when a command passes `--extra postgres`.

### Adding development dependencies

```bash
uv add --dev pytest
uv add --dev ruff
```

Development dependencies are for testing and linting, and they are left out of the environment a user of your project installs.

### Removing dependencies

```bash
uv remove pandas
```

### Syncing the environment

```bash
uv sync
```

This installs everything in `uv.lock` into the project's `.venv`.
Run it after cloning a repository or after pulling changes that touched `pyproject.toml`.

### Running scripts

```bash
uv run setup/verify.py
uv run --env-file .env load.py
```

`uv run` activates the virtual environment, syncs it if `pyproject.toml` changed, and then runs the command.
You never activate `.venv` by hand.
The `--env-file` flag loads variables from a file before the script starts, which is how the course passes `DATABASE_URL` without committing it.

### Running modules

```bash
uv run python -m mypackage.module
```

Running code as a module sets up import paths correctly, so local imports work without editing `sys.path`.

### Running tests

```bash
uv run pytest
uv run pytest -v tests/
```

## Project layout

A project in this course looks like this after Project 0.

```
cop5725fa26-project/
├── pyproject.toml      # project configuration
├── uv.lock             # locked dependency versions, committed
├── .python-version     # Python version for the project
├── .venv/              # virtual environment, gitignored
├── README.md
├── data/
├── setup/
│   └── verify.py
├── .env.example        # template, committed
└── .env                # real values, gitignored
```

## The uv.lock file

`uv.lock` records the exact version of every dependency and every transitive dependency.
Commit it.
Anyone who clones the repository and runs `uv sync` gets the same packages you tested with, which is what makes the TA's run of your code match yours.

## Common workflows

Starting a new project:

```bash
uv init my-project
cd my-project
uv add duckdb pandas
uv run main.py
```

Cloning an existing project:

```bash
git clone <repository-url>
cd <project-directory>
uv sync
uv run setup/verify.py
```

Updating dependencies:

```bash
uv lock --upgrade
uv sync
```

## <span style="color: red;">Comparison with pip and venv</span>

<style>
.pip-venv, .pip-venv th, .pip-venv td, .pip-venv code { color: red; }
</style>

This course does not use `pip` or `venv`.
The table is here so you can translate commands you already know into their `uv` equivalents.
{: .pip-venv}

| Task | pip and venv | uv |
|------|--------------|-----|
| Create environment | `python -m venv .venv` | automatic |
| Install a package | `pip install duckdb` | `uv add duckdb` |
| Install from a file | `pip install -r requirements.txt` | `uv sync` |
| Run a script | `source .venv/bin/activate && python script.py` | `uv run script.py` |
{: .pip-venv}

## Further reading

- [uv documentation](https://docs.astral.sh/uv/)
- [pyproject.toml specification (PEP 621)](https://peps.python.org/pep-0621/)
- [Python Packaging User Guide](https://packaging.python.org/)

---

[back](index)
