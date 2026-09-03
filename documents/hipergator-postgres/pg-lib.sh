#!/bin/bash
# pg-lib.sh: defaults and helpers shared by the pg-*.sh scripts and the
# pg-server.sbatch job. Source it; do not run it.
#
#   source "$(dirname "$0")/pg-lib.sh"
#   pg_load_config
#
# Precedence when a setting is resolved, highest first:
#   1. command-line flags (each script assigns PG_* before pg_load_config)
#   2. PG_* variables already exported in the environment
#   3. the pg.conf file (default: pg.conf next to the scripts, or $PG_CONF)
#   4. the defaults in pg_load_config

PG_VARS="PG_HOME PG_DB PG_IMAGE PG_SHARED_SIF PG_JOB_NAME PG_CPUS PG_MEM PG_TIME PG_ACCOUNT PG_QOS PG_PARTITION PG_PORT_MIN PG_PORT_MAX"

if [ -z "${PG_TOOLS_DIR:-}" ]; then
  PG_TOOLS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fi
export PG_TOOLS_DIR

pg_log() {
  echo "[pg] $*"
}

pg_die() {
  echo "[pg] error: $*" >&2
  exit 1
}

pg_load_config() {
  local conf="${PG_CONF:-$PG_TOOLS_DIR/pg.conf}"
  local v keep

  # Remember anything set by flags or the environment so pg.conf cannot
  # override it.
  for v in $PG_VARS; do
    if [ -n "${!v+x}" ]; then
      eval "_pg_keep_$v=\"\${$v}\""
    fi
  done

  PG_HOME="/blue/cop5725/$USER/postgresql"
  PG_DB="cop5725"
  PG_IMAGE="docker://postgres:18"
  PG_SHARED_SIF="/blue/cop5725/share/images/postgres-18.sif"
  PG_JOB_NAME="postgres-$USER"
  PG_CPUS="2"
  PG_MEM="8GB"
  PG_TIME="04:00:00"
  PG_ACCOUNT="cop5725"
  PG_QOS="cop5725"
  PG_PARTITION=""
  PG_PORT_MIN="10000"
  PG_PORT_MAX="40000"

  if [ -f "$conf" ]; then
    # shellcheck disable=SC1090
    source "$conf"
    PG_CONF_USED="$conf"
  else
    PG_CONF_USED="(none, using built-in defaults)"
  fi

  for v in $PG_VARS; do
    keep="_pg_keep_$v"
    if [ -n "${!keep+x}" ]; then
      eval "$v=\"\${$keep}\""
    fi
  done

  # shellcheck disable=SC2086
  export $PG_VARS PG_CONF_USED
  PG_PASSWORD_FILE="$PG_HOME/config/postgres-password"
  PG_CONNECTION_FILE="$PG_HOME/connection.env"
  export PG_PASSWORD_FILE PG_CONNECTION_FILE
}

# Apptainer needs an existing TMPDIR. Login nodes leave it unset, and a
# module hook then points it at ./tmp in the current directory.
pg_fix_tmpdir() {
  if [ ! -d "${TMPDIR:-}" ]; then
    export TMPDIR=/tmp
  fi
  export XDG_RUNTIME_DIR="$TMPDIR"
}

# Fail unless pg-create.sh has been run for this PG_HOME.
pg_require_created() {
  if [ ! -f "$PG_PASSWORD_FILE" ]; then
    pg_die "no password file at $PG_PASSWORD_FILE. Run pg-create.sh first."
  fi
}

# Path of the container image to run: the shared copy when readable,
# otherwise a private copy under PG_HOME that the job pulls on first start.
pg_sif_path() {
  if [ -r "$PG_SHARED_SIF" ]; then
    echo "$PG_SHARED_SIF"
  else
    echo "$PG_HOME/postgres.sif"
  fi
}

# Print "JOBID STATE NODE" for every job of ours with the configured name.
pg_jobs() {
  squeue -u "$USER" -n "$PG_JOB_NAME" -h -o "%i %T %N"
}

# Print the job id of the running server, or nothing.
pg_running_job() {
  squeue -u "$USER" -n "$PG_JOB_NAME" -t RUNNING -h -o "%i"
}

pg_print_settings() {
  local v
  echo "config file: $PG_CONF_USED"
  for v in $PG_VARS; do
    printf '%-14s %s\n' "$v" "${!v}"
  done
}
