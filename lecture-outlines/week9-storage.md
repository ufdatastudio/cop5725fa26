# Week 9: Storage Hierarchy and Exam 1

## Overview

Section 4 opens.
This is the week the course turns from "what to query" to "how the data actually lives on the machine."
Monday introduces the storage hierarchy; Wednesday is Exam 1 (Sections 1-3); Friday returns to lecture with buffer management.

**Learning Objectives:**

- Identify the layers of the storage hierarchy and the order-of-magnitude latency between them
- Reason about page size, record layout, and the I/O cost model that drives optimization
- Explain what a buffer pool is and why every database has one
- Compare replacement policies (LRU, Clock, MRU); recognize PostgreSQL's strategy
- Read PostgreSQL `shared_buffers`, `effective_cache_size`, and the `pg_buffercache` extension

---

## Day 21 (Monday, October 12): Storage Hierarchy

### Topics (50 min)

**1. The Hierarchy (12 min)**
- CPU registers → L1/L2/L3 cache → RAM → SSD → HDD → tape
- Order-of-magnitude latency
- Why every database has the same shape

**2. Disks and SSDs (10 min)**
- Sequential vs random access
- The SSD/HDD performance gap and why it changes everything
- PostgreSQL's IO cost model parameters

**3. Pages and Records (15 min)**
- The page as the unit of I/O
- Fixed vs variable-length records
- The PostgreSQL tuple header
- Slotted page layout

**4. File Organization (8 min)**
- Heap files (the PostgreSQL default)
- Sorted files
- Hash-organized files

**5. Wrap and Exam 1 Reminder (5 min)**
- Exam 1 Wednesday
- Project 2 due Oct 23

### Action Items
- Read GMW Ch. 13.1-13.4
- Practice exam packet (handed out Wed Oct 7) — work it through
- Project 2 work continues

---

## Day 22 (Wednesday, October 14): Exam 1

**50 minutes.** Covers Sections 1-3 (relational model, algebra, ER, normalization, all SQL, Python + DuckDB).

Closed notes; calculator unnecessary. Bring a pen.

Practice packet from last Wednesday is the best preparation; office hours Tue afternoon for last-minute questions.

---

## Day 23 (Friday, October 16): Buffer Management and Memory

### Topics (50 min)

**1. Why Buffer Pools Exist (8 min)**
- Disk is slow; memory is fast; the world is bigger than memory
- The buffer pool as a cache

**2. The Mechanics (12 min)**
- Frames, page table, pin/unpin
- Dirty pages and write-back
- Reads and writes through the buffer pool

**3. Replacement Policies (15 min)**
- LRU and its lookup cost
- Clock as approximate LRU at constant cost
- MRU and the sequential-scan problem
- LRU-K and ARC (preview)

**4. PostgreSQL Specifics (10 min)**
- `shared_buffers` — the main pool
- `effective_cache_size` — the optimizer's hint
- `pg_buffercache` extension — observe what's cached
- The OS page cache as a second cache

**5. Wrap (5 min)**
- Next week: Row vs Column stores (Mon), B+ Trees (Wed, Fri)

### Action Items
- Read GMW Ch. 13.5-13.6
- Run `SELECT * FROM pg_buffercache` against your project schema

---

## Looking Ahead to Week 10

Indexing begins. Three meetings:

- **Mon Oct 19** — Row Stores vs Column Stores (C-Store paper, Stonebraker 2005)
- **Wed Oct 21** — B+ Trees I: structure, search, bulk loading
- **Fri Oct 23** — B+ Trees II: insert, delete, cost analysis; **Project 2 due**
