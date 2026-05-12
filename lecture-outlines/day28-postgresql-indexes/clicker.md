---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day28 Postgresql Indexes — Instructor Only'
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
## Day28 Postgresql Indexes

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

You have an `events` table:
- 5 billion rows
- Appended in `created_at` order
- Most queries filter on `created_at` ranges

Which index gives you the best size/performance trade-off?

A. btree on `created_at` (50 GB)
B. GIN on `created_at` (not applicable)
C. BRIN on `created_at` (5 MB)
D. Hash on `created_at`

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. BRIN is exactly designed for this. 5B rows in btree is enormous; BRIN gets you 95% of the performance at 0.01% of the size. GIN doesn't fit timestamps; hash doesn't help with range queries.
-->

---

# 📊 Clicker Check — Answer

**C. BRIN on `created_at` (5 MB).**

- btree (A) would work but consumes 50 GB and maintains 50 GB worth of pages
- GIN (B) is for set-shaped columns; a timestamp is scalar
- Hash (D) is equality-only — useless for range filters

BRIN's correlation requirement is met: the table is appended in `created_at` order, so physical position correlates perfectly with the indexed value.

This is the canonical pattern for time-series logging tables — BRIN every time.
