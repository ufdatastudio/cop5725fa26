#!/bin/bash
# pg-stop.sh: cancel your PostgreSQL job(s). The data directory is kept.
#
# usage: pg-stop.sh [-c pg.conf] [-H PG_HOME] [-j JOBNAME]
set -u

usage() {
  sed -n '2,4p' "$0"
  exit "${1:-0}"
}

while getopts "c:H:j:h" opt; do
  case "$opt" in
    c) PG_CONF="$OPTARG" ;;
    H) PG_HOME="$OPTARG" ;;
    j) PG_JOB_NAME="$OPTARG" ;;
    h) usage ;;
    *) usage 1 ;;
  esac
done

source "$(dirname "$0")/pg-lib.sh"
pg_load_config

jobs=$(pg_jobs)
if [ -z "$jobs" ]; then
  pg_log "no $PG_JOB_NAME jobs to cancel"
  exit 0
fi

pg_log "cancelling:"
echo "$jobs"
scancel -u "$USER" -n "$PG_JOB_NAME" || pg_die "scancel failed"
pg_log "done. SLURM gives the server a moment to shut down cleanly."
pg_log "your data stays in $PG_HOME/db; pg-start.sh brings the same database back."
