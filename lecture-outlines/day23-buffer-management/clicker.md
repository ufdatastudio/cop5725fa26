---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day23 Buffer Management — Instructor Only'
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
## Day23 Buffer Management

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A database with 1 GB buffer pool runs:

1. A repeated lookup query that touches the same 500 MB of pages
2. Concurrently, a one-off `SELECT count(*) FROM ten_gigabyte_table` scan

With pure LRU, what happens to the lookup query's performance?

A. Unchanged — it touches the same pages, they stay cached
B. Improved — both queries share pages
C. Degraded — the scan evicts the lookup query's hot pages
D. Crashed — buffer pool overflows

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: C. The scan, being most recent, pushes its pages to the front of LRU; the lookup query's hot 500 MB gets evicted. This is exactly why PostgreSQL added the sequential-scan ring buffer.
-->

---

# 📊 Clicker Check — Answer

**C. Degraded — the scan evicts the lookup query's hot pages.**

Pure LRU treats "recently accessed" as "valuable." A one-pass scan keeps marking pages "recently used" as it touches them; the hot pages from the lookup query age out.

This is why PostgreSQL uses a small ring buffer for sequential scans instead of the main buffer pool. Many other systems use LRU-K or ARC, which differentiate "touched once" from "touched repeatedly."

---

# 📊 Clicker Check

You observe a cache hit ratio of 60% on a transactional workload. What is the most likely diagnosis?

A. `shared_buffers` is too small for the working set
B. The OS page cache is doing the work — no action needed
C. A long-running analytical query is sweeping the cache
D. Both A and C are common causes

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: D. Either undersized buffer pool or a competing scan workload can drop hit ratios. The combo of pg_stat_database + pg_buffercache + EXPLAIN ANALYZE diagnoses which one. Worth two minutes of discussion.
-->

---

# 📊 Clicker Check — Answer

**D. Both A and C are common causes.**

A 60% hit rate is a red flag on transactional work. The two most likely culprits:

- **`shared_buffers` too small** for the dataset's hot region
- **A competing scan workload** (analytics, batch jobs) is evicting OLTP pages

The fix depends on diagnosis. Use `pg_buffercache` to see what's cached, and `pg_stat_activity` to see what's running.

The next-most-likely cause is **excessive index bloat** — pages of dead tuples taking up cache slots. We address that in Section 6 (VACUUM, autovacuum).
