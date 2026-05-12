---
marp: true
theme: default
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management Systems - Fall 2026'
math: katex
html: true
style: |
  footer { font-size: 0.6em; }
  section.lead h1 { text-align: center; }
  .footnote { font-size: 0.6em; color: #666; position: absolute; bottom: 30px; }
  img { display: block; margin: 0 auto; }
  table { font-size: 0.85em; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .columns-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  .columns-left-wide { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
  .columns-right-wide { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
  .rows { display: grid; grid-template-rows: 1fr 1fr; gap: 1rem; }
  .small { font-size: 0.8em; }
  mark { background: #fef3c7; padding: 0 0.2em; }
  blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; color: #444; }
  .mermaid { text-align: center; }
  .interactive { background: #fff3e0; border-left: 4px solid #ff6f00; padding: 1em; border-radius: 4px; }
  .error { background: #ffebee; border-left: 4px solid #c62828; padding: 1em; border-radius: 4px; }
  .doc { background: #e3f2fd; border-left: 4px solid #1976d2; padding: 1em; border-radius: 4px; }
  .clicker { background: #fff8e1; border-left: 6px solid #f57f17; padding: 1.2em; border-radius: 4px; }
  pre code { font-size: 0.85em; }
---

<!-- _class: lead -->

# Day 32: The Iterator (Volcano) Model

**COP 5725 - Database Management Systems**
Friday, November 6, 2026

The execution framework every query engine uses

<!--
Closes Week 12. Pace 50 min, with the worked plan-tree trace taking real time. The Graefe 1994 paper is the anchor — it's only 18 pages and astonishingly readable for its age.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

You've seen six join algorithms. You've seen sorts. You've seen filters and projections from the algebra.

Today: the framework that **wires them together** into a query plan and **drives** that plan to produce results.

The answer is the **iterator model**, also called the **Volcano model** after the seminal 1994 paper. It is the execution architecture inside almost every database engine for the last 30 years.

</div>
<div>

```mermaid
graph TB
  Plan["Plan tree"]
  Op1["Sort"]
  Op2["Join"]
  Op3["Scan A"]
  Op4["Scan B"]
  Plan --> Op1
  Op1 --> Op2
  Op2 --> Op3
  Op2 --> Op4
  classDef root fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef op fill:#fff3e0,stroke:#e65100,stroke-width:2px
  class Plan root
  class Op1,Op2,Op3,Op4 op
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  W["1. Why an<br/>execution model"] --> V["2. The Volcano<br/>model"]
  V --> Wk["3. Walking<br/>a plan"]
  Wk --> Pb["4. Pipeline<br/>vs blocking"]
  Pb --> F["5. Where Volcano<br/>falls short"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class W,V,Wk,Pb,F step
```

Anchor paper: Graefe, [*Volcano: An Extensible and Parallel Query Evaluation System*](https://ufdatastudio.com/cop5725fa26/papers/pdfs/graefe1994.pdf), IEEE TKDE 6(1), 1994.

---

<!-- _class: lead -->

# Part 1: Why an Execution Model

---

# The Problem

You have:
- A plan tree (the parsed and optimized query)
- A set of operator implementations (scan, filter, join, sort, ...)
- Real data on disk

You need:
- A way to **run** the plan
- A way to **compose** operators arbitrarily
- A way to handle **streaming** (don't materialize huge intermediates)
- A way to handle **memory limits** (some operators need state, some don't)

The Volcano model solves all of these with a single uniform interface.

---

# The Idea: Operators Are Iterators

Every operator implements three methods:

```python
class Operator:
    def open(self):
        """Initialize state. Called once before any data flows."""

    def next(self) -> Tuple | None:
        """Produce the next output tuple. None signals end of stream."""

    def close(self):
        """Release resources."""
```

This is the **Volcano interface**. Three methods. That's it.

Operators are composed by **child pointers** in the tree. When an operator needs more input, it calls `next()` on its child.

---

<!-- _class: lead -->

# Part 2: The Volcano Model in Detail

---

# A Scan Operator

```python
class TableScan(Operator):
    def __init__(self, table_name):
        self.table_name = table_name
        self.cursor = None

    def open(self):
        self.cursor = open_table_file(self.table_name)

    def next(self):
        return self.cursor.read_next_tuple()  # None at EOF

    def close(self):
        self.cursor.close()
```

The leaf of every plan tree. Reads from the heap file one tuple at a time.

Real implementations read a **page** at a time and serve tuples from the page — but the interface stays "one tuple per `next()`."

---

# A Filter Operator

```python
class Filter(Operator):
    def __init__(self, child, predicate):
        self.child = child
        self.predicate = predicate

    def open(self):
        self.child.open()

    def next(self):
        while True:
            tup = self.child.next()
            if tup is None:
                return None
            if self.predicate(tup):
                return tup

    def close(self):
        self.child.close()
```

The filter pulls tuples from `child.next()` and yields the ones that pass.

`next()` may iterate many child tuples before returning one of its own. From the **caller's** view, it still returns one tuple per call.

---

# A Hash Join Operator

```python
class HashJoin(Operator):
    def __init__(self, build_side, probe_side, join_keys):
        self.build = build_side
        self.probe = probe_side
        self.keys = join_keys
        self.hash_table = {}
        self.current_matches = []
        self.current_probe = None

    def open(self):
        self.build.open()
        # Drain the build side completely (blocking!)
        while True:
            tup = self.build.next()
            if tup is None: break
            self.hash_table.setdefault(tup[self.keys[0]], []).append(tup)
        self.build.close()
        self.probe.open()

    def next(self):
        while True:
            if self.current_matches:
                return (self.current_probe, self.current_matches.pop())
            self.current_probe = self.probe.next()
            if self.current_probe is None: return None
            self.current_matches = list(
                self.hash_table.get(self.current_probe[self.keys[1]], [])
            )

    def close(self):
        self.probe.close()
        self.hash_table = None
```

Notice `open()` drains the build side **completely** before yielding any output. We return to this.

---

<!-- _class: lead -->

# Part 3: Walking a Plan

---

# A Three-Operator Plan

```sql
SELECT name FROM student WHERE gpa > 3.5;
```

```mermaid
graph TB
  Proj["Project (name)"]
  Filt["Filter (gpa > 3.5)"]
  Scan["TableScan (student)"]
  Proj --> Filt
  Filt --> Scan
  classDef op fill:#fff3e0,stroke:#e65100,stroke-width:2px
  class Proj,Filt,Scan op
```

To run: call `Proj.open()`, then `Proj.next()` repeatedly until it returns None, then `Proj.close()`.

---

# Trace: One Output Tuple

The driver calls `Proj.next()`:

```
Proj.next()
  → Filt.next()
    → Scan.next() → tuple1 (gpa=2.0)
  → Filt rejects tuple1
  → Filt.next() called again (in the loop)
    → Scan.next() → tuple2 (gpa=3.7)
  → Filt accepts tuple2
  → Filt returns tuple2
  Proj projects to {name: 'Ada'}
  → return {name: 'Ada'}
```

The driver receives **one** tuple. Behind the scenes, the chain of `next()` calls did all the work.

<!--
The "pull-based" nature of Volcano is the key insight: the consumer pulls tuples from above; producers respond on demand. This is why it's also called the pull model. Contrast with the "push model" used in some modern engines.
-->

---

# Operators Compose Freely

Any operator can be a child of any other. The interface is uniform:

```python
plan = HashJoin(
    build=Filter(
        child=TableScan("student"),
        predicate=lambda t: t["gpa"] > 3.5
    ),
    probe=TableScan("enrollment"),
    join_keys=("sid", "sid"),
)
plan.open()
while (tup := plan.next()) is not None:
    print(tup)
plan.close()
```

The same recursive `next()` pattern produces complex pipelines.

This is the architecture inside PostgreSQL's executor — see [src/backend/executor/](https://github.com/postgres/postgres/tree/master/src/backend/executor) for the real source.

---

<!-- _class: lead -->

# Part 4: Pipelining vs Blocking

---

# Pipelined Operators

A **pipelined** operator can produce output as soon as it gets a single input tuple.

```mermaid
graph LR
  S["Scan"] --> F["Filter"]
  F --> P["Project"]
  P --> O["Output"]
  classDef op fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  class S,F,P,O op
```

Scan → Filter → Project: all pipelined. A tuple flows through with no buffering.

Examples of pipelined operators:
- Scan
- Filter
- Project
- Index Scan
- Nested Loop Join (on the outer side)
- Limit
- Append (UNION ALL)

---

# Blocking Operators

A **blocking** operator must **see all its input** before producing any output.

```mermaid
graph LR
  S["Scan"] --> H["Hash<br/>(blocking)"]
  H --> J["Hash Join"]
  J --> O["Output"]
  classDef ok fill:#e8f5e9,stroke:#388e3c
  classDef block fill:#ffebee,stroke:#c62828,stroke-width:2px
  class S,J,O ok
  class H block
```

Examples of blocking operators:
- Sort
- Hash (the build side of a hash join)
- Hash Aggregate
- Materialize (explicit cache node)

The blocking operator's `open()` typically drains all its input.

---

# Why LIMIT Matters

```sql
SELECT name FROM student WHERE gpa > 3.5 LIMIT 10;
```

Plan tree:

```
Limit (10)
  Project (name)
    Filter (gpa > 3.5)
      Scan student
```

All four operators are pipelined. The driver calls `Limit.next()` 10 times, then **stops**.

Each call propagates down to the scan. The scan reads pages **as needed**. We never read the full table.

PostgreSQL's `EXPLAIN ANALYZE` shows this:
```
Limit (cost=0.00..6.21 rows=10 width=20)
  ->  Seq Scan on student (cost=0.00...) (actual rows=10)
        Filter: (gpa > 3.5)
```

The "actual rows" on the scan is **10, not |student|**.

<!--
This LIMIT-stops-early behavior is one of the most important practical consequences of the iterator model. A query with LIMIT 1 on a filtered scan often reads almost no data, even from huge tables.
-->

---

# LIMIT With a Blocking Operator

```sql
SELECT name FROM student WHERE gpa > 3.5 ORDER BY name LIMIT 10;
```

Plan tree:

```
Limit (10)
  Sort (by name)              ← blocking
    Filter (gpa > 3.5)
      Scan student
```

The `Sort` is blocking. It must consume the entire filtered output to sort it. Only then can `Limit` pull 10 sorted tuples.

The early-stop benefit of `LIMIT` **disappears** above a blocking operator.

> When you `ORDER BY ... LIMIT` and want it to be cheap, add an index on the order-by column — the planner can replace `Sort + Limit` with `Index Scan + Limit`, restoring pipelining.

---

<!-- _class: lead -->

# Part 5: Where Volcano Falls Short

---

# The Overhead Problem

Volcano processes **one tuple per `next()` call**. Modern hardware:

- CPU: 4 GHz, can do ~10⁹ ops/sec
- Each `next()` call: virtual function dispatch, register pressure, no SIMD
- Per-tuple overhead: 50-200 nanoseconds

For a query over **1 billion tuples**, that's **50-200 seconds of pure interpretation overhead** — before any actual work.

```mermaid
graph LR
  T["Tuple"] --> Op1["op.next()"]
  Op1 --> Op2["child.next()"]
  Op2 --> Op3["..."]
  Op3 --> Time["~100 ns per call"]
  classDef step fill:#e3f2fd,stroke:#1976d2
  classDef cost fill:#ffebee,stroke:#c62828,stroke-width:2px
  class T,Op1,Op2,Op3 step
  class Time cost
```

For OLAP workloads, this overhead is the bottleneck.

---

# The Modern Answer: Vectorized Execution

Process tuples in **batches** (vectors of 1024 or 4096 at a time).

- One `next()` call returns a vector
- Per-tuple work is amortized over the vector
- Inner loops are tight, branch-free, and SIMD-friendly

```mermaid
graph LR
  V["Vector of 1024 tuples"] --> Op["op.next_vector()"]
  Op --> Op2["child.next_vector()"]
  Op2 --> Time2["~10 ns per tuple amortized"]
  classDef step fill:#e3f2fd,stroke:#1976d2
  classDef faster fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
  class V,Op,Op2 step
  class Time2 faster
```

This is the architecture inside **DuckDB**, MonetDB/X100, Photon, Velox.

Volcano is for OLTP and broad compatibility; vectorized is for OLAP throughput. Monday's lecture goes deeper.

---

# When Volcano Still Wins

PostgreSQL stays Volcano-style for good reasons:

- OLTP workloads return 1-100 tuples — overhead doesn't matter
- Implementation simplicity makes the planner easier
- Adding new operators is straightforward
- Concurrency model fits well

> The interpretation overhead matters only when you process **millions of tuples per query**. For most OLTP workloads, Volcano is plenty fast.

PostgreSQL has added JIT compilation since version 11 to reduce per-tuple overhead while keeping the iterator interface.

---

# Wrap-up

You now have:

<div class="columns">
<div>

- The three-method Volcano interface: open / next / close
- The pull-based execution model
- How operators compose into plan trees

</div>
<div>

- Pipelining vs blocking operators
- Why LIMIT short-circuits some plans and not others
- The per-tuple overhead problem and the vectorized response

</div>
</div>

---

# Monday: Vectorized Execution + Optimization I

We pick up where today ends:

- **Vectorized execution** — the batch-based answer to Volcano's overhead
- **Optimization I** — relational algebra equivalences that drive plan choice
- The plan tree as a tree of choices

Read PostgreSQL docs [Ch. 16 Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html) for the high-level view.

---

# Practice Before Monday

Two exercises:

1. Pick a query from your project. Run `EXPLAIN (ANALYZE, BUFFERS)` and label each node as pipelined or blocking.
2. Add `LIMIT 10` to a query that returns many rows. Capture the plan with and without the LIMIT. Where does the optimizer cut the work?

Push to your `cop5725fa26-project` repo before 8:30 AM Mon Nov 9.

---

# Questions

What is on your mind?

Project 3 due Fri Nov 13.

<!--
Common Day 32 questions: "Is PostgreSQL still Volcano in 2026?" (Mostly yes, with JIT for hot paths. The architecture is hybrid.) "Is the Volcano paper still relevant?" (Yes — it's been cited tens of thousands of times and remains the conceptual foundation for almost every textbook chapter on query execution.) "Why doesn't Postgres just switch to vectorized?" (Cost of rewriting 30+ years of operators; OLTP would not benefit.)
-->
