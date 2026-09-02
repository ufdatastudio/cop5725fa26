---
layout: default
---

# HiPerGator for COP 5725

HiPerGator is the University of Florida's shared research cluster.
The course has an allocation on it named `cop5725`, and every student in the class already has an account attached to it.
Projects are graded there, so we recommend developing there too: your load and queries then run on the same machines, against the same PostgreSQL setup, that the TA uses.
It is also the place where a full-size dataset slice fits and where a long load can run while your laptop is closed.
This page covers the account, the storage layout, running commands the way the cluster expects, and the tools this course uses there.
The companion guide [Running Your Own PostgreSQL Server on HiPerGator](hipergator-postgres-apptainer) picks up where this one ends.

The allocation is CPU only this semester.
Nothing in the course needs a GPU, so leave the GPU options in every form and script alone.

## Contents
{: .no_toc}

* TOC
{:toc}

---

## Your account

Your HiPerGator username is your GatorLink username, and the course staff have already added the class to the `cop5725` allocation.
There is no form to fill out.
If [showAssoc](#checking-your-allocation) does not list `cop5725` after you log in, email the instructor.
Research Computing's own overview is at [docs.rc.ufl.edu/quickstart/](https://docs.rc.ufl.edu/quickstart/), and the [Research Computing Orientation slides](research-computing-orientation.pdf) give the same material in slide form.

## Logging in

Two doors lead to the same machines.

The terminal:

```bash
ssh <gatorlink>@hpg.rc.ufl.edu
```

You enter your GatorLink password, then approve a Duo push.
The `ssh` client on macOS, Linux, and current Windows all work.

The browser: [ood.rc.ufl.edu](https://ood.rc.ufl.edu/) is the Open OnDemand portal.
It has a terminal, a file browser for your storage areas, and a Jupyter launcher.
When a form asks for a SLURM account and QoS, enter `cop5725` for both.

Either way you arrive at a login node.
Login nodes are shared by everyone on the cluster and exist for editing files, running git, and submitting jobs.
Anything that runs for more than a minute or uses more than a core belongs in a job, which the [next section](#running-commands-in-a-job) covers.

## Storage

HiPerGator has two storage areas you will use.

| Path | Quota | Use it for |
|---|---|---|
| `/home/<gatorlink>` | 40 GB | Configuration, small scripts, software installs |
| `/blue/cop5725/<gatorlink>` | shared class quota | Your repository clone, raw data, and the PostgreSQL data directory |

Research Computing's rule is that jobs read and write on `/blue`, never on `/home`.
The home filesystem is small and slow for bulk I/O, and a dataset download into it fills the quota in minutes.

Create your folder once and treat it as your working directory on the cluster.

```bash
mkdir -p /blue/cop5725/$USER
cd /blue/cop5725/$USER
```

The class also has `/blue/cop5725/share/`, which holds the PostgreSQL script toolkit, a prebuilt container image, and any datasets the staff stage for everyone.
Read from it freely.
Add files there only when the course staff ask you to, and never write inside another student's folder.

Two commands report how much of each quota you have used.

```bash
home_quota
blue_quota
```

`ncdu /blue/cop5725/$USER` walks the folder interactively when you need to find what is taking space.

## Running commands in a job

The scheduler on HiPerGator is SLURM.
Every command that does real work runs inside a job that SLURM places on a compute node.
For this course, the two job shapes you need are an interactive shell and the batch job that the PostgreSQL toolkit submits for you.

An interactive shell for two hours with two cores and 8 GB of memory:

```bash
srun --account=cop5725 --qos=cop5725 --ntasks=1 --cpus-per-task=2 --mem=8gb --time=02:00:00 --pty bash -i
```

The prompt changes to a compute node name such as `c0706a-s1` once the job starts.
Run `load.py` there, run `duckdb` there, unpack a large download there.
Type `exit` to end the job and return to the login node.
Ask only for the time you will use, since an idle interactive job holds a node that another student could be using.

### Batch jobs

A batch job is a shell script with `#SBATCH` lines at the top that you hand to `sbatch`.
The account and QoS lines are required on every script you submit, because your account has no default allocation of its own.

```bash
#!/bin/bash
#SBATCH --job-name=load
#SBATCH --account=cop5725
#SBATCH --qos=cop5725
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=8gb
#SBATCH --time=04:00:00
#SBATCH --output=logs/load-%j.out

cd /blue/cop5725/$USER/cop5725fa26-project
uv run --env-file .env load.py
```

Save it as `load.sbatch`, create the `logs/` folder, and submit with `sbatch load.sbatch`.
`squeue -u $USER` shows it queued and then running, and the log file collects everything the script prints.
The same two `#SBATCH` lines belong in any script you write for this course, and the PostgreSQL toolkit adds them for you from `pg.conf`.

### Checking your allocation

```bash
showAssoc $USER         # the accounts and QoS levels you can submit under
showQos cop5725         # limits on the class allocation
squeue -u $USER         # your running and pending jobs
scancel <jobid>         # end one of them
```

If `sbatch` or `srun` reports an invalid account or QoS, the `cop5725` group is not attached to your account.
Check `showAssoc` and email the instructor.

## Software modules

Software on HiPerGator is packaged as modules that you load per session.

```bash
module load ubuntu       # a Debian userland with pgcli, psql, and common CLI tools
module load apptainer    # the container runtime the PostgreSQL toolkit uses
module spider <name>     # search for a module
module list              # what is loaded now
```

The PostgreSQL scripts load the modules they need, so you only load them yourself for interactive work.

## Python with uv

The `uv` installer places the binary under your home directory, which is the right place for it.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Point the package cache at `/blue` so that downloaded wheels and interpreters do not eat your home quota.
Add these lines to `~/.bashrc` on the cluster and open a new shell.

```bash
export UV_CACHE_DIR=/blue/cop5725/$USER/.cache/uv
cd /blue/cop5725/$USER
```

Clone your project repository into your `/blue` folder and let `uv` build the environment there.

```bash
cd /blue/cop5725/$USER
git clone git@github.com:<username>/cop5725fa26-project.git
cd cop5725fa26-project
uv sync
uv run setup/verify.py
```

`uv` downloads the Python version named in `pyproject.toml` on first use, so the cluster's system Python never matters.
Set up an SSH key for GitHub on the cluster, or use `gh auth login`, before the clone; the login nodes cannot open a browser for you.

## Moving data

Small files travel with `scp` or `rsync` from your laptop.

```bash
rsync -av data/raw/ <gatorlink>@hpg.rc.ufl.edu:/blue/cop5725/<gatorlink>/cop5725fa26-project/data/raw/
```

Large public datasets are faster to fetch on the cluster itself.
Start an interactive job, `cd` into `data/raw/`, and use `curl -O` or `wget` on the URL from your `data/source.md`.
The compute nodes have direct internet access for downloads.

Research Computing also runs Globus for multi-gigabyte transfers; see [docs.rc.ufl.edu/data_transfer/overview/](https://docs.rc.ufl.edu/data_transfer/overview/).

## Reaching a compute node from your laptop

A server running in a job listens on a compute node, and compute nodes are not reachable from outside the cluster.
The login node can forward a port to one.
Run this on your laptop, in a terminal you leave open:

```bash
ssh -N -L 5432:<node>.ufhpc:<port> <gatorlink>@hpg.rc.ufl.edu
```

Anything on your laptop that connects to `localhost:5432` now reaches the server.
The PostgreSQL toolkit's `pg-info.sh` prints this command with the node and port filled in.
Press Ctrl-C to close the tunnel.

## Where to get help

- [docs.rc.ufl.edu](https://docs.rc.ufl.edu/) is the Research Computing documentation. The pages on [storage](https://docs.rc.ufl.edu/quickstart/practical_storage/), [SLURM commands](https://docs.rc.ufl.edu/scheduler/slurm_commands/), and [modules](https://docs.rc.ufl.edu/software/modules_basics/) cover everything above in more depth.
- [support.rc.ufl.edu](https://support.rc.ufl.edu/) opens a ticket with Research Computing for account, quota, and cluster problems.
- The course staff handle questions about the `cop5725` allocation and the PostgreSQL toolkit.

---

[back](index)
