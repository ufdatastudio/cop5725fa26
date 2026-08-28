---
layout: default
---

# Connecting to CISE PostgreSQL

The UF Computer and Information Science and Engineering (CISE) department maintains a shared PostgreSQL server for student use. This guide walks through account registration, network access, and basic usage.

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

When prompted to set a password, it must meet these criteria:

- 7 or 8 characters long (only the first 8 are used)
- Contain at least one letter
- Contain at least 2 special characters or digits, with at least 1 being non-alphanumeric
- First character cannot be a dash (`-`)
- Cannot contain your username
- Avoid common 1-character replacements (e.g., `i` → `1`, `a` → `@`)

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

Set up an SSH tunnel through one of the remote-accessible CISE machines (sun01, storm, or thunder):

```bash
ssh -L 5432:postgres.cise.ufl.edu:5432 your_username@sun01.cise.ufl.edu
```

This command:
1. Connects you to `sun01.cise.ufl.edu` via SSH
2. Creates a local tunnel that forwards port 5432 on your laptop to port 5432 on the CISE PostgreSQL server

Keep this SSH connection open while you use PostgreSQL. In a separate terminal, connect as described in the next section.

---

## Basic PostgreSQL Usage

### Connecting with psql

The `psql` client is the primary command-line tool for PostgreSQL. It comes built-in on most Linux and macOS systems. On Windows, install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/) to get `psql`.

#### Direct Connection (from CISE lab machine)

```bash
psql -h postgres.cise.ufl.edu -U your_username -d your_username
```

#### Connection via SSH Tunnel (from your laptop)

After setting up the SSH tunnel as described above, use:

```bash
psql -h localhost -U your_username -d your_username
```

You will be prompted for your password. Enter the password you set during registration.

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

Once connected in `psql`, you can create tables with standard SQL:

```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gpa NUMERIC(3, 2)
);
```

The prompt will show `your_username=#` when you are connected as a superuser. Tables you create are owned by you and can be queried only if you grant permissions to other users.

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

To save query results to a file from within `psql`, use the `\copy` command:

```sql
\copy (SELECT * FROM students) TO '/path/to/output.csv' WITH CSV HEADER;
```

This exports with a header row. For other formats:

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

### Useful psql Commands

Once inside `psql`, these commands are handy (they start with a backslash):

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

If you are off-campus and see a timeout, your SSH tunnel may not be running. Start it in a separate terminal and try again.

### Database Name Confusion

Your database name is your CISE username. You cannot create or choose additional databases in the registration portal. All your tables live in the default database created for you.

---

## Additional Resources

- [PostgreSQL official documentation](https://www.postgresql.org/docs/current/)
- [psql command reference](https://www.postgresql.org/docs/current/app-psql.html)
- [CISE IT support page](https://it.cise.ufl.edu/support/) (GatorLink required)

---

[back](index)
