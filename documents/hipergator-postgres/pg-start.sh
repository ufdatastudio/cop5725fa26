#!/bin/bash
# pg-start.sh: submit the SLURM job that runs your PostgreSQL server.
#
# usage: pg-start.sh [-c pg.conf] [-H PG_HOME] [-t HH:MM:SS] [-m MEM] [-n CPUS]
#                    [-A ACCOUNT] [-q QOS] [-p PARTITION] [-j JOBNAME]
#
# Resources come from pg.conf unless overridden by a flag.
set -u

usage() {
  sed -n '2,7p' "$0"
  exit "${1:-0}"
}

while getopts "c:H:t:m:n:A:q:p:j:h" opt; do
  case "$opt" in
    c) PG_CONF="$OPTARG" ;;
    H) PG_HOME="$OPTARG" ;;
    t) PG_TIME="$OPTARG" ;;
    m) PG_MEM="$OPTARG" ;;
    n) PG_CPUS="$OPTARG" ;;
    A) PG_ACCOUNT="$OPTARG" ;;
    q) PG_QOS="$OPTARG" ;;
    p) PG_PARTITION="$OPTARG" ;;
    j) PG_JOB_NAME="$OPTARG" ;;
    h) usage ;;
    *) usage 1 ;;
  esac
done

source "$(dirname "$0")/pg-lib.sh"
pg_load_config
pg_require_created
export PG_CONF="${PG_CONF:-$PG_TOOLS_DIR/pg.conf}"

existing=$(pg_jobs)
if [ -n "$existing" ]; then
  pg_log "you already have a $PG_JOB_NAME job:"
  echo "$existing"
  pg_log "a second submission would wait on it (singleton). Run pg-stop.sh first if you want a fresh server."
  exit 1
fi

mkdir -p "$PG_HOME/logs"
args=(
  --job-name="$PG_JOB_NAME"
  --cpus-per-task="$PG_CPUS"
  --mem="$PG_MEM"
  --time="$PG_TIME"
  --output="$PG_HOME/logs/postgres-%j.out"
  --error="$PG_HOME/logs/postgres-%j.err"
)
[ -n "$PG_ACCOUNT" ] && args+=(--account="$PG_ACCOUNT")
[ -n "$PG_QOS" ] && args+=(--qos="$PG_QOS")
[ -n "$PG_PARTITION" ] && args+=(--partition="$PG_PARTITION")

pg_log "submitting with: ${args[*]}"
sbatch "${args[@]}" "$PG_TOOLS_DIR/pg-server.sbatch" || pg_die "sbatch failed"

echo
echo "Watch the queue with:  squeue -u $USER -n $PG_JOB_NAME"
echo "Once it is RUNNING:    $PG_TOOLS_DIR/pg-info.sh"
echo "Logs land in:          $PG_HOME/logs/"
