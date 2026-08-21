---
layout: default
---

# Running Your Own PostgreSQL Server on HiPerGator

HiPerGator does not run a shared PostgreSQL server, and you do not have root access to install one.
Instead, you run your own private server inside an Apptainer container on a compute node.
This guide walks through a working SLURM job script section by section, then shows what happens when you submit it and how you connect to your database.

The recipe is adapted from a Grand Valley State University knowledge base article and was tested on HiPerGator by Alex Moskalenko of UF Research Computing.

## The big picture

The workflow has three moving parts.

1. A SLURM batch job starts a PostgreSQL server inside a container on a compute node. The server runs for the walltime of the job.
2. The job writes its hostname, port, and password into its log file so you can find the server.
3. You connect from a login node with the `pgcli` client, load data, and run queries.

Your data directory lives in your own storage, outside the container and outside the job.
The server dies when the job ends, but the data survives, and resubmitting the job restarts the same database.

## The job script, annotated

Save the full script (given at the end) as `postgres-server.sh` and read through each section below to understand what it does.

### 1. SLURM directives

```bash
#!/bin/bash
#SBATCH --job-name=postgres
#SBATCH --ntasks=1
#SBATCH --mem=8GB
#SBATCH --time=2:00:00 # Two hours
#SBATCH --output=postgresql-server.out
#SBATCH --error=postgresql-server.err
#SBATCH --dependency=singleton # don't run two instances of the same server
#SBATCH --signal=B:SIGINT@60 # one minute before job ends, shut down postgresql
```

The first lines ask for one task, 8 GB of memory, and a two hour walltime, and name the log files where the connection details will appear.

Two directives deserve attention.
`--dependency=singleton` tells SLURM to never run two jobs with this name at the same time, so you cannot accidentally start two servers fighting over the same data directory.
`--signal=B:SIGINT@60` sends the script an interrupt signal one minute before the walltime expires, which gives PostgreSQL time to flush its buffers and shut down cleanly instead of being killed mid-write.

### 2. Pulling the container

```bash
date;hostname;pwd

module load apptainer

export XDG_RUNTIME_DIR=${TMPDIR}
apptainer pull postgres.sif docker://postgres:latest
```

`date;hostname;pwd` prints a timestamp, the compute node name, and the working directory as the first lines of the log.
The hostname matters because that is the machine your client will connect to.

`apptainer pull` downloads the official PostgreSQL Docker image and converts it to a `.sif` file Apptainer can run.
The pull is skipped if `postgres.sif` already exists in the working directory, so only the first run pays the download cost.

### 3. Choosing where the database lives

```bash
export POSTGRES_HOME=/data/apps/tests/apptainer/postgresql
export POSTGRES_DB=mydb
mkdir -p ${POSTGRES_HOME}/{config,db/data,run}
```

`POSTGRES_HOME` is the one line you must edit.
Point it at a directory in your own storage, for example `/blue/<your-group>/<your-username>/postgresql`.
The script creates three subdirectories there for the password file (`config`), the database files (`db/data`), and the Unix socket (`run`).

### 4. Generating a password once

```bash
[ ! -f "$POSTGRES_HOME/config/postgres-password" ] && uuidgen > "$POSTGRES_HOME/config/postgres-password" && chmod 600 "$POSTGRES_HOME/config/postgres-password"
export POSTGRES_PASSWORD_FILE=$POSTGRES_HOME/config/postgres-password
export POSTGRES_USER=$USER
```

The `[ ! -f ... ]` test creates a random password file only if one does not already exist, so the password stays the same across restarts.
`chmod 600` makes it readable by you alone, which matters on a shared cluster.
The container reads the password from this file and creates a database superuser named after your HiPerGator account.

### 5. Server configuration

```bash
export PGDATA=$POSTGRES_HOME/db/data
export POSTGRES_HOST_AUTH_METHOD=md5
export POSTGRES_INITDB_ARGS="--data-checksums"
export POSTGRES_PORT=99999 # declare first
POSTGRES_PORT=$(shuf -i 10000-40000 -n 1) # select a random port to run on
```

`PGDATA` tells PostgreSQL where its data files live.
`POSTGRES_HOST_AUTH_METHOD=md5` requires a password for network connections, so other users on the cluster cannot open your database.
`--data-checksums` makes PostgreSQL checksum every data page, catching silent corruption early.

The port is drawn at random between 10000 and 40000 because compute nodes are shared.
If every student used port 5432, the second server on a node would fail to start.

### 6. Printing the connection details

```bash
echo "PostgreSQL is listening on the port ${POSTGRES_PORT} of the $(hostname) compute node"
echo "Your username is ${USER}"
echo "The password from ${POSTGRES_HOME}/config/postgres-password: $(cat ${POSTGRES_HOME}/config/postgres-password)"
POSTGRES_PASSWORD=$(cat ${POSTGRES_HOME}/config/postgres-password)
echo "Run: 'export PGPASSWORD=${POSTGRES_PASSWORD}"
echo "Connect with 'pgcli -u ${USER} -h $(hostname) -p ${POSTGRES_PORT}'"
```

These lines exist for you.
You cannot know in advance which node or port the scheduler will give you, so the script prints everything you need into `postgresql-server.out`, including the exact `pgcli` command to copy and paste.

### 7. Starting the server

```bash
apptainer run -B "${POSTGRES_HOME}/db:/var/lib/postgresql" -B "${POSTGRES_HOME}/run:/var/run/postgresql" postgres.sif -c "port=${POSTGRES_PORT}"
```

`apptainer run` starts PostgreSQL inside the container and blocks until the job ends.
The two `-B` flags are bind mounts.
They map your storage directories onto the paths the container expects, so the database files are written to your storage rather than inside the disposable container.
This is why your data survives after the job dies.

## What happens when you submit

Submit the job and watch the log file appear.

```
$ sbatch postgres-server.sh
$ cat postgresql-server.out
Fri Aug 21 02:05:42 PM EDT 2026
c0706a-s1.ufhpc
/data/apps/tests/apptainer/postgresql
PostgreSQL is listening on the port 16195 of the c0706a-s1.ufhpc compute node
Your username is moskalenko
The password from /data/apps/tests/apptainer/postgresql/config/postgres-password: 3b1ead72-fd3e-42e3-9f32-c581f25d14a4
Run: 'export PGPASSWORD=3b1ead72-fd3e-42e3-9f32-c581f25d14a4
Connect with 'pgcli -u moskalenko -h c0706a-s1.ufhpc -p 16195'

PostgreSQL Database directory appears to contain a database; Skipping initialization
```

Read this log from top to bottom.
The job landed on node `c0706a-s1.ufhpc`, the server picked port 16195, and the last echoed line is the exact command to connect.
The final line comes from PostgreSQL itself.
This was a rerun, so it found an existing data directory from a previous job and started the same database without reinitializing.
On your very first run you will instead see initdb output creating a fresh database.

## Connecting from a login node

The `pgcli` client ships in the `ubuntu` environment module.
Copy the password and the connect command from your job log.

```
$ module load ubuntu
$ export PGPASSWORD=3b1ead72-fd3e-42e3-9f32-c581f25d14a4
$ pgcli -u moskalenko -h c0706a-s1.ufhpc -p 16195

Server: PostgreSQL 18.6 (Debian 18.6-1.pgdg13+2)
Version: 3.5.0
Home: http://pgcli.com

moskalenko> \l
+------------+------------+----------+------------+------------+---------------------------+
| Name       | Owner      | Encoding | Collate    | Ctype      | Access privileges         |
|------------+------------+----------+------------+------------+---------------------------|
| moskalenko | moskalenko | UTF8     | en_US.utf8 | en_US.utf8 | <null>                    |
| postgres   | moskalenko | UTF8     | en_US.utf8 | en_US.utf8 | <null>                    |
| template0  | moskalenko | UTF8     | en_US.utf8 | en_US.utf8 | =c/moskalenko             |
|            |            |          |            |            | moskalenko=CTc/moskalenko |
| template1  | moskalenko | UTF8     | en_US.utf8 | en_US.utf8 | =c/moskalenko             |
|            |            |          |            |            | moskalenko=CTc/moskalenko |
+------------+------------+----------+------------+------------+---------------------------+
SELECT 4
Time: 0.005s
```

`\l` lists the databases.
You get a database named after your account, the default `postgres` database, and the two templates PostgreSQL clones when creating new databases.
From here, `psql` habits carry over; `pgcli` adds autocompletion and syntax highlighting on top.

## If you submit the job twice

The singleton dependency holds the duplicate in the queue instead of starting a second server.

```
$ squeuemine
             JOBID PARTITION                 NAME       USER ST       TIME  NODES NODELIST(REASON)
          39886795 hpg-defau             postgres moskalenko  R       6:24      1 c0706a-s1
          39887161 hpg-defau             postgres moskalenko PD       0:00      1 (Dependency)

$ scancel 39887161 39886795
```

The first job is running (`R`) and the accidental duplicate is pending (`PD`) with reason `Dependency`.
Cancel jobs you no longer need with `scancel` and the job IDs.

## Common questions

My job ended. Did I lose my data?
No. The data directory in `POSTGRES_HOME` persists in your storage. Resubmit the job and the same database comes back, on a possibly different node and port, so always reread the log.

Can other students see my database?
Connections require your password, the password file is readable only by you, and each server runs under your account. Do not commit the password file to your repository.

Why did my connection stop working mid-session?
The server only lives as long as the SLURM job. Check `squeue` for your job; if the walltime expired, resubmit and reconnect using the new host and port from the fresh log.

## The full script

```bash
#!/bin/bash
#SBATCH --job-name=postgres
#SBATCH --ntasks=1
#SBATCH --mem=8GB
#SBATCH --time=2:00:00 # Two hours
#SBATCH --output=postgresql-server.out
#SBATCH --error=postgresql-server.err
#SBATCH --dependency=singleton # don't run two instances of the same server
#SBATCH --signal=B:SIGINT@60 # one minute before job ends, shut down postgresql
date;hostname;pwd

module load apptainer

export XDG_RUNTIME_DIR=${TMPDIR}
apptainer pull postgres.sif docker://postgres:latest
export POSTGRES_HOME=/data/apps/tests/apptainer/postgresql
export POSTGRES_DB=mydb
mkdir -p ${POSTGRES_HOME}/{config,db/data,run}
[ ! -f "$POSTGRES_HOME/config/postgres-password" ] && uuidgen > "$POSTGRES_HOME/config/postgres-password" && chmod 600 "$POSTGRES_HOME/config/postgres-password"
export POSTGRES_PASSWORD_FILE=$POSTGRES_HOME/config/postgres-password
export POSTGRES_USER=$USER
export PGDATA=$POSTGRES_HOME/db/data
export POSTGRES_HOST_AUTH_METHOD=md5
export POSTGRES_INITDB_ARGS="--data-checksums"
export POSTGRES_PORT=99999 # declare first
POSTGRES_PORT=$(shuf -i 10000-40000 -n 1) # select a random port to run on
echo "PostgreSQL is listening on the port ${POSTGRES_PORT} of the $(hostname) compute node"
echo "Your username is ${USER}"
echo "The password from ${POSTGRES_HOME}/config/postgres-password: $(cat ${POSTGRES_HOME}/config/postgres-password)"
POSTGRES_PASSWORD=$(cat ${POSTGRES_HOME}/config/postgres-password)
echo "Run: 'export PGPASSWORD=${POSTGRES_PASSWORD}"
echo "Connect with 'pgcli -u ${USER} -h $(hostname) -p ${POSTGRES_PORT}'"
apptainer run -B "${POSTGRES_HOME}/db:/var/lib/postgresql" -B "${POSTGRES_HOME}/run:/var/run/postgresql" postgres.sif -c "port=${POSTGRES_PORT}"
```

Remember to change `POSTGRES_HOME` to a path in your own storage before submitting.

<!--
Instructor notes (do not publish as-is):
- Source: https://services.gvsu.edu/TDClient/60/Portal/KB/PrintArticle?ID=24265, tested by Alex Moskalenko (UFRC), Aug 2026.
- Before releasing with Project 1: pin a specific postgres image tag (e.g. postgres:18) instead of latest so all students run the same version.
- The sample paths and username in the outputs are from Moskalenko's test run; consider re-running with a student-realistic /blue path for the final version.
- Currently excluded from the Jekyll build in _config.yml; remove the exclude line when releasing.
-->
