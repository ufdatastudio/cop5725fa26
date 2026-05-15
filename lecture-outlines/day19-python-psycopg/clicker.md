---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day19 Python Psycopg — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day19 Python Psycopg

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

Which of these is safe against SQL injection?

```python
# A
cur.execute(f"SELECT * FROM student WHERE name = '{name}'")

# B
cur.execute("SELECT * FROM student WHERE name = '%s'" % name)

# C
cur.execute("SELECT * FROM student WHERE name = %s", (name,))

# D
cur.execute("SELECT * FROM student WHERE name = " + repr(name))
```

<!-- _backgroundColor: #fff8e1 -->

<!--
Hold for 45 seconds. The answer is C. A and B both do string substitution in Python before the SQL is sent — vulnerable. C lets psycopg do server-side parameterization. D uses repr which adds quotes but is still injecting — it would survive simple attacks but not all.
-->

---

# 📊 Clicker Check — Answer

**C. `cur.execute("SELECT * FROM student WHERE name = %s", (name,))`**

A and B build the SQL string with the user input inside it before psycopg sees the query. The `%s` in B is the **Python operator**, not the psycopg placeholder — the SQL string is fully assembled before psycopg gets it.

C uses the psycopg placeholder: psycopg sends the SQL and the parameter separately, and PostgreSQL never confuses the value with code.

D uses `repr` which adds quotes but does not escape; a value like `'; DROP TABLE student; --` still breaks out.

---

# 📊 Clicker Check

```python
with psycopg.connect("...") as conn:
    with conn.cursor() as cur:
        cur.execute("INSERT INTO student VALUES (99, 'Test', 3.5)")
        raise RuntimeError("oh no")
```

After the script exits with this RuntimeError, what is in the `student` table?

A. The row with sid=99 is in the table
B. The row was inserted then deleted
C. The row was never committed — the table is unchanged
D. The table is locked indefinitely

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. The context manager rolls back on exception, so the INSERT is undone. This is the safest default and one of the main reasons to use context managers around transactions.
-->

---

# 📊 Clicker Check — Answer

**C. The row was never committed — the table is unchanged.**

The `with psycopg.connect(...) as conn:` block treats clean exit as commit and any exception as rollback. When `RuntimeError` propagates, the connection's context manager rolls the transaction back before reraising.

This is the safest default. If you want guaranteed commits, do it explicitly with `conn.commit()` inside the `try` block.

---

# 📊 Clicker Check

For a query that returns 50 million rows, which approach is the right call?

A. `df = pd.read_sql_query(query, conn)` — load all rows into a DataFrame
B. Add server-side aggregation to the query so it returns fewer rows
C. `cur.execute(query)` then iterate and process row by row
D. Use `COPY` to dump the result to CSV first, then read the CSV

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. The right answer is to do the work in SQL. Pulling 50 M rows over the wire to a DataFrame is wasteful when most analyses can be expressed as aggregations. C is acceptable if the work truly cannot be done in SQL. A will likely OOM. D works but is the most complex.
-->

---

# 📊 Clicker Check — Answer

**B. Add server-side aggregation to the query so it returns fewer rows.**

The fastest, cheapest, and most idiomatic answer is to make the database do the work. Window functions, group-by, and CTEs from Sections 1-2 cover almost every analytical pattern.

C (row-by-row iteration) is correct only when the per-row work cannot be expressed in SQL — for example, calling an external API on each row.

A will run out of memory. D works but adds machinery that an aggregated query removes.
