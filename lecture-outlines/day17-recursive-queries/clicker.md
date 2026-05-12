---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day17 Recursive Queries — Instructor Only'
math: katex
html: true
style: |
  footer { font-size: 0.6em; }
  section.lead h1 { text-align: center; }
  table { font-size: 0.85em; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
---

<!-- _class: lead -->

# Clicker Checks
## Day17 Recursive Queries

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

A recursive CTE traverses a friendship graph without a path-array or depth bound. The graph has cycles. What happens?

A. PostgreSQL detects cycles automatically and stops
B. The query terminates when no new rows are produced (cycles → no new rows)
C. The query runs forever or until OOM
D. The query returns an incorrect result but terminates

<!--
Answer: C. PG does NOT detect cycles automatically in WITH RECURSIVE. Without a path array or depth cap, friends-of-friends in a cyclic graph keeps adding the same rows (technically the working set always has new rows because the path differs even if the same vertex is revisited).
Actually wait — with UNION (not UNION ALL), duplicates are eliminated and the query would terminate. With UNION ALL (the common form), duplicates accumulate and it runs forever.
Let me adjust: in most teaching examples, students write UNION ALL which is faster. UNION ALL plus cycles plus no path tracking = infinite loop.
-->

---

# Clicker Check — Answer

**C. The query runs forever (or until OOM / statement_timeout).**

PostgreSQL does **not** detect cycles automatically in `WITH RECURSIVE`. Two reasons it spins:

- `UNION ALL` (the common form) does not deduplicate. The same vertex pair gets added on every cycle pass.
- Even with `UNION` (which deduplicates), if you store enough state (path arrays), each cycle produces "new" rows technically.

The fix is always **explicit cycle detection**:

```sql
WITH RECURSIVE friends AS (
  SELECT sid_y, 1 AS hops, ARRAY[sid_x, sid_y] AS path
  FROM friend_sym WHERE sid_x = :seed
  UNION ALL
  SELECT fs.sid_y, n.hops + 1, n.path || fs.sid_y
  FROM friends n
  JOIN friend_sym fs ON fs.sid_x = n.friend_id
  WHERE n.hops < 5
    AND NOT fs.sid_y = ANY(n.path)
)
SELECT * FROM friends;
```

Either bound the depth (`hops < N`) or track visited (`NOT IN (n.path)`).
