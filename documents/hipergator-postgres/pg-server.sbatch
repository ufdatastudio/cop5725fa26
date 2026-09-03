#!/bin/bash
# pg-server.sbatch: run a private PostgreSQL server in an Apptainer container.
#
# Submit it with pg-start.sh, which fills in the resources from pg.conf and
# names the job postgres-<gatorlink>. You can also submit it directly with
# sbatch; then the #SBATCH lines below and the defaults in pg-lib.sh apply.
# SLURM does not expand $USER in #SBATCH lines, so submit through pg-start.sh
# (or pass --job-name=postgres-$USER yourself) to get the per-user name that
# pg-info.sh and pg-connect.sh look for.
#
# Adapted from a Grand Valley State University recipe
# (https://services.gvsu.edu/TDClient/60/Portal/KB/PrintArticle?ID=24265),
# tested on HiPerGator by Alex Moskalenko of UF Research Computing, Aug 2026.

#SBATCH --job-name=postgres
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --mem=8GB
#SBATCH --time=04:00:00
#SBATCH --output=postgres-%j.out
#SBATCH --error=postgres-%j.err
#SBATCH --dependency=singleton
#SBATCH --signal=B:SIGINT@60

set -u
date; hostname; pwd

# pg-start.sh exports PG_TOOLS_DIR; a bare sbatch falls back to the
# directory the job was submitted from.
PG_TOOLS_DIR="${PG_TOOLS_DIR:-$SLURM_SUBMIT_DIR}"
source "$PG_TOOLS_DIR/pg-lib.sh"
pg_load_config
pg_require_created

# Work from PG_HOME so anything the module hooks create lands there.
cd "$PG_HOME" || pg_die "cannot cd to $PG_HOME"
module load apptainer
pg_fix_tmpdir

# Pull the image once. The shared copy in /blue/cop5725/share is used when
# it exists; otherwise the download lands in your own PG_HOME.
SIF=$(pg_sif_path)
if [ ! -f "$SIF" ]; then
  pg_log "pulling $PG_IMAGE into $SIF (first start only)"
  apptainer pull "$SIF" "$PG_IMAGE"
fi

# Environment read by the container's entrypoint on first start.
export POSTGRES_USER="$USER"
export POSTGRES_DB="$PG_DB"
export POSTGRES_PASSWORD_FILE="$PG_PASSWORD_FILE"
export POSTGRES_HOST_AUTH_METHOD=scram-sha-256
export POSTGRES_INITDB_ARGS="--data-checksums"

# PGDATA is a path inside the container; the bind mount below maps it to
# PG_HOME/db/data. The image sets its own PGDATA, which wins over an exported
# variable, so it has to be passed with --env.
PGDATA_IN_CONTAINER=/var/lib/postgresql/data

# Compute nodes are shared, so pick a random port instead of 5432.
PG_PORT=$(shuf -i "${PG_PORT_MIN}-${PG_PORT_MAX}" -n 1)
PG_HOST=$(hostname)
read -r PG_PASSWORD < "$PG_PASSWORD_FILE"

# Write everything a client needs to one file that pg-info.sh and
# pg-connect.sh read. It is readable by you alone.
umask 077
{
  echo "PGHOST=$PG_HOST"
  echo "PGPORT=$PG_PORT"
  echo "PGUSER=$USER"
  echo "PGDATABASE=$PG_DB"
  echo "PGPASSWORD=$PG_PASSWORD"
  echo "DATABASE_URL=postgresql://$USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/$PG_DB"
  echo "PG_JOB_ID=$SLURM_JOB_ID"
} > "$PG_CONNECTION_FILE"
umask 022

echo "PostgreSQL is listening on port $PG_PORT of compute node $PG_HOST"
echo "Your username is $USER and the database is $PG_DB"
echo "The password is in $PG_PASSWORD_FILE"
echo "Connection details were written to $PG_CONNECTION_FILE"
echo "Connect from a login node with: $PG_TOOLS_DIR/pg-connect.sh"
echo "Or by hand: module load ubuntu; export PGPASSWORD=$PG_PASSWORD; pgcli -u $USER -h $PG_HOST -p $PG_PORT -d $PG_DB"

# Run the server in the background so the shell can forward the SIGINT that
# SLURM sends one minute before the walltime. PostgreSQL treats SIGINT as a
# fast shutdown: it flushes and exits cleanly instead of being killed.
apptainer run \
  --env "PGDATA=$PGDATA_IN_CONTAINER" \
  -B "$PG_HOME/db:/var/lib/postgresql" \
  -B "$PG_HOME/run:/var/run/postgresql" \
  "$SIF" -c "port=$PG_PORT" &
PG_PID=$!

pg_shutdown() {
  pg_log "shutdown requested, stopping PostgreSQL"
  kill -INT "$PG_PID" 2>/dev/null
}
trap pg_shutdown INT TERM

wait "$PG_PID"
wait "$PG_PID"
pg_log "PostgreSQL exited"
