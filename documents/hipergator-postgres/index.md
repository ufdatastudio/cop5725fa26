---
layout: default
---

# PostgreSQL Toolkit for HiPerGator

These are the scripts that [Running Your Own PostgreSQL Server on HiPerGator](../hipergator-postgres-apptainer) describes.
Each link opens the file as plain text, so you can read it before running it.
The same files sit in `/blue/cop5725/share/pg-tools/` on the cluster.

| File | Purpose |
|---|---|
| [pg-create.sh](pg-create.sh) | Make the folders under `PG_HOME` and write a random password. Run once. |
| [pg-start.sh](pg-start.sh) | Submit the server job with the resources from `pg.conf`. |
| [pg-info.sh](pg-info.sh) | Show the running server's host, port, password, `DATABASE_URL`, and tunnel command. |
| [pg-connect.sh](pg-connect.sh) | Open `pgcli` against the running server from a login node. |
| [pg-stop.sh](pg-stop.sh) | Cancel the server job and keep the data. |
| [pg-destroy.sh](pg-destroy.sh) | Cancel the job and delete the data directory. |
| [pg-server.sbatch](pg-server.sbatch) | The SLURM job that runs PostgreSQL in the container. Submitted by `pg-start.sh`. |
| [pg-lib.sh](pg-lib.sh) | Defaults and helpers the other scripts source. |
| [pg.conf](pg.conf) | Settings, as plain bash assignments. |

## Downloading the toolkit

Run this on a HiPerGator login node to place your own copy in your folder on the class allocation.

```bash
mkdir -p /blue/cop5725/$USER/pg-tools
cd /blue/cop5725/$USER/pg-tools
for f in pg-lib.sh pg.conf pg-create.sh pg-start.sh pg-info.sh pg-connect.sh pg-stop.sh pg-destroy.sh pg-server.sbatch; do
  curl -fsSLO https://ufdatastudio.com/cop5725fa26/documents/hipergator-postgres/$f
done
chmod +x pg-*.sh pg-server.sbatch
```

With `wget`, replace the `curl` line by `wget -q https://ufdatastudio.com/cop5725fa26/documents/hipergator-postgres/$f`.

Copying from the share folder gives the same result.

```bash
cp -r /blue/cop5725/share/pg-tools /blue/cop5725/$USER/pg-tools
```

Either way, run the scripts from `/blue/cop5725/<gatorlink>/pg-tools/` so the server and its connection file belong to you.

---

[back](../index)
