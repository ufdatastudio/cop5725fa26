#!/bin/bash
# pg-info.sh: show whether your server is running and how to reach it.
#
# usage: pg-info.sh [-c pg.conf] [-H PG_HOME] [-s]
#
#   -s   print only the settings resolved from pg.conf and flags
set -u

usage() {
  sed -n '2,6p' "$0"
  exit "${1:-0}"
}

show_settings=0
while getopts "c:H:sh" opt; do
  case "$opt" in
    c) PG_CONF="$OPTARG" ;;
    H) PG_HOME="$OPTARG" ;;
    s) show_settings=1 ;;
    h) usage ;;
    *) usage 1 ;;
  esac
done

source "$(dirname "$0")/pg-lib.sh"
pg_load_config

if [ "$show_settings" = 1 ]; then
  pg_print_settings
  exit 0
fi

echo "Jobs named $PG_JOB_NAME (id, state, node):"
jobs=$(pg_jobs)
if [ -n "$jobs" ]; then
  echo "$jobs"
else
  echo "  none. Start one with $PG_TOOLS_DIR/pg-start.sh"
fi
echo

if [ ! -f "$PG_CONNECTION_FILE" ]; then
  echo "No connection file yet at $PG_CONNECTION_FILE."
  echo "It appears once the job reaches RUNNING; check $PG_HOME/logs/ if it does not."
  exit 0
fi

# shellcheck disable=SC1090
source "$PG_CONNECTION_FILE"
running=$(pg_running_job)
if [ -z "$running" ]; then
  echo "The server is NOT running. Details from the last start (job $PG_JOB_ID) for reference:"
elif [ "$running" != "$PG_JOB_ID" ]; then
  echo "Job $running is running but the connection file is from job $PG_JOB_ID; the job may still be starting."
else
  echo "The server is running as job $PG_JOB_ID."
fi
echo
echo "Host:      $PGHOST"
echo "Port:      $PGPORT"
echo "User:      $PGUSER"
echo "Database:  $PGDATABASE"
echo "Password:  $PGPASSWORD"
echo
echo "Interactive client on a login node:"
echo "  $PG_TOOLS_DIR/pg-connect.sh"
echo
echo "For a .env file (Project 1 DATABASE_URL):"
echo "  DATABASE_URL=$DATABASE_URL"
echo
echo "From your laptop, open a tunnel in one terminal and use localhost:5432 in another:"
echo "  ssh -N -L 5432:$PGHOST:$PGPORT $USER@hpg.rc.ufl.edu"
echo "  DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@localhost:5432/$PGDATABASE"
