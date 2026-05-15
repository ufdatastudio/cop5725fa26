---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day27 Hash Indexes — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day27 Hash Indexes

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

Your project has a `session_token` column on a 100M-row `sessions` table. Every query is `WHERE session_token = ?`. Which index makes sense?

A. btree on `session_token`
B. hash on `session_token`
C. Either — performance is similar
D. Partial index on `WHERE active = true`

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C (or B). For pure equality, hash slightly edges btree but both work. In practice most PostgreSQL DBAs still default to btree. The honest answer is "either works; pick btree unless you have a profile showing hash matters." If you want to push for one: hash is the textbook-correct answer.
-->

---

# 📊 Clicker Check — Answer

**C. Either — performance is similar.**

For pure equality lookups on a high-cardinality column, both btree and hash index work well. Hash has slightly fewer page reads; btree has roughly the same and supports ranges as a bonus.

The honest production guidance:

- Default to **btree** unless you have a measurement showing hash matters
- Reach for **hash** only when:
  - You are certain you'll never want range support
  - The table is enormous and saving 2-3 disk reads per lookup matters
  - Your team understands that hash indexes don't support `IN`, range scans, or sort

In practice, 99% of PostgreSQL indexes are btree. Hash exists for a niche.
