---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management - Fall 2026'
math: katex
html: true
---

<!-- _class: lead -->

# Day 26: B+ Trees II

**COP 5725 - Database Management**
Friday, October 23, 2026

Insert. Delete. Cost. Project 2 due tonight.

<!--
Closes the B+ tree pair. Heavy on progressive build-outs — show insert step by step. Project 2 due tonight; spend last 5 minutes on it.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Wednesday: structure and search. You can find any key in a B+ tree.

Today: the operations that **build** and **maintain** the tree. By the end of the hour you can hand-trace an insert sequence that triggers splits, and explain why most production engines hardly bother with deletes.

Project 2 is due tonight at 11:59 PM.

</div>
<div>

```mermaid
graph TB
  D25["Day 25<br/>search"]
  D26["Today<br/>insert + delete"]
  D27["Mon<br/>hash indexes"]
  D25 --> D26 --> D27
  classDef done fill:#e8f5e9,stroke:#388e3c
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef next fill:#e3f2fd,stroke:#1976d2
  class D25 done
  class D26 now
  class D27 next
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  I["1. Insert<br/>+ splits"] --> D["2. Delete<br/>+ merges"]
  D --> C["3. Cost<br/>analysis"]
  C --> P["4. PostgreSQL<br/>btree"]
  P --> Pr["5. Project 2<br/>wrap"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef milestone fill:#ffebee,stroke:#c62828,stroke-width:2px
  class I,D,C,P step
  class Pr milestone
```

---

<!-- _class: lead -->

# Part 1: Insert with Splits

---

# The Easy Case: Leaf Has Space

```mermaid
graph TB
  R["[40]"]
  L1["10, 20"]
  L2["40, 50"]
  R --> L1
  R --> L2
  L1 -.-> L2
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1,L2 leaf
```

Insert 30. Leaf has room.

```mermaid
graph TB
  R["[40]"]
  L1["10, 20, 30"]
  L2["40, 50"]
  R --> L1
  R --> L2
  L1 -.-> L2
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef hit fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1 hit
  class L2 leaf
```

Find the right leaf, slot the value in sorted order. Done.

---

# The Hard Case: Leaf Is Full — Step 1

Order-4 tree (max 3 keys per leaf). Insert 35.

```mermaid
graph TB
  R["[40]"]
  L1["10, 20, 30"]
  L2["40, 50"]
  R --> L1
  R --> L2
  L1 -.-> L2
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1,L2 leaf
```

35 belongs in the left leaf. But the leaf already has 3 keys (10, 20, 30) and cannot fit another.

Time to **split**.

---

# Insert Step 2 — Split the Leaf

```mermaid
graph TB
  R["[40]"]
  L1a["10, 20"]
  L1b["30, 35"]
  L2["40, 50"]
  R --> L1a
  R --> L1b
  R --> L2
  L1a -.-> L1b -.-> L2
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef new fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1a,L1b new
  class L2 leaf
```

The four values [10, 20, 30, 35] split into two leaves: [10, 20] and [30, 35].

The smallest key of the **right** leaf (30) is propagated up to the parent as a separator.

---

# Insert Step 3 — Update Parent

```mermaid
graph TB
  R["[30 | 40]"]
  L1a["10, 20"]
  L1b["30, 35"]
  L2["40, 50"]
  R --> L1a
  R --> L1b
  R --> L2
  L1a -.-> L1b -.-> L2
  classDef root fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1a,L1b,L2 leaf
```

The parent now has 2 separators (30, 40) and 3 children.
That fit. We're done.

If the parent had also been full, we'd split it next. Splits can cascade up.

---

# Cascading Splits

When the **root** itself splits, the tree grows one level. A new root is created with one separator and two children.

This is the **only way** a B+ tree's height changes.

```mermaid
graph TB
  R["[old root, full]"]
  R -.-> R1["[left half]"]
  R -.-> R2["[right half]"]
  NR["[new root: 1 key]"]
  NR --> R1
  NR --> R2
  classDef old fill:#ffebee,stroke:#c62828,stroke-width:2px
  classDef new fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R old
  class NR new
  class R1,R2 leaf
```

In practice: a 5-level B+ tree growing to 6 levels is rare and slow — billions of inserts.

<!--
Cascading splits are why bulk-load is so much faster than insert-by-insert. Bulk load packs leaves at 80% full and never splits during construction.
-->

---

# Insert Cost

Per insert:

- **Find the leaf**: O(log_F N) page reads
- **Split if needed**: 1 page write per split, propagating up

In the steady state:

- ~99% of inserts: no split, one leaf page dirtied
- ~1% of inserts: one split
- 0.01%: two-level split
- ... and so on, exponentially rarer

Amortized cost: **O(log_F N) per insert** with a small constant.

---

<!-- _class: lead -->

# Part 2: Delete

---

# The Easy Case: Leaf Stays Half-Full

```mermaid
graph TB
  R["[40]"]
  L1["10, 20, 30"]
  L2["40, 50"]
  R --> L1
  R --> L2
  L1 -.-> L2
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1,L2 leaf
```

Delete 20.

```mermaid
graph TB
  R["[40]"]
  L1["10, 30"]
  L2["40, 50"]
  R --> L1
  R --> L2
  L1 -.-> L2
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef hit fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1 hit
  class L2 leaf
```

Find, remove, done. The leaf remains at least half full.

---

# The Hard Case: Underflow

Imagine the rule: every leaf must have **at least 2 keys**. Now delete 50:

```mermaid
graph TB
  R["[40]"]
  L1["10, 30"]
  L2["40"]
  R --> L1
  R --> L2
  L1 -.-> L2
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef under fill:#ffebee,stroke:#c62828,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1 leaf
  class L2 under
```

The right leaf has only 1 key. Two options:

- **Redistribute** a key from the sibling
- **Merge** with the sibling

---

# Option A: Redistribute

```mermaid
graph TB
  R["[30]"]
  L1["10"]
  L2["30, 40"]
  R --> L1
  R --> L2
  L1 -.-> L2
  classDef root fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef ok fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class L1,L2 ok
```

Move one key (30) from the left sibling to the right; update the parent's separator.

Now both leaves have ≥ minimum keys.

---

# Option B: Merge

```mermaid
graph TB
  R["[]"]
  L1["10, 30, 40"]
  R --> L1
  classDef root fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef ok fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
  class R root
  class L1 ok
```

Combine the two leaves into one. The parent loses a separator.

If the parent now has too few separators, the underflow propagates up — possibly all the way to the root, **shrinking the tree by a level**.

---

# Why Real Databases Often Skip Most of This

<div class="columns">
<div>

The textbook delete algorithm is full of redistribute/merge bookkeeping. **Most production engines do not implement it strictly.**

PostgreSQL's btree:
- Marks dead tuples in leaves (does not rebalance)
- Reclaims space via VACUUM (background)
- Tolerates partially-empty leaves

Why? Most workloads insert much more than they delete. Lax delete is fine.

</div>
<div>

```mermaid
graph LR
  D["Delete"] -. "mark dead" .-> L["Leaf with<br/>dead tuples"]
  L -. "VACUUM" .-> R["Reclaimed<br/>space"]
  classDef act fill:#e3f2fd,stroke:#1976d2
  classDef state fill:#fff3e0,stroke:#e65100
  classDef done fill:#e8f5e9,stroke:#388e3c
  class D act
  class L state
  class R done
```

`VACUUM` and `pg_repack` are PostgreSQL's tools for space reclamation. Production databases run these regularly.

</div>
</div>

<!--
The "deletes don't really rebalance" reality is one of the more surprising facts of practical database engineering. Strict delete is correct; lax delete is fast and good enough. Bloat over time is recovered with VACUUM.
-->

---

<!-- _class: lead -->

# Part 3: Cost Analysis

---

# Height as a Function of Fan-Out

$$h = \lceil \log_F N \rceil$$

```mermaid
graph LR
  F1["F = 100<br/>N = 10⁹"] --> H1["h ≈ 5"]
  F2["F = 200<br/>N = 10⁹"] --> H2["h ≈ 4"]
  F3["F = 100<br/>N = 10¹²"] --> H3["h ≈ 6"]
  classDef param fill:#e3f2fd,stroke:#1976d2
  classDef result fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class F1,F2,F3 param
  class H1,H2,H3 result
```

Doubling the fan-out reduces height by 1 step at this scale.
Multiplying the row count by 1000 adds 1-2 steps.

The tree's height is **remarkably stable** across realistic dataset sizes.

---

# Cost Table for Common Operations

| Operation | Cost in page reads | Notes |
|-----------|-------------------|-------|
| Find one row by key | h ≈ 3-5 | Top 2-3 levels usually cached |
| Find rows in a range of R | h + R/(L) | L = entries per leaf |
| Insert one row | h | Plus 1 write; rare splits |
| Delete one row | h | Plus 1 write; usually lax |
| Full table scan via index | h + B_leaf | Often worse than heap scan |
| Build a new index | O(N log N) sort + O(N) build | `CREATE INDEX CONCURRENTLY` |

The full-scan-via-index row is surprising: scanning the heap directly is usually faster than scanning every leaf of an index. The optimizer knows this.

---

# When the Optimizer Ignores an Index

<div class="columns">
<div>

### Reasons the optimizer skips an index

- Predicate matches too many rows (sequential scan wins)
- The index's columns don't cover all needed values (lookup back to heap is expensive)
- Statistics are stale (`ANALYZE` not run recently)
- The table is small enough that one sequential scan beats any index access

</div>
<div>

### How to debug

```sql
EXPLAIN ANALYZE
SELECT * FROM student
WHERE gpa > 3.0;
```

If you expected an index scan and got a Seq Scan, check:
- Selectivity (`SELECT count(*)`)
- Stats freshness (`ANALYZE student`)
- Cost configuration (`random_page_cost`)

</div>
</div>

Section 5 dives deeper into the optimizer's decisions.

---

<!-- _class: lead -->

# Part 4: PostgreSQL's btree

---

# What pg_stat_user_indexes Shows

```sql
SELECT
  schemaname,
  relname            AS table_name,
  indexrelname       AS index_name,
  idx_scan           AS times_used,
  idx_tup_read       AS rows_read_via_index,
  idx_tup_fetch      AS rows_fetched_from_heap
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

This view tells you **which indexes earn their keep**.

An index with `idx_scan = 0` after weeks of traffic is dead weight — drop it.
Reference: [PostgreSQL Ch. 28.2.11 pg_stat_user_indexes](https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-USER-INDEXES-VIEW).

---

# When Indexes Hurt

<div class="columns">
<div>

### Every index costs

- Disk space (often 20-30% of the table)
- Insert / update / delete time (each modified row must update each index)
- Buffer pool pressure
- VACUUM time

</div>
<div>

### Anti-patterns

- Indexes on every column "just in case"
- Indexes on low-cardinality columns (e.g., `is_active BOOLEAN`) — usually useless
- Indexes the optimizer never picks (check `pg_stat_user_indexes`)

</div>
</div>

> The rule of thumb: an index is justified only if some query actually uses it and the speedup matters.

<!--
The "indexes are not free" point is often missed by application developers. Every index on a frequently-updated table is paying continuous tax for occasional benefit. Section 5 will quantify this; for now, plant the instinct.
-->

---

<!-- _class: lead -->

# Part 5: Project 2 Wrap

---

# Project 2 Due Tonight

<div class="columns">
<div>

### Tonight at 11:59 PM

- `analytics/` directory with 8-10 advanced-SQL files
- One naive-vs-window comparison with timing
- A `notebook.ipynb` with results and charts
- Updated `README.md`

Tag the commit `v2` and push to your `cop5725fa26-project` repo.

</div>
<div>

### Presentations next week

- **Mon Oct 26:** small-group breakouts during class
- **Wed Oct 28:** winners present to the full class

Project 3 (Indexing + Query Plans) released Monday — that one builds on what you just learned today.

</div>
</div>

---

# Wrap-up

You now have:

<div class="columns">
<div>

- Insert with cascading splits
- Delete with redistribute/merge (and why production is lax)
- Cost: O(log_F N) per operation, h = 3-5 in practice

</div>
<div>

- `pg_stat_user_indexes` for index hygiene
- When the optimizer ignores an index
- Partial indexes for low-selectivity boolean columns

</div>
</div>

The B+ tree is the universal database index. You can hand-trace one, predict its cost, and reason about whether one belongs in your schema.

---

# Monday: Hash Indexes

The other major index family.

By the end of Monday you know:
- Static hashing and why nobody uses it
- Extendible hashing
- Linear hashing
- When PostgreSQL's hash index beats its btree

Read GMW Ch. 14.4 before class.

---

# Practice Before Monday

Two exercises:

1. Hand-trace the insert sequence `[10, 20, 30, 40, 50, 60, 70, 80, 90]` into an empty order-4 B+ tree. Show splits.
2. Add a btree index to one of your project's tables. Run `EXPLAIN ANALYZE` on a query that uses it; capture the plan. Then `DROP INDEX` and rerun; compare.

Push to your `cop5725fa26-project` repo before 8:30 AM Mon Oct 26.

---

# Questions

What is on your mind?

Submit Project 2 before 11:59 PM tonight.

<!--
Common Day 26 questions: "How often does the tree height actually change in production?" (Rarely; even billion-row tables stabilize at h=4-5.) "Why don't we use B-trees instead of B+ trees?" (Range scans. B+ has leaf links; B-tree doesn't.) "Is PostgreSQL's btree the same as the textbook B+ tree?" (Very close. PostgreSQL adds concurrency features and uses page-sized nodes; the algorithm is recognizable.)
-->
