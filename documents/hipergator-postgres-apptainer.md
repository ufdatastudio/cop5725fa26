---
layout: default
---

# Running Your Own PostgreSQL Server on HiPerGator

HiPerGator does not run a shared PostgreSQL server, and you do not have root access to install one.
Instead, you run a private server inside an Apptainer container on a compute node, with the database files stored in your folder on the class allocation.
This guide explains the storage layout, the scripts that create, start, and destroy the server, and how to connect from a login node, from Python, and from your laptop.

The recipe is adapted from a Grand Valley State University knowledge base article and was tested on HiPerGator by Alex Moskalenko of UF Research Computing in August 2026.
The class scripts wrap that recipe so you never edit the job file by hand, and the whole workflow below was run end to end on HiPerGator on September 2, 2026.

## Contents
{: .no_toc}

* TOC
{:toc}

---

## The big picture

The workflow has three moving parts.

1. A SLURM batch job starts a PostgreSQL server inside a container on a compute node. The server runs for the walltime of the job.
2. The job writes the node name, port, and password to a file in your folder so you can find the server.
3. You connect from a login node with the `pgcli` client, from `load.py` through `DATABASE_URL`, or from your laptop through an SSH tunnel.

Your data directory lives in your own storage, outside the container and outside the job.
The server dies when the job ends, but the data survives, and starting a new job brings the same database back.

## Storage on the class allocation

The course has an allocation at `/blue/cop5725/`.
Two locations inside it matter.

| Path | Purpose |
|---|---|
| `/blue/cop5725/<gatorlink>/` | Your folder. Your PostgreSQL data, the scripts, and your raw dataset downloads go here. |
| `/blue/cop5725/share/` | Joint items for the whole class. Holds the script toolkit, the prebuilt container image, and shared datasets. Read it freely; only add files there when the course staff ask you to. |

`/blue` is the high-performance filesystem meant for data that jobs read and write.
Your home directory has a small quota and is the wrong place for a database.
Your folder already exists, created by Research Computing when you were added to the `cop5725` group.
It is readable by everyone in the group, so `pg-create.sh` makes the `postgresql` folder inside it private to you.
Never write inside another student's folder.

The scripts default to `PG_HOME=/blue/cop5725/$USER/postgresql`, and that directory receives four subfolders.

```
/blue/cop5725/<gatorlink>/postgresql/
├── config/postgres-password   random password, readable only by you
├── db/data/                   the PostgreSQL data directory
├── run/                       the Unix socket while the server runs
├── logs/                      one .out and .err file per job
├── tmp/                       scratch created by the module system; ignore it
└── connection.env             host, port, user, password of the running server
```

## Quick start

Log in to HiPerGator, put your own copy of the toolkit in your folder, and run the scripts in order.
Every student runs their own copy from `/blue/cop5725/<gatorlink>/pg-tools/`, so the server, the connection file, and the configuration all belong to you.

```bash
ssh <gatorlink>@hpg.rc.ufl.edu
mkdir -p /blue/cop5725/$USER
cp -r /blue/cop5725/share/pg-tools /blue/cop5725/$USER/pg-tools
cd /blue/cop5725/$USER/pg-tools

./pg-create.sh      # once: folders and password
./pg-start.sh       # each session: submit the server job
squeue -u $USER     # wait until the postgres-<gatorlink> job shows R
./pg-info.sh        # host, port, password, DATABASE_URL
./pg-connect.sh     # interactive pgcli session
```

When you are done for the day, run `./pg-stop.sh`.
The job would end on its own at the walltime, but stopping it frees the node for other students.

The same files are published on the course site at [documents/hipergator-postgres/](hipergator-postgres/), where you can read every script in a browser before running it.
If the share folder is unavailable, or you want a fresh copy after the staff update a script, download the toolkit from the site instead.

```bash
mkdir -p /blue/cop5725/$USER/pg-tools
cd /blue/cop5725/$USER/pg-tools
for f in pg-lib.sh pg.conf pg-create.sh pg-start.sh pg-info.sh pg-connect.sh pg-stop.sh pg-destroy.sh pg-server.sbatch; do
  curl -fsSLO https://ufdatastudio.com/cop5725fa26/documents/hipergator-postgres/$f
done
chmod +x pg-*.sh pg-server.sbatch
```

`wget` works the same way with `wget -q https://ufdatastudio.com/cop5725fa26/documents/hipergator-postgres/$f` inside the loop.

## The scripts

All scripts accept `-h` for usage and `-c FILE` to point at a different configuration file.
Flags override the configuration file, and the configuration file overrides the built-in defaults.

`pg-create.sh` makes the folders under `PG_HOME`, sets their permissions so only you can read them, and writes a random password once.
Rerunning it is safe.
Flags: `-H PG_HOME`, `-d DBNAME`.

`pg-start.sh` submits `pg-server.sbatch` with the cores, memory, walltime, and account from `pg.conf`.
It refuses to submit if you already have a server job so you never queue a duplicate.
Flags: `-t HH:MM:SS`, `-m MEM`, `-n CPUS`, `-A ACCOUNT`, `-q QOS`, `-p PARTITION`, `-j JOBNAME`.

`pg-info.sh` shows your server jobs, then the host, port, user, and password of the running server, a ready-made `DATABASE_URL`, and the SSH tunnel command for your laptop.
`pg-info.sh -s` prints the resolved settings without touching the queue, which is the quickest way to check an edit to `pg.conf`.

`pg-connect.sh` loads the `ubuntu` module for `pgcli` and opens a session against the running server.
Arguments after `--` pass through to `pgcli`.

`pg-stop.sh` cancels the server job.
The data directory stays.

`pg-destroy.sh` cancels the job and deletes the data directory after you type `yes`.
The password file survives, so the next start creates an empty database with the same credentials.
`pg-destroy.sh -a` removes everything under `PG_HOME`, including the password and the logs.
`-y` skips the prompt.

`pg-server.sbatch` is the job itself, and `pg-lib.sh` holds the defaults and helpers the other scripts share.
You do not run either directly.

## Configuration

`pg.conf` sits next to the scripts and is a list of plain bash assignments.
Edit it once and every script picks up the change.

| Setting | Default | Meaning |
|---|---|---|
| `PG_HOME` | `/blue/cop5725/$USER/postgresql` | Where data, password, socket, and logs live |
| `PG_DB` | `cop5725` | Database created on first start |
| `PG_IMAGE` | `docker://postgres:18` | Container image to run |
| `PG_SHARED_SIF` | `/blue/cop5725/share/images/postgres-18.sif` | Prebuilt image; used when readable so nobody downloads it twice |
| `PG_JOB_NAME` | `postgres-$USER` | SLURM job name, with your GatorLink id appended; the singleton rule keys on it |
| `PG_CPUS` | `2` | Cores for the server |
| `PG_MEM` | `8GB` | Memory for the server |
| `PG_TIME` | `04:00:00` | Walltime. Raise it for long loads |
| `PG_ACCOUNT`, `PG_QOS` | `cop5725` | The course allocation. Every course job must charge it, so leave these alone |
| `PG_PARTITION` | empty | Scheduler default |
| `PG_PORT_MIN`, `PG_PORT_MAX` | `10000`, `40000` | Range for the random port |

Three ways to change a setting, from most permanent to most temporary.

```bash
# 1. Edit pg.conf
PG_TIME=12:00:00

# 2. Export in your shell for the rest of the session
export PG_MEM=16GB

# 3. Pass a flag for one command
./pg-start.sh -t 12:00:00 -m 16GB
```

Two students in the same folder is never the intent, but two databases for one student is fine.
Copy `pg.conf` to `pg-scratch.conf`, change `PG_HOME` and `PG_JOB_NAME`, and pass `-c pg-scratch.conf` to every command.

## What the job does

`pg-server.sbatch` is short enough to read in full, and the sections below explain the parts that are not obvious.

### SLURM directives

```bash
#SBATCH --job-name=postgres
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=8GB
#SBATCH --time=04:00:00
#SBATCH --dependency=singleton
#SBATCH --signal=B:SIGINT@60
```

`pg-start.sh` overrides the resource lines from `pg.conf` on the `sbatch` command line, so the values in the file only matter if you submit the job by hand.
The job name is one of them.
SLURM does not expand `$USER` inside `#SBATCH` lines, so the file says `postgres` while `pg-start.sh` submits it as `postgres-<gatorlink>`, which is the name the other scripts look for.

`--dependency=singleton` tells SLURM never to run two of your jobs with this name at once, so a second submission waits instead of starting a second server on the same data directory.
`--signal=B:SIGINT@60` sends the script an interrupt one minute before the walltime.
The script forwards it to PostgreSQL, which treats it as a fast shutdown and flushes its buffers instead of being killed mid-write.

### The container image

```bash
module load apptainer
SIF=$(pg_sif_path)
if [ ! -f "$SIF" ]; then
  apptainer pull "$SIF" "$PG_IMAGE"
fi
```

Apptainer is the container runtime on HiPerGator.
It converts the official PostgreSQL Docker image into a single `.sif` file.
The class share folder holds a prebuilt copy, so the pull only happens if that copy is missing, and then only on your first start.

### First-start environment

```bash
export POSTGRES_USER="$USER"
export POSTGRES_DB="$PG_DB"
export POSTGRES_PASSWORD_FILE="$PG_PASSWORD_FILE"
export POSTGRES_HOST_AUTH_METHOD=scram-sha-256
export POSTGRES_INITDB_ARGS="--data-checksums"
export PGDATA=/var/lib/postgresql/data
```

The image's entrypoint reads these variables the first time it sees an empty data directory.
It creates a superuser named after your GatorLink account with the password from your file, creates the database named in `PG_DB`, and requires a password for every network connection.
`--data-checksums` makes PostgreSQL checksum each page so silent corruption shows up early.
On later starts the data directory is already initialized and the variables are ignored.

### Port and connection file

```bash
PG_PORT=$(shuf -i "${PG_PORT_MIN}-${PG_PORT_MAX}" -n 1)
```

Compute nodes are shared.
If everyone used port 5432, the second server on a node would fail to start, so each job draws a random port.
The job then writes `connection.env` with `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`, and a full `DATABASE_URL`.
Those names are the ones libpq reads, which is why `pg-connect.sh` can just source the file.

### Starting the server

```bash
apptainer run \
  -B "$PG_HOME/db:/var/lib/postgresql" \
  -B "$PG_HOME/run:/var/run/postgresql" \
  "$SIF" -c "port=$PG_PORT" &
```

The two `-B` flags are bind mounts.
They map your storage folders onto the paths the container expects, so the database files are stored in `/blue` instead of inside the disposable container.
This is why your data survives the job.
The trailing `&` runs the server in the background so the script can catch the shutdown signal and pass it on.

## What happens when you submit

```
$ ./pg-start.sh
[pg] submitting with: --job-name=postgres-gatorlnk --cpus-per-task=2 --mem=8GB --time=04:00:00 ... --account=cop5725 --qos=cop5725
Submitted batch job 40908172

$ squeue -u $USER -n postgres-$USER -o "%i %j %T %N"
JOBID NAME STATE NODELIST
40908172 postgres-gatorlnk RUNNING c0704a-s6
```

In testing the job started within a minute of submission.
The default `squeue` layout cuts the NAME column to eight characters, so `postgres-gatorlnk` shows up there as `postgres`; the `-o` format above prints the full name.

Once the state column shows `R`, ask for the details.

```
$ ./pg-info.sh
Jobs named postgres-gatorlnk (id, state, node):
40908172 RUNNING c0704a-s6

The server is running as job 40908172.

Host:      c0704a-s6.ufhpc
Port:      32098
User:      gatorlnk
Database:  cop5725
Password:  3b1ead72-fd3e-42e3-9f32-c581f25d14a4

Interactive client on a login node:
  /blue/cop5725/<gatorlnk>/pg-tools/pg-connect.sh

For a .env file (Project 1 DATABASE_URL):
  DATABASE_URL=postgresql://gatorlnk:3b1ead72-...@c0704a-s6.ufhpc:32098/cop5725

From your laptop, open a tunnel in one terminal and use localhost:5432 in another:
  ssh -N -L 5432:c0704a-s6.ufhpc:32098 gatorlnk@hpg.rc.ufl.edu
  DATABASE_URL=postgresql://gatorlnk:3b1ead72-...@localhost:5432/cop5725
```

The node and port change every time the job runs, so rerun `pg-info.sh` after each start.
The job's own log in `logs/postgres-<jobid>.out` repeats the same details and, on the first run, shows `initdb` creating the database.
On later runs it says `PostgreSQL Database directory appears to contain a database; Skipping initialization`, which is the confirmation that your old data came back.

## Connecting

### From a login node

```
$ ./pg-connect.sh
Server: PostgreSQL 18.6 (Debian 18.6-1.pgdg13+2)
Version: 4.0.1
Home: http://pgcli.com

gatorlnk> \l
+-----------+----------+----------+------------+------------+-------------------------+
| Name      | Owner    | Encoding | Collate    | Ctype      | Access privileges       |
|-----------+----------+----------+------------+------------+-------------------------|
| cop5725   | gatorlnk | UTF8     | en_US.utf8 | en_US.utf8 | <null>                  |
| postgres  | gatorlnk | UTF8     | en_US.utf8 | en_US.utf8 | <null>                  |
| template0 | gatorlnk | UTF8     | en_US.utf8 | en_US.utf8 | =c/gatorlnk             |
|           |          |          |            |            | gatorlnk=CTc/gatorlnk   |
| template1 | gatorlnk | UTF8     | en_US.utf8 | en_US.utf8 | =c/gatorlnk             |
|           |          |          |            |            | gatorlnk=CTc/gatorlnk   |
+-----------+----------+----------+------------+------------+-------------------------+
SELECT 4
```

`\l` lists the databases.
You get the class database, the default `postgres` database, and the two templates PostgreSQL clones when creating new databases.
`psql` habits carry over, and `pgcli` adds autocompletion and syntax highlighting.

If you prefer to type the command yourself, the pieces are `module load ubuntu`, then `export PGPASSWORD=...`, then `pgcli -u <gatorlink> -h <host> -p <port> -d cop5725`.

### From Python and Project 1

Copy the `DATABASE_URL` line from `pg-info.sh` into the `.env` of your project repository on HiPerGator, then confirm it with the Project 0 verify script.

```bash
uv run --env-file .env setup/verify.py
```

Run `load.py` from a login node or, for a long load, from a second SLURM job.
The client and the server are different jobs, so the loader can come and go while the server keeps running.

Load data with client-side copy.
`\copy` in `psql` and `pgcli`, and `cursor.copy()` in psycopg, stream the file from where the client runs.
Server-side `COPY FROM '/blue/...'` fails because the container only sees the two folders that are bind-mounted into it.

### From your laptop

The compute node is not reachable from outside HiPerGator, but the login node can forward a port to it.
Copy the two lines from the end of `pg-info.sh`.
Leave the `ssh -N -L` command running in one terminal, and in another terminal use `localhost:5432` as the host in DBeaver, pgAdmin, or your `.env`.
Close the tunnel with Ctrl-C when you are done.

## Stopping, restarting, and starting over

`./pg-stop.sh` cancels the job.
SLURM gives the server a moment to shut down, and your data stays in `PG_HOME/db`.
The next `./pg-start.sh` brings the same database back on whichever node and port the scheduler picks.

If you ever submit twice by hand, the singleton rule holds the second job in the queue.

```
$ squeue -u $USER -n postgres-$USER -o "%i %j %T %N %r"
JOBID NAME STATE NODELIST REASON
40908172 postgres-gatorlnk RUNNING c0704a-s6 None
40908201 postgres-gatorlnk PENDING  Dependency
```

`./pg-stop.sh` cancels both.

`./pg-destroy.sh` is for a schema you want to rebuild from scratch.
It stops the server, deletes the data directory, and keeps your password so the next start gives you an empty database with the same connection details.
Because Project 1 grades `schema.sql` and `load.py` against an empty server, destroying and reloading your own database is a good final check before you tag a submission.

## Common questions

My job ended. Did I lose my data?
No. The data directory in `PG_HOME` persists on `/blue`. Start a new job and the same database comes back on a possibly different node and port, so rerun `pg-info.sh`.

Can other students see my database?
Connections require your password, the password file and `connection.env` are readable only by you, and the server runs under your account. Do not commit either file to your repository.

Why did my connection stop working mid-session?
The server lives only as long as the SLURM job. Check `squeue -u $USER`. If the walltime expired, start again and reconnect with the new host and port.

How much walltime should I ask for?
Four hours covers a working session. For a multi-hour load, pass `-t 12:00:00` to `pg-start.sh` and stop the job when the load finishes. Idle servers still hold a node, so do not request days you will not use.

`sbatch` says the account or QOS is invalid.
Your HiPerGator account may not be in the `cop5725` group yet. Run `showAssoc $USER`; the `cop5725` row should list QOS `cop5725`. If it is missing, ask the course staff to check your group membership.

I want to run PostgreSQL 16 instead.
Set `PG_IMAGE=docker://postgres:16` and `PG_SHARED_SIF=` (empty) in `pg.conf` and run `pg-destroy.sh -a` first, because a data directory initialized by one major version cannot be opened by another.

---

[back](index)

<!--
Instructor notes (do not publish as-is):
- Source: https://services.gvsu.edu/TDClient/60/Portal/KB/PrintArticle?ID=24265, tested by Alex Moskalenko (UFRC), Aug 2026.
- Full cycle (create, start, info, connect, psql, laptop tunnel, walltime SIGINT shutdown,
  scancel shutdown, restart with data intact, destroy) verified under christan on
  HiPerGator, Sep 2, 2026, jobs 40906884 to 40910015.
- Share folder is populated: /blue/cop5725/share/pg-tools/ (copy of
  documents/hipergator-postgres/) and /blue/cop5725/share/images/postgres-18.sif.
  After editing a script, re-copy it there and chmod g+r. To refresh the image:
    module load apptainer; export TMPDIR=/tmp
    apptainer pull /blue/cop5725/share/images/postgres-18.sif docker://postgres:18
- Quirks learned in testing: the postgres image's own PGDATA beats an exported one, so the
  job passes --env PGDATA; a UFRC module hook creates ./tmp in the cwd on every module
  load when TMPDIR is unset, so the scripts load modules from inside PG_HOME.
- The sample outputs use the placeholder gatorlnk with node, port, and job ids from the Sep 2 test.
-->
