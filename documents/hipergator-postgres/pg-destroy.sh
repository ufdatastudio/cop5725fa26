#!/bin/bash
# pg-destroy.sh: stop the server and DELETE its data directory.
#
# usage: pg-destroy.sh [-c pg.conf] [-H PG_HOME] [-a] [-y]
#
#   -a   also remove the password, logs, image, and PG_HOME itself
#   -y   skip the confirmation prompt
#
# Without -a the password file survives, so the next pg-start.sh creates a
# fresh, empty database with the same credentials.
set -u

usage() {
  sed -n '2,10p' "$0"
  exit "${1:-0}"
}

remove_all=0
assume_yes=0
while getopts "c:H:ayh" opt; do
  case "$opt" in
    c) PG_CONF="$OPTARG" ;;
    H) PG_HOME="$OPTARG" ;;
    a) remove_all=1 ;;
    y) assume_yes=1 ;;
    h) usage ;;
    *) usage 1 ;;
  esac
done

source "$(dirname "$0")/pg-lib.sh"
pg_load_config

case "$PG_HOME" in
  ""|/|/blue|/blue/cop5725|/blue/cop5725/|"$HOME") pg_die "refusing to destroy $PG_HOME" ;;
esac

if [ "$remove_all" = 1 ]; then
  target="$PG_HOME"
  what="everything under $PG_HOME (data, password, logs, image)"
else
  target="$PG_HOME/db"
  what="the database files under $PG_HOME/db"
fi

[ -e "$target" ] || pg_die "nothing to remove at $target"

echo "This deletes $what."
echo "There is no undo."
if [ "$assume_yes" != 1 ]; then
  printf 'Type yes to continue: '
  read -r answer
  [ "$answer" = "yes" ] || pg_die "cancelled"
fi

"$PG_TOOLS_DIR/pg-stop.sh" -H "$PG_HOME"
rm -rf "$target"
rm -f "$PG_CONNECTION_FILE"
pg_log "removed $target"

if [ "$remove_all" = 1 ]; then
  pg_log "run pg-create.sh to start over"
else
  mkdir -p "$PG_HOME/db/data"
  pg_log "run pg-start.sh for a fresh empty database"
fi
