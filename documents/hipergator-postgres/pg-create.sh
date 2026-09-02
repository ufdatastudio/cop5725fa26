#!/bin/bash
# pg-create.sh: one-time setup of the folders and password for your server.
#
# usage: pg-create.sh [-c pg.conf] [-H PG_HOME] [-d DBNAME]
#
# Safe to rerun: existing folders and an existing password are left alone.
set -u

usage() {
  sed -n '2,7p' "$0"
  exit "${1:-0}"
}

while getopts "c:H:d:h" opt; do
  case "$opt" in
    c) PG_CONF="$OPTARG" ;;
    H) PG_HOME="$OPTARG" ;;
    d) PG_DB="$OPTARG" ;;
    h) usage ;;
    *) usage 1 ;;
  esac
done

source "$(dirname "$0")/pg-lib.sh"
pg_load_config

case "$PG_HOME" in
  /blue/cop5725/"$USER"/*|/blue/cop5725/"$USER") ;;
  *) pg_log "warning: PG_HOME=$PG_HOME is outside /blue/cop5725/$USER" ;;
esac

mkdir -p "$PG_HOME"/config "$PG_HOME"/db/data "$PG_HOME"/run "$PG_HOME"/logs \
  || pg_die "could not create $PG_HOME"
chmod 700 "$PG_HOME"

if [ -f "$PG_PASSWORD_FILE" ]; then
  pg_log "keeping the existing password in $PG_PASSWORD_FILE"
else
  umask 077
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen > "$PG_PASSWORD_FILE"
  else
    openssl rand -hex 16 > "$PG_PASSWORD_FILE"
  fi
  umask 022
  pg_log "wrote a new random password to $PG_PASSWORD_FILE"
fi

if [ -r "$PG_SHARED_SIF" ]; then
  pg_log "container image: shared copy at $PG_SHARED_SIF"
else
  pg_log "container image: $PG_IMAGE will be pulled into $PG_HOME on first start"
fi

pg_log "created $PG_HOME"
pg_print_settings
echo
echo "Next: $PG_TOOLS_DIR/pg-start.sh"
