---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day25 Bplus Trees I — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day25 Bplus Trees I

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A B+ tree with fan-out 200 indexes a 100-million-row table. The tree's height (root to leaf) is approximately:

A. 1
B. 4
C. 27
D. 50

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. log_200(10^8) ≈ 3.5, rounds to 4. Most B+ trees in practice have height 3-5; the top levels often live entirely in the buffer pool, leaving 1-2 disk reads per lookup.
-->

---

# 📊 Clicker Check — Answer

**B. 4.**

$$h = \lceil \log_{200} 10^8 \rceil = \lceil 3.5 \rceil = 4$$

Most real B+ trees have height 3-5. Combined with caching the top 2-3 levels in the buffer pool, the practical cost of a B+ tree lookup is **1-2 disk reads** even at billion-row scale.

This is why every database calls B+ trees "fast" — and why a row store with the right indexes can compete with a column store on point queries.

---

# 📊 Clicker Check

You have an existing 50-million-row PostgreSQL table. You need to add a btree index on a frequently-queried column. Which command minimizes downtime?

A. `CREATE INDEX idx ON tbl(col);`
B. `CREATE INDEX CONCURRENTLY idx ON tbl(col);`
C. Stop the database, copy data to a new table with the index, swap names
D. `ALTER TABLE tbl ADD COLUMN idx INDEX;`

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. CONCURRENTLY is exactly designed for this. A holds an exclusive lock and blocks writes for the duration. C is downtime-heavy. D is not valid SQL — index creation uses CREATE INDEX, not ALTER TABLE ADD COLUMN.
-->

---

# 📊 Clicker Check — Answer

**B. `CREATE INDEX CONCURRENTLY idx ON tbl(col);`**

`CONCURRENTLY`:
- Builds the index in the background
- Acquires only a short metadata lock at the start and end
- Lets reads and writes continue during the build
- Takes about 2× as long as a non-concurrent build because it scans the table twice

Option A blocks writes for the duration — fine for development, dangerous in production. Option C is downtime. Option D is not valid SQL.
