---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management Systems - Fall 2026'
math: katex
html: true
---

<!-- _class: lead -->

# Day 25: B+ Trees I

**COP 5725 - Database Management Systems**
Wednesday, October 21, 2026

Structure · Search · Bulk Loading

<!--
First B+ tree day. Heavy mermaid use for tree visualizations. Pace 50 min, with the structure section (Part 2) taking 12 minutes and the search section (Part 3) the most interactive 15 minutes — hand-trace a search on the board.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

We have heap files. Without an index, a point lookup is O(B) — scan every page.

Today: the data structure that turns that O(B) into O(log_F N) — and does it on disk, with pages, with the storage costs we covered last week.

The B+ tree is **the** universal database index. PostgreSQL's `CREATE INDEX` defaults to it. SQL Server, Oracle, DB2, MySQL, SQLite — all use B+ trees.

</div>
<div>

```mermaid
graph TB
  H["Heap scan<br/>O(B)"]
  B["B+ tree<br/>O(log_F N)"]
  H -.->|"add index"| B
  classDef bad fill:#ffebee,stroke:#c62828,stroke-width:2px
  classDef good fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class H bad
  class B good
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  W["1. Why B+<br/>trees"] --> S["2. Structure"]
  S --> Sr["3. Search"]
  Sr --> B["4. Bulk<br/>loading"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class W,S,Sr,B step
```

Reference: GMW Ch. 14.1-14.2; PostgreSQL docs [Ch. 67 B-tree Indexes](https://www.postgresql.org/docs/current/btree.html).

---

<!-- _class: lead -->

# Part 1: Why B+ Trees

---

# The Tree Family

| Tree | Designed for | Lookup |
|------|--------------|--------|
| Binary search tree | In-memory data | O(log N) on average, O(N) worst |
| AVL / Red-Black | Balanced in-memory | O(log N) worst |
| **B-tree** (Bayer 1972) | Disk-based, balanced | O(log_F N) |
| **B+ tree** | Disk + range queries | O(log_F N) + leaf scan |
| LSM tree | Write-heavy | O(log N) batched |

The "+" in B+ tree refers to **all data living at the leaf level** — internal nodes contain only routing keys.

---

# Why Disk-Friendly Matters

```mermaid
graph LR
  BST["Binary tree<br/>2 children/node"]
  BT["B+ tree<br/>100s of children/node"]
  D["1 B record<br/>= 1 page<br/>= 1 I/O"]
  BST --> D
  BT --> D
  D --> Choice["log_2 N<br/>vs<br/>log_100 N"]
  classDef tree fill:#e3f2fd,stroke:#1976d2
  classDef io fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef result fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class BST,BT tree
  class D io
  class Choice result
```

For 1 billion rows:
- Binary tree height: ~30 → **30 disk reads**
- B+ tree with fan-out 100: ~5 → **5 disk reads**

That is the entire game.

<!--
Fan-out is the single most important number in a B+ tree. Doubling fan-out cuts log_F N by some amount; going from F=2 to F=100 reduces height by a factor of ~7. Real B+ trees use page-sized nodes that hold hundreds of keys.
-->

---

<!-- _class: lead -->

# Part 2: Structure

---

# A B+ Tree, Shaped

```mermaid
graph TB
  R["Internal: [40 | 80]"]
  I1["Internal: [10 | 25]"]
  I2["Internal: [50 | 65]"]
  I3["Internal: [85 | 95]"]
  L1["Leaf: 1, 5, 7 → values"]
  L2["Leaf: 10, 15, 20 → values"]
  L3["Leaf: 25, 30, 35 → values"]
  L4["Leaf: 40, 45 → values"]
  L5["Leaf: 50, 55, 60 → values"]
  L6["Leaf: 65, 70, 75 → values"]
  L7["Leaf: 80, 82 → values"]
  L8["Leaf: 85, 90 → values"]
  L9["Leaf: 95, 99 → values"]
  R --> I1
  R --> I2
  R --> I3
  I1 --> L1
  I1 --> L2
  I1 --> L3
  I2 --> L4
  I2 --> L5
  I2 --> L6
  I3 --> L7
  I3 --> L8
  I3 --> L9
  L1 -.-> L2 -.-> L3 -.-> L4 -.-> L5 -.-> L6 -.-> L7 -.-> L8 -.-> L9
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
  classDef internal fill:#fff8e1,stroke:#f57f17,stroke-width:2px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class R root
  class I1,I2,I3 internal
  class L1,L2,L3,L4,L5,L6,L7,L8,L9 leaf
```

Three levels. Internal nodes route. Leaves hold all data. Dotted arrows are the **leaf-level linked list**.

---

# Internal vs Leaf Nodes

<div class="columns">
<div>

### Internal nodes

- Hold **keys + child pointers**, no data
- Each key is a separator: "everything ≥ this key goes right"
- Fan-out F = pointers per node
- Mostly fit in the buffer pool (top levels are small)

</div>
<div>

### Leaf nodes

- Hold **keys + data** (or keys + row pointers)
- One linked-list neighbor pointer per leaf
- Range queries follow the linked list
- Live mostly on disk for large indexes

</div>
</div>

PostgreSQL's btree uses the row's `ctid` (physical tuple ID) as the "data" in leaves. Indexes are separate files from the heap.

<!--
The leaf-level linked list is what makes B+ trees the right choice over plain B-trees for databases. Range queries (BETWEEN, ORDER BY + LIMIT) traverse the leaf level without going back up the tree.
-->

---

# Fan-Out: The Key Number

A B+ tree node fits in **one page** (8 KB in PostgreSQL).

How many key + pointer pairs fit in 8 KB?

<div class="columns">
<div>

### Internal nodes
For 8-byte keys and 8-byte pointers:
$$F = \frac{8192}{8 + 8} = 512$$

In practice, F ≈ 100-300 once you account for metadata, slot pointers, and varying key sizes.

</div>
<div>

### Tree height for N records, fan-out F:
$$h = \lceil \log_F N \rceil$$

For F = 100, N = 1B:
$$h = \lceil \log_{100} 10^9 \rceil = 5$$

**Five page reads** to find any row in a billion.

</div>
</div>

This is why B+ trees won.

---

<!-- _class: lead -->

# Part 3: Search

---

# The Algorithm

```
Find(key):
  node = root
  while node is internal:
    find the first separator s in node with s > key
    follow the pointer to the left of s
    (if no such s, follow the rightmost pointer)
    node = that child
  # now node is a leaf
  scan leaf for key
  return data
```

Each step descends one level. Total cost: tree height.

---

# Search Walkthrough: Find 30

```mermaid
graph TB
  R["[40 | 80]"]
  I1["[10 | 25]"]
  I2["[50 | 65]"]
  I3["[85 | 95]"]
  L1["1, 5, 7"]
  L2["10, 15, 20"]
  L3["25, 30, 35"]
  L4["40, 45"]
  L5["50, 55, 60"]
  L6["65, 70, 75"]
  L7["80, 82"]
  L8["85, 90"]
  L9["95, 99"]
  R ==>|"30 < 40"| I1
  I1 ==>|"30 ≥ 25"| L3
  R --> I2
  R --> I3
  I1 --> L1
  I1 --> L2
  I2 --> L4
  I2 --> L5
  I2 --> L6
  I3 --> L7
  I3 --> L8
  I3 --> L9
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
  classDef visit fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef internal fill:#fff8e1,stroke:#f57f17
  classDef leaf fill:#e8f5e9,stroke:#388e3c
  classDef hit fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
  class R visit
  class I1 visit
  class L3 hit
  class I2,I3 internal
  class L1,L2,L4,L5,L6,L7,L8,L9 leaf
```

Three accesses: root → internal → leaf. Then a linear scan within the leaf to find 30.

---

# Range Queries via the Leaf List

```mermaid
graph LR
  S["Find 25<br/>(start)"]
  L3["25, 30, 35"]
  L4["40, 45"]
  L5["50, 55, 60"]
  E["Stop at 60"]
  S --> L3
  L3 -.->|"next"| L4
  L4 -.->|"next"| L5
  L5 --> E
  classDef start fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef leaf fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  classDef end1 fill:#ffebee,stroke:#c62828,stroke-width:3px
  class S start
  class L3,L4,L5 leaf
  class E end1
```

For `WHERE key BETWEEN 25 AND 60`:
1. Search down to the leaf containing 25 (3 page reads)
2. Walk the leaf-level linked list, reading each leaf
3. Stop when key > 60

Cost: O(log_F N) + (number of leaves in range).

---

# Where the Buffer Pool Pays Off

```mermaid
graph TB
  R["Root: 1 page"]
  L1["Level 1: ~100 pages"]
  L2["Level 2: ~10000 pages"]
  LD["Leaves: ~1M+ pages"]
  R --> L1 --> L2 --> LD
  R -.- C1["Cached (always)"]
  L1 -.- C2["Cached (mostly)"]
  L2 -.- C3["Cached (sometimes)"]
  LD -.- C4["Disk-resident"]
  classDef level fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef cache fill:#e8f5e9,stroke:#388e3c
  classDef disk fill:#ffebee,stroke:#c62828
  class R,L1,L2,LD level
  class C1,C2,C3 cache
  class C4 disk
```

For a 5-level tree with 1 B records:
- Levels 0-2: ~10,101 pages → ~80 MB → fits in `shared_buffers`
- Leaves: ~1 M pages → 8 GB → mostly on disk

The practical cost is often **1 disk I/O** to read the leaf page — the rest is cached.

---

<!-- _class: lead -->

# Part 4: Bulk Loading

---

# Why Sequential Insert Is Slow

If you `CREATE INDEX` on an existing 100 GB table by inserting rows one at a time:

- Each insert descends the tree (O(log N) page reads)
- Each insert dirties at least one leaf page (and possibly splits)
- Buffer pool thrashes with leaf pages
- Total cost: O(N log N) page accesses

Slow. For a 1-billion-row table, this can take days.

---

# Bulk Load: Build Bottom-Up

```
1. Sort all the rows by key (external merge sort).
2. Pack sorted rows into leaf pages, ~80% full.
3. For each leaf, emit one (key, leaf-pointer) into a list.
4. Pack the list into internal nodes one level up.
5. Repeat until you have one root page.
```

```mermaid
graph TB
  S["Sort N rows"]
  PL["Pack into leaves<br/>(80% full)"]
  P1["Build level 1<br/>from leaf keys"]
  PR["Continue up<br/>until one root"]
  S --> PL --> P1 --> PR
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class S,PL,P1,PR step
```

Cost: O(N log N) sort + O(N) build = essentially the sort cost.
PostgreSQL's `CREATE INDEX` does this when it can.

<!--
The 80% fill factor is intentional: leaving 20% room means inserts after the bulk load don't immediately cause splits. PostgreSQL's default fill factor for btree is 90% — tunable per index.
-->

---

# CREATE INDEX in PostgreSQL

```sql
-- Builds a btree, blocking writes (but allowing reads)
CREATE INDEX student_gpa_idx ON student (gpa);

-- Builds in the background, does not block writes
CREATE INDEX CONCURRENTLY student_gpa_idx ON student (gpa);
```

`CONCURRENTLY` is the production-safe form. It takes longer (2× the work) but lets reads and writes continue.

For a large table, even `CONCURRENTLY` benefits from the bottom-up bulk-load approach internally. Reference: [PostgreSQL Ch. 11.6 Building Indexes Concurrently](https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY).

---

# Wrap-up

You now have:

<div class="columns">
<div>

- The B+ tree as the disk-friendly balanced tree
- Internal vs leaf nodes; the leaf-level linked list
- Fan-out and why height is logarithmic in N

</div>
<div>

- Search algorithm and range-query traversal
- Buffer pool effects (top levels always cached)
- Bulk loading bottom-up
- `CREATE INDEX CONCURRENTLY` for production

</div>
</div>

---

# Friday: B+ Trees II

We add the operations that maintain the structure:

- **Insert** — with splits propagating up
- **Delete** — with underflow handling
- **Cost analysis** — concrete page-access numbers

Plus the PostgreSQL `pg_stat_user_indexes` view and a real-data demo.

Project 2 is due Friday at 11:59 PM.

Read GMW Ch. 14.2-14.3 before class.

---

# Practice Before Friday

Two exercises:

1. Hand-draw the B+ tree (order 4) that results from inserting `[10, 20, 30, 40, 50, 60, 70, 80]` in order. Show each step.
2. On your project's database, run `EXPLAIN ANALYZE` for a query that uses an index. Capture the plan and the elapsed time, with and without the index.

Push to your `cop5725fa26-project` repo before 8:30 AM Fri Oct 23.

---

# Questions

What is on your mind?

Project 2 due Friday night.

<!--
Common Day 25 questions: "Why don't we cover plain B-trees too?" (They're the same idea minus the leaf linked list. Databases use B+ trees universally because the linked list speeds up range scans dramatically.) "What's the difference between a B-tree and a B+ tree?" (B-trees store data at internal nodes; B+ trees only at leaves. B+ has linked leaves.)
-->
