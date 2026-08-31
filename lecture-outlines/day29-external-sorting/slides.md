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

# Day 29: External Sorting

**COP 5725 - Database Management Systems**
Friday, October 30, 2026

How a database sorts more data than it has memory for

<!--
Closes Section 4. Pace 50 min. The two-phase algorithm and the multi-way merge tree are the central concepts; the PostgreSQL work_mem connection at the end is what students need for Project 3.
Quiz 3 takes the last 10 minutes (it covers Section 4, per the schedule), so the lecture itself gets about 40.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Wednesday covered PostgreSQL's index types. Today covers sorting.

`ORDER BY`, `GROUP BY`, sort-merge joins, and `CREATE INDEX` all sort.

When the data is bigger than memory, the database uses **external sorting**, a two-phase algorithm that dates to the earliest database systems and still runs every day in production.

Today covers how the algorithm works and why PostgreSQL's `work_mem` matters for it.

Quiz 3 covers Section 4 and runs in the last 10 minutes of class.

</div>
<div>

```mermaid
graph TB
  Q["Query needing sort"]
  M["Memory<br/>(M pages)"]
  D["Data<br/>(B >> M pages)"]
  E["External sort"]
  Q --> E
  M --> E
  D --> E
  E --> S["Sorted output"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  class Q,M,D,S step
  class E now
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  W["1. Why<br/>external sort"] --> P["2. Two-phase<br/>algorithm"]
  P --> M["3. Multi-way<br/>merge"]
  M --> R["4. Replacement<br/>selection"]
  R --> Pg["5. PostgreSQL<br/>specifics"]
  Pg --> Wr["6. Section 4<br/>wrap"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class W,P,M,R,Pg,Wr step
```

Reference: Textbook §15.4, p. 723; PostgreSQL docs [Resource Consumption, work_mem](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM).

---

<!-- _class: lead -->

# Part 1: Why External Sort

---

# Why In-Memory Sorting Fails

Python's `sorted()`, C's `qsort()`, and their relatives assume all data fits in RAM.

A database sort cannot make that assumption:

- Tables can be 100s of GB to PBs
- Memory is GBs at most
- A naive in-memory sort would crash or swap to disk uncontrollably

**External sorting** sorts using only `M` pages of memory at a time, with the rest of the data staying on disk.

---

# The Setup

| Variable | Meaning |
|----------|---------|
| `B` | Total pages of data to sort |
| `M` | Pages of memory available |
| `B >> M` | We cannot just load everything |

The classic example: sort a **1 TB** table on **16 GB** of memory.
- B = 1 TB / 8 KB ≈ 130 million pages
- M = 16 GB / 8 KB ≈ 2 million pages

We can hold ~1.5% of the data at once. Every page must touch memory at least twice (once to sort, once to merge). External sort minimizes the total touches.

---

<!-- _class: lead -->

# Part 2: Two-Phase External Sort

---

# Phase 1: Sort Runs

```
Read M pages of data into memory.
Sort them in-memory (quicksort or similar).
Write the sorted chunk to disk as a "run".
Repeat until all input is read.
```

<table>
<tbody>
<tr><th>input</th><td style="background:#FFE082">7</td><td style="background:#FFE082">3</td><td style="background:#FFE082">12</td><td style="background:#A5D6A7">15</td><td style="background:#A5D6A7">5</td><td style="background:#A5D6A7">9</td><td style="background:#90CAF9">20</td><td style="background:#90CAF9">8</td><td style="background:#90CAF9">1</td></tr>
</tbody>
</table>

<table>
<tbody>
<tr><th>Run 1</th><td style="background:#FFE082">3</td><td style="background:#FFE082">7</td><td style="background:#FFE082">12</td></tr>
<tr><th>Run 2</th><td style="background:#A5D6A7">5</td><td style="background:#A5D6A7">9</td><td style="background:#A5D6A7">15</td></tr>
<tr><th>Run 3</th><td style="background:#90CAF9">1</td><td style="background:#90CAF9">8</td><td style="background:#90CAF9">20</td></tr>
</tbody>
</table>

<div class="small">

Each color is one memory-load of M values, sorted in place and written out as one run; Phase 2 merges these runs.

</div>

After Phase 1, you have $\lceil B / M \rceil$ sorted runs on disk <span class="cite">(Textbook §15.4.1, p. 723)</span>.

**I/O cost:** read B, write B = 2B.

<!--
The textbook calls runs "sorted sublists" (§15.4.1). The colors carry across to the Phase 2 slide: the same three runs get merged there.
-->

---

# Phase 2: Multi-Way Merge

```
Open one input stream per run.
Read the first page of each run into memory.
Output the smallest record across all streams.
When a stream's page is consumed, read the next page from that run.
Repeat until all runs are exhausted.
```

<table>
<tbody>
<tr><th>Run 1</th><td style="background:#FFE082">3</td><td style="background:#FFE082">7</td><td style="background:#FFE082">12</td></tr>
<tr><th>Run 2</th><td style="background:#A5D6A7">5</td><td style="background:#A5D6A7">9</td><td style="background:#A5D6A7">15</td></tr>
<tr><th>Run 3</th><td style="background:#90CAF9">1</td><td style="background:#90CAF9">8</td><td style="background:#90CAF9">20</td></tr>
</tbody>
</table>

<table>
<tbody>
<tr><th>merged</th><td style="background:#90CAF9">1</td><td style="background:#FFE082">3</td><td style="background:#A5D6A7">5</td><td style="background:#FFE082">7</td><td style="background:#90CAF9">8</td><td style="background:#A5D6A7">9</td><td style="background:#FFE082">12</td><td style="background:#A5D6A7">15</td><td style="background:#90CAF9">20</td></tr>
</tbody>
</table>

<div class="small">

Each merged cell keeps the color of the run it came from. The merge repeatedly outputs the smallest value at the front of any run.

</div>

**I/O cost:** read B, write B = 2B.

**Total cost:** 4B page reads/writes.

---

# How Many Runs Can We Merge At Once?

We need:
- 1 page of memory per run (the "input buffer")
- 1 page for the output buffer

So with M pages of memory, we can merge **M - 1 runs** simultaneously.

With M = 100 pages and 1000 runs after Phase 1, one merge pass handles only 99 runs, so more passes are needed.

But if M is large enough to merge all runs at once, **two passes is enough**.

---

# When Two Passes Suffice

Phase 1 produces $\lceil B / M \rceil$ runs.
We can merge $M - 1$ runs in one pass <span class="cite">(Textbook §15.4.1, p. 723)</span>.

Two passes suffice when:
$$\frac{B}{M} \leq M - 1$$
$$B \leq M(M - 1) \approx M^2$$

For M = 1000 pages (8 MB), this covers $10^6$ pages (8 GB).
For M = 100,000 pages (800 MB), this covers $10^{10}$ pages (80 TB).

> Real databases sort terabytes with two passes.

<!--
The "M-squared rule" is the key insight. As long as your memory budget squared is bigger than your data size, two passes is enough. This is why work_mem matters — it's the M in this equation.
-->

---

<!-- _class: lead -->

# Part 3: Multi-Way Merge Tree

---

# Visualizing the Merge

For data that needs multiple merge passes (rare on modern hardware):

```mermaid
graph TB
  R1["Run 1"]
  R2["Run 2"]
  R3["Run 3"]
  R4["Run 4"]
  R5["Run 5"]
  R6["Run 6"]
  R7["Run 7"]
  R8["Run 8"]
  M1["Merge"]
  M2["Merge"]
  M3["Final merge"]
  R1 --> M1
  R2 --> M1
  R3 --> M1
  R4 --> M1
  R5 --> M2
  R6 --> M2
  R7 --> M2
  R8 --> M2
  M1 --> M3
  M2 --> M3
  M3 --> Out["Sorted output"]
  classDef run fill:#e8f5e9,stroke:#388e3c
  classDef merge fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef out fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class R1,R2,R3,R4,R5,R6,R7,R8 run
  class M1,M2,M3 merge
  class Out out
```

Each level of the merge tree adds a 2B I/O pass <span class="cite">(Textbook §15.8.1, p. 752)</span>.

---

# Heap-Based Priority Queue

Inside one merge step, the algorithm needs the **minimum** across all current pages from each run.

A **min-heap** of size (M-1) does this in O(log M) per output record.

```mermaid
graph TB
  Top["Top of heap<br/>(smallest)"]
  H1["Run 1's current value"]
  H2["Run 2's current value"]
  H3["Run 3's current value"]
  Hdots["..."]
  HN["Run M-1's current value"]
  Top --> H1
  Top --> H2
  Top --> H3
  Top --> Hdots
  Top --> HN
  classDef heap fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef top fill:#fff3e0,stroke:#e65100,stroke-width:3px
  class Top top
  class H1,H2,H3,Hdots,HN heap
```

Pop the top. Output it. Read the next value from that run. Insert into heap. Repeat.

---

<!-- _class: lead -->

# Part 4: Replacement Selection

---

# Bigger Runs From the Same Memory

The basic algorithm makes runs of exactly **M** pages.

**Replacement selection**, analyzed in Knuth's *The Art of Computer Programming* Vol. 3, can make runs of **~2M** pages on average.

```
Maintain a heap of M pages worth of records.
Repeatedly:
  - Pop the smallest record
  - Output it to the current run
  - Read the next input record
  - If it's ≥ the just-output value: add to current heap (extends this run)
  - Else: add to a side heap (starts the next run)
When the main heap is empty, the run ends. Side heap becomes new main heap.
```

The effect: records that arrived "early in the input but should be late in this run" get carried along until the run finishes.

---

# The Effect of Replacement Selection

<div class="columns">
<div>

### Without

- M-page runs
- $\lceil B / M \rceil$ runs after Phase 1

### With

- ~2M-page runs on average (for random input)
- About half as many runs

</div>
<div>

### Why it matters

Fewer runs means:
- Phase 2 may complete in one pass when it otherwise wouldn't
- The "M² rule" becomes a "2M × M" rule

</div>
</div>

> PostgreSQL used replacement selection in `tuplesort.c` through version 10. Version 11 removed it: quicksorted runs are faster on modern hardware because they keep the CPU cache warm, and large `work_mem` makes extra merge passes uncommon anyway.

<!--
Replacement selection is worth teaching for the classic 2M-run analysis, but be clear that PostgreSQL dropped it in v11. The cache-locality argument won: a heap of tuples scattered in memory loses to quicksort on a contiguous array.
-->



---

<!-- _class: lead -->

# Part 5: PostgreSQL Specifics

---

# work_mem

```sql
SHOW work_mem;     -- 4 MB on default install

-- Set per-session
SET work_mem = '256 MB';

-- For one query
SET LOCAL work_mem = '256 MB';
SELECT * FROM huge_table ORDER BY col;
```

`work_mem` is **the memory budget per sort/hash operation**, not per query and not per connection.

A query with three sorts and one hash join could consume **4× work_mem**.
A server with 100 active connections could consume **100× work_mem × operations**.

Reference: [PostgreSQL docs, Resource Consumption, work_mem](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-WORK-MEM).

---

# When PostgreSQL Spills to Disk

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM huge_table ORDER BY col;
```

If the sort fits in `work_mem`:

```
Sort  (cost=...) (actual time=...)
  Sort Method: quicksort  Memory: 25kB
```

If the sort spills:

```
Sort  (cost=...) (actual time=...)
  Sort Method: external merge  Disk: 1234kB
```

`external merge` is exactly the two-phase algorithm above, with run files in `pgsql_tmp/`.

> Spilling is a common reason fast queries slow down under load.

<!--
The "external merge" line is one of the most actionable hints PostgreSQL gives. Doubling work_mem can turn a 30-second sort into a 1-second one if it lets the sort stay in memory.
-->

---

# Tuning work_mem

<div class="columns">
<div>

### Too low

- Sorts spill to disk constantly
- Hash aggregates degrade
- 100× slowdowns on simple queries

### Too high

- Memory exhaustion under load (n_conn × n_op × work_mem)
- OS starts swapping → catastrophic
- OOM killer takes down the database

</div>
<div>

### Reasonable defaults

- Default 4 MB is too small for any real workload
- Try 32-256 MB on a typical OLTP server
- Per-session bumps for analytical queries

For Project 3: measure both with default and with bumped `work_mem`.

</div>
</div>

---

<!-- _class: lead -->

# Part 6: Section 4 Wrap

---

# Section 4 Recap

<div class="columns-3">
<div>

### Storage
- The hierarchy and order-of-magnitude latency
- Pages, records, slotted layout
- Buffer pools and replacement

</div>
<div>

### Indexes
- B+ trees with insert/delete/cost
- Hash indexes
- PostgreSQL's GiST, GIN, BRIN
- Partial, expression, multi-column

</div>
<div>

### Sorting
- Two-phase external sort
- Multi-way merge
- `work_mem` and disk spill

</div>
</div>

Section 5 builds query processing on top of these pieces.

---

# Section 5 Preview

```mermaid
graph LR
  S4["Section 4<br/>(done)"]
  S5A["Mon Nov 2<br/>Joins I"]
  S5B["Wed Nov 4<br/>Joins II"]
  S5C["Fri Nov 6<br/>Iterator Model"]
  S5D["Mon Nov 9<br/>Vectorized Exec<br/>+ Optimization I"]
  S5E["Fri Nov 13<br/>Optimization II<br/>+ Project 3 due"]
  S4 --> S5A --> S5B --> S5C --> S5D --> S5E
  classDef done fill:#e8f5e9,stroke:#388e3c
  classDef next fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef milestone fill:#ffebee,stroke:#c62828
  class S4 done
  class S5A,S5B,S5C,S5D next
  class S5E milestone
```

Section 5 covers query processing: joins, iterators, vectorized execution, and optimization. Exam 2 follows the week after.

Reading for Monday: Textbook §§15.2-15.3, pp. 709-722.

---

# Wrap-up

- External sorting runs in two phases: sort runs in memory, then merge them.
- A two-pass sort costs 4B page I/Os and handles inputs up to about M² pages.
- Multi-way merge picks the next record with a heap-based priority queue.
- Replacement selection doubles average run length; PostgreSQL dropped it in version 11 for cache-friendly quicksorted runs.
- `work_mem` is the per-operation memory budget, and "external merge" in EXPLAIN ANALYZE means the sort spilled to disk.

Section 4 closes. Section 5 opens Monday.

<!--
One bullet per part of the lecture. The work_mem bullet is the one students need for Project 3.
-->


---

# Practice This Weekend

Three exercises in your project repo:

1. Run `EXPLAIN ANALYZE` on an `ORDER BY` query against a large table in your project. Find one that spills to disk.
2. Bump `work_mem` and rerun. Capture both plans and the elapsed times.
3. Update your README with the two plans and a short paragraph explaining the difference.

This is an exercise.

---

# Questions and Quiz 3

Quick questions, then Quiz 3 takes the last 10 minutes. It covers Section 4 (Storage and Indexing).

Project 3 due Fri Nov 13.

<!--
Common Day 29 questions: "Can I bump work_mem permanently?" (Yes, in postgresql.conf or via ALTER SYSTEM. Be careful with concurrent load — total memory = work_mem × active sorts × connections.) "Why does GROUP BY use sorts?" (It can — though hash aggregation is often used instead. We compare in Week 12.) "How do I know if a sort is the bottleneck?" (EXPLAIN ANALYZE shows time per operator. The Sort line's time tells you.)
Keep questions to a couple of minutes, hand out Quiz 3, collect at the bell. Section 4 closes with this quiz.
-->
