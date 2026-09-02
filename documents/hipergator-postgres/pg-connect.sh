#!/bin/bash
# pg-connect.sh: open an interactive client to your running server.
#
# usage: pg-connect.sh [-c pg.conf] [-H PG_HOME] [-- extra pgcli/psql args]
#
# Uses pgcli from the ubuntu module when available and falls back to psql.
# Run it on a login node; the compute node is reachable from there.
set -u

usage() {
  sed -n '2,6p' "$0"
  exit "${1:-0}"
}

while getopts "c:H:h" opt; do
  case "$opt" in
    c) PG_CONF="$OPTARG" ;;
    H) PG_HOME="$OPTARG" ;;
    h) usage ;;
    *) usage 1 ;;
  esac
done
shift $((OPTIND - 1))

source "$(dirname "$0")/pg-lib.sh"
pg_load_config

[ -f "$PG_CONNECTION_FILE" ] || pg_die "no connection file. Is the server running? Try pg-info.sh"
[ -n "$(pg_running_job)" ] || pg_die "no running $PG_JOB_NAME job. Start one with pg-start.sh"

set -a
# shellcheck disable=SC1090
source "$PG_CONNECTION_FILE"
set +a

# A HiPerGator module hook creates ./tmp in the current directory on load,
# so load from inside PG_HOME where that folder is harmless, then return.
if ! command -v pgcli >/dev/null 2>&1; then
  pushd "$PG_HOME" >/dev/null
  module load ubuntu 2>/dev/null
  popd >/dev/null
fi
pg_fix_tmpdir

if command -v pgcli >/dev/null 2>&1; then
  exec pgcli -h "$PGHOST" -p "$PGPORT" -u "$PGUSER" -d "$PGDATABASE" "$@"
elif command -v psql >/dev/null 2>&1; then
  exec psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" "$@"
else
  pg_die "neither pgcli nor psql found. Run: module load ubuntu"
fi
