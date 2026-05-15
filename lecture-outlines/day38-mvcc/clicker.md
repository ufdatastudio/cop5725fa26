---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day38 Mvcc — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day38 Mvcc

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

In PostgreSQL, when you `UPDATE` a row, what happens to the original row on disk?

A. It is modified in place
B. A new row is written; the old row remains but is marked dead
C. The old row is deleted immediately
D. Both old and new are kept forever

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. The old row stays on disk with xmax set; the new row is written with new xmin. VACUUM eventually reclaims dead rows.
-->

---

# 📊 Clicker Check — Answer

**B. A new row is written; the old row remains but is marked dead.**

PostgreSQL's MVCC always writes a new version. The old version's `xmax` is set to the updating transaction's XID, signaling "this version was deleted by xid X."

Eventually, when no active transaction can still see the old version, **VACUUM** reclaims its space. Until then, the dead row consumes pages on disk.

This is why PostgreSQL `UPDATE`-heavy workloads create disk **bloat**. The garbage collection (VACUUM) is essential.

---

# 📊 Clicker Check

In your project's database, you have a `bookings` table and an invariant "no two bookings on the same room overlap in time." Under PostgreSQL's default isolation level (READ COMMITTED), two concurrent INSERTs of overlapping bookings might:

A. Always be caught — PostgreSQL never violates invariants
B. Both succeed, producing an invalid state
C. Block each other automatically
D. Throw a deadlock error

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. READ COMMITTED doesn't enforce invariants spanning multiple rows. The fix is either SERIALIZABLE isolation, SELECT ... FOR UPDATE on the relevant rows, or an EXCLUDE constraint (which we covered in Day 18).
-->

---

# 📊 Clicker Check — Answer

**B. Both succeed, producing an invalid state.**

`READ COMMITTED` allows this exact write skew pattern. Each transaction sees a consistent snapshot, sees no conflicting booking, and inserts. Both succeed.

Three valid fixes:

1. **`SERIALIZABLE` isolation** — SSI detects the conflict and aborts one
2. **`SELECT ... FOR UPDATE`** — acquire row locks proactively
3. **`EXCLUDE USING gist (room WITH =, during WITH &&)`** (Day 18) — the constraint catches it at INSERT time

Option 3 is the cleanest for "no two bookings overlap" because the database enforces it regardless of isolation level. This is why we covered `EXCLUDE` constraints in Section 2.
