---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day35 Transactions Acid — Instructor Only'
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
## Day35 Transactions Acid

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

Which ACID property is violated when, between two SELECTs in your transaction, another transaction commits a new row and your second SELECT returns one more row?

A. Atomicity
B. Consistency
C. Isolation
D. Durability

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. This is a phantom read — the other transaction's INSERT became visible mid-stream. Strict isolation would prevent this; PostgreSQL's REPEATABLE READ does, READ COMMITTED doesn't.
-->

---

# 📊 Clicker Check — Answer

**C. Isolation.**

This is a **phantom read**. The other transaction's INSERT is visible inside your transaction's lifetime, making your transaction observably non-isolated.

Strict isolation (serializable) prevents this. PostgreSQL's `REPEATABLE READ` also prevents it through MVCC. The default `READ COMMITTED` does *not* prevent it.

We see how PostgreSQL achieves this on Day 38 (MVCC).

---

# 📊 Clicker Check

A query reads the same row twice in one transaction. The second read returns a different value. Which isolation level allowed this?

A. Read Uncommitted
B. Read Committed
C. Repeatable Read
D. Serializable

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. Read Committed allows non-repeatable reads — another transaction can commit a change to that row between the two reads. Read Uncommitted (A) also allows it but is rare in practice. Repeatable Read and Serializable block it.
-->

---

# 📊 Clicker Check — Answer

**B. Read Committed.**

The defining property of `READ COMMITTED` (PostgreSQL's default): you only see committed changes, but a row can change between two reads within your transaction.

- `READ UNCOMMITTED` (A) also allows this, plus dirty reads — but PostgreSQL treats it as `READ COMMITTED`.
- `REPEATABLE READ` (C) gives you a consistent snapshot of the data from the start of your transaction.
- `SERIALIZABLE` (D) goes further and prevents serialization anomalies.

PostgreSQL's default is `READ COMMITTED` because it's fast and tolerates the most concurrent throughput. Tighter levels exist for code that needs them.
