---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day26 Bplus Trees Ii — Instructor Only'
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
## Day26 Bplus Trees Ii

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

Your `events` table has 10 columns and 100 million rows. You see an index on the `is_processed BOOLEAN` column. The column is 99% `false`. A common query is `WHERE is_processed = false`. Should the index stay?

A. Yes — most queries use this column
B. No — low cardinality makes the index useless
C. Depends — useful only for `is_processed = true`
D. Replace with a partial index on `WHERE is_processed = true`

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: D. The partial index is the right call. WHERE is_processed = true matches 1% of rows (good index target); the index needs to store only 1% of the rows; queries for false are still served by sequential scan (which is right because they hit 99% of rows). This is a real production pattern.
-->

---

# 📊 Clicker Check — Answer

**D. Replace with a partial index on `WHERE is_processed = true`.**

Three insights:

1. `WHERE is_processed = false` hits 99% of rows; a sequential scan wins.
2. `WHERE is_processed = true` hits 1%; an index is worth it.
3. A **partial index** stores only the rows matching its predicate. The index is 1% of the size; updates only hit it when `is_processed` changes.

```sql
CREATE INDEX events_unprocessed_idx
  ON events (id)
  WHERE is_processed = false;
```

Partial indexes are one of PostgreSQL's most underused features. We will see them again in Week 11.
