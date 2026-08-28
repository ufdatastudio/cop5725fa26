---
layout: default
---

# Connecting to CISE PostgreSQL

The UF Computer and Information Science and Engineering (CISE) department maintains a shared PostgreSQL server for student use.

## Contents
{: .no_toc}

* TOC
{:toc}

---

## Account Registration

To use CISE PostgreSQL, you must first register for an account.

1. Go to [register.cise.ufl.edu/databases/](https://register.cise.ufl.edu/databases/) and sign in with your GatorLink credentials.
2. Select **Postgres** from the available providers.
3. Click **Create Database** to generate your account.
4. You should receive a confirmation email at your CISE address within 30 minutes. If you don't, email [support@cise.ufl.edu](mailto:support@cise.ufl.edu).

### Password Requirements

Passwords must be 7–8 characters, include at least one letter, at least one non-alphanumeric character, and cannot start with a dash or contain your username.

---

## Connection Details

All CISE PostgreSQL connections use the following parameters:

```
Server:   postgres.cise.ufl.edu
Port:     5432
Database: your_username
Username: your_username
Password: (the password you set during registration)
```

Replace `your_username` with your CISE username throughout these examples.

---

## Network Access

### From CISE Lab Machines

If you are on a CISE lab machine (sun01, storm, thunder) or connected to a `*.cise.ufl.edu` network, you can connect directly.

### From Your Laptop or Off-Campus

The CISE PostgreSQL server only accepts connections from machines on the `*.cise.ufl.edu` network. If you are connecting from outside (your laptop, home, off-campus), you must use **SSH tunneling** to route your connection through a CISE machine.

#### SSH Tunnel Setup

Create an SSH tunnel through sun01, storm, or thunder:

```bash
ssh -L 5432:postgres.cise.ufl.edu:5432 your_username@sun01.cise.ufl.edu
```

This forwards local port 5432 to the CISE PostgreSQL server. Keep the SSH connection open in a terminal while you connect to PostgreSQL in another.

---

## Basic PostgreSQL Usage

### Connecting with psql

`psql` is the PostgreSQL command-line client. On Linux and macOS it is usually installed; on Windows, install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/).

#### Direct Connection (from CISE lab machine)

```bash
psql -h postgres.cise.ufl.edu -U your_username -d your_username
```

#### Connection via SSH Tunnel (from your laptop)

Once your SSH tunnel is set up, use:

```bash
psql -h localhost -U your_username -d your_username
```

#### Connection Strings (for code or tools)

If you need a full connection string:

```
postgresql://your_username:your_password@postgres.cise.ufl.edu:5432/your_username
```

From your laptop via SSH tunnel:

```
postgresql://your_username:your_password@localhost:5432/your_username
```

### Creating Tables

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gpa NUMERIC(3, 2)
);
```

### Inserting Data

Insert single rows:

```sql
INSERT INTO students (name, gpa) VALUES ('Alice Johnson', 3.85);
```

Or insert multiple rows in one command:

```sql
INSERT INTO students (name, gpa) VALUES
    ('Bob Smith', 3.72),
    ('Carol White', 3.91),
    ('David Lee', 3.45);
```

### Querying Data

Retrieve all rows:

```sql
SELECT * FROM students;
```

With a filter:

```sql
SELECT name, gpa FROM students WHERE gpa > 3.5 ORDER BY gpa DESC;
```

Count rows:

```sql
SELECT count(*) FROM students;
```

### Exporting Query Results

Use `\copy` to save results:

```sql
\copy (SELECT * FROM students) TO '/path/to/output.csv' WITH CSV HEADER;
```

Other formats:

```sql
-- Tab-separated values
\copy (SELECT * FROM students) TO '/path/to/output.tsv' WITH CSV DELIMITER E'\t' HEADER;

-- Plain text (pipe-delimited by default)
\copy (SELECT * FROM students) TO '/path/to/output.txt' WITH CSV DELIMITER '|' HEADER;
```

You can also run a query and redirect output from the shell:

```bash
psql -h postgres.cise.ufl.edu -U your_username -d your_username -c "SELECT * FROM students" > output.txt
```

Or pipe through other tools:

```bash
psql -h postgres.cise.ufl.edu -U your_username -d your_username -c "SELECT * FROM students;" | head -20
```

### Alternative: GUI Clients

If you prefer a graphical interface, popular options include:

- [pgAdmin](https://www.pgadmin.org/) — Free, web-based; works well with remote servers
- [DBeaver](https://dbeaver.io/) — Free and commercial versions; powerful query tools
- [DataGrip](https://www.jetbrains.com/datagrip/) — Paid; integrates with JetBrains IDEs

All support SSH tunneling. For this course, `psql` is sufficient and will be used in examples.

### Useful psql Commands

Common commands in `psql` (prefixed with backslash):

```
\dt                 -- List all tables
\d table_name       -- Show table structure and column info
\du                 -- List roles and permissions
\q                  -- Quit psql
\help               -- Show SQL command help
\? command          -- Help for psql commands
```

---

## Verifying Your Setup

To test your connection without creating tables, run the `setup/verify.py` script from Project 0:

```bash
# Copy your connection string to .env
echo "DATABASE_URL=postgresql://your_username:your_password@postgres.cise.ufl.edu:5432/your_username" > .env

# Run the optional PostgreSQL check
uv run --env-file .env --extra postgres setup/verify.py
```

If the check passes, you will see:

```
PostgreSQL: OK (PostgreSQL 13.14 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 9.3.0, 64-bit)
All checks passed.
```

---

## Troubleshooting

### Connection Refused (Port 5432)

**From your laptop:** You likely forgot the SSH tunnel. Open one terminal and run:

```bash
ssh -L 5432:postgres.cise.ufl.edu:5432 your_username@sun01.cise.ufl.edu
```

Keep it open, then connect in a separate terminal.

**From a CISE lab machine:** The server may be down. Email [support@cise.ufl.edu](mailto:support@cise.ufl.edu) and include the error message.

### Password Rejected

- Confirm you are using the password you set during registration, not your GatorLink password.
- If you forget the password, reset it at [register.cise.ufl.edu/databases/](https://register.cise.ufl.edu/databases/).
- Passwords are case-sensitive.

### Connection Timeout

If the connection times out, check that your SSH tunnel is running in another terminal.

### Database Name Confusion

Your database name is your CISE username. You cannot create or choose additional databases in the registration portal. All your tables live in the default database created for you.

---

## Additional Resources

- [PostgreSQL official documentation](https://www.postgresql.org/docs/current/)
- [psql command reference](https://www.postgresql.org/docs/current/app-psql.html)
- [CISE IT support page](https://it.cise.ufl.edu/support/) (GatorLink required)

---

[back](index)
