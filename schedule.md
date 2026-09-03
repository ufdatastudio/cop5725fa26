---
layout: default
---

# Course Schedule - Fall 2026

For an at-a-glance month grid with all topics, exams, quizzes, and project milestones color coded, see the [Visual Calendar](calendar).

## Key Dates

- **Classes Begin:** Thursday, August 20, 2026 (first MWF meeting: Friday, August 21)
- **Labor Day (no class):** Monday, September 7, 2026
- **Homecoming (no class):** Thursday-Friday, October 9-10, 2026
- **Veterans Day (no class):** Wednesday, November 11, 2026
- **Thanksgiving Break (no class):** Monday-Saturday, November 23-28, 2026
- **Drop/Withdrawal Deadline:** Monday, November 16, 2026
- **Classes End:** Wednesday, December 2, 2026
- **Reading Days:** Thursday-Friday, December 3-4, 2026
- **Finals Week:** Saturday-Friday, December 5-11, 2026

A total of **39 class meetings** for the semester.

---

## Course Structure

The course is divided into seven content sections.
Five sections close with a short in-class quiz; Sections 3 and 7 close with Exam 1 and the Final Exam instead.
Each quiz asks questions about the section just completed, and the lowest quiz score is dropped.
Two midterm exams and one final exam mark major checkpoints.
There are no in-class review periods; a practice exam with worked solutions is published one week before each exam.
Four individual projects plus a final capstone are spaced two to three weeks apart, each peer-graded with small-group presentations.

| # | Section | Weeks | Classes | Closes |
|---|---------|-------|---------|--------|
| 1 | Foundations: Relational Model, Algebra, Design | 1-4 | 9 | Fri, Sep 11 |
| 2 | SQL Mastery: Basic to Advanced | 5-7 | 9 | Fri, Oct 2 |
| 3 | Programming and Tools: Python and DuckDB | 8 | 2 | Exam 1 (Oct 14) |
| 4 | Storage and Indexing | 9-11 | 7 | Fri, Oct 30 |
| 5 | Query Processing and Optimization | 12-13 | 6 | Fri, Nov 13 |
| 6 | Transactions, Concurrency, Recovery | 14, 16 | 5 | Wed, Dec 2 |
| 7 | Distributed and Modern Systems | 16 | 1 | Final Exam |

---

## Exams

| Exam | Date | Coverage | Weight |
|------|------|----------|--------|
| Exam 1 | Wed, Oct 14 | Sections 1-3 (Foundations, SQL, Programming) | 15% |
| Exam 2 | Wed, Nov 18 | Sections 4-5 (Storage, Indexing, Query Processing) | 15% |
| Exam 3 (Final) | Fri, Dec 11, 10:00 AM-12:00 PM | Cumulative, weighted toward Sections 6-7 | 20% |

---

## Quizzes

Five short in-class quizzes discuss important concepts from the lectures.
Each quiz asks questions about the section just completed.
The lowest quiz score is dropped; the best four count toward the 15% quiz weight.

| Quiz | Date | Covers |
|------|------|--------|
| Quiz 1 | Fri, Sep 11 | §1 Foundations |
| Quiz 2 | Fri, Oct 2 | §2 SQL Mastery |
| Quiz 3 | Fri, Oct 30 | §4 Storage and Indexing |
| Quiz 4 | Fri, Nov 13 | §5 Query Processing |
| Quiz 5 | Wed, Dec 2 | §6 Transactions |

See [Assignments and Quizzes](assignments) for details.

---

## Projects

Projects mirror real industry tasks.
Each student creates a **private** GitHub repo on their own account named `cop5725fa26-project` (adding `cegme` and `rkc8626` as Admins), and selects a dataset family by the first letter of their last name, picking a slice within it.
Projects build on the same dataset across the semester: Project 0 loads it; Project 1 normalizes and queries it; Project 2 runs advanced analytics; Project 3 tunes performance; the Final Project ships a complete artifact.
Project weights increase progressively: Project 1 is smallest (4%), Project 3 the largest before the capstone (10%), and the Final Project the largest overall (15%).
After each deadline, students present in small breakout groups; the highest-scored from each group presents to the full class.

| Project | Weight | Released | Due | Presentations | Industry analog |
|---------|--------|----------|-----|---------------|-----------------|
| [Project 0](projects/project0) | P/F | Fri, Aug 21 | Fri, Sep 4 | none (setup only) | "Onboarding ticket": tools + select your dataset |
| [Project 1](projects/project1) | 4% | Wed, Sep 2 | Fri, Sep 25 | Mon Sep 28 / Wed Sep 30 | "Load this new source": schema + ETL + business queries |
| Project 2 | 6% | Mon, Sep 21 | Fri, Oct 23 | Mon Oct 26 / Wed Oct 28 | "Write the metrics": advanced SQL analytics |
| Project 3 | 10% | Mon, Oct 19 | Fri, Nov 13 | Mon Nov 16 / Fri Nov 20 | "This dashboard is slow": indexing + tuning report |
| Final Project | 15% | Mon, Nov 16 | Wed, Dec 9 | Fri Dec 11 (final exam block) | Ship a real artifact (report / API / dashboard / pipeline) |

See [Projects](projects) for deliverables; the full specification for each project is posted when it is released.

---

## Featured Readings (SIGMOD / VLDB / CIDR)

Five paper discussions are spaced through the semester.
Each comes with a short reading guide and a one-page written response (graded as part of the relevant quiz).

| Week | Paper |
|------|-------|
| 3 | Codd, "A Relational Model of Data for Large Shared Data Banks," CACM 1970 |
| 6 | Hirn and Grust, "A Fix for the Fixation on Fixpoints," CIDR 2023 (recursive CTEs) |
| 10 | Stonebraker et al., "C-Store: A Column-oriented DBMS," VLDB 2005 |
| 13 | Leis et al., "How Good Are Query Optimizers, Really?" PVLDB 2015 |
| 14 | Mohan et al., "ARIES: A Transaction Recovery Method..." ACM TODS 1992 |
| 16 | Raasveldt and Mühleisen, "DuckDB: An Embeddable Analytical Database," SIGMOD 2019 |

A complete reading list, including supplementary papers tied to each lecture, is maintained in [LECTURE_READINGS](LECTURE_READINGS).

---

# Weekly Schedule

---

## Week 1: Welcome (Aug 17-21)

| Day | Date | Topic | Activity |
|-----|------|-------|----------|
| Fri | Aug 21 | Course Introduction | Syllabus, expectations, repo tour, software preview |

**Note:** Week 1 contains no graded work. Project 0 is released Friday and is purely a setup pass/fail check due in Week 3.

---

## Week 2: From History to the Relational Model (Aug 24-28)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Aug 24 | History of Databases | Codd 1970 (assigned), Textbook Ch. 1 |
| Wed | Aug 26 | Relational Model and Data Types | Textbook Ch. 2.1-2.3 |
| Fri | Aug 28 | Relational Algebra I: Selection, Projection, Sets | Textbook Ch. 2.4 |

**Discussion:** PostgreSQL data type families (numeric, text, date/time, JSON, arrays, geometric, range) and how each fits the relational model.

---

## Week 3: Design Theory I (Aug 31 - Sep 4)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Aug 31 | Relational Algebra II: Joins, Division, Extended RA | Textbook Ch. 2.4-2.5 |
| Wed | Sep 2 | Entity-Relationship Modeling | Textbook Ch. 4.1-4.5 |
| Fri | Sep 4 | ER-to-Relations Translation | Textbook Ch. 4.5-4.6 |

**Due:** Project 0 (setup, P/F) by 11:59 PM Fri Sep 4
**Assigned:** Project 1 (released Wed Sep 2)

---

## Week 4: Design Theory II (Sep 7-11)

*Monday Sep 7 - Labor Day, no class*

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Wed | Sep 9 | Functional Dependencies, Closure, Keys | Textbook Ch. 3.1-3.3 |
| Fri | Sep 11 | Normalization (1NF, 2NF, 3NF, BCNF) | Textbook Ch. 3.4-3.7 |

---

## Week 5: SQL Fundamentals (Sep 14-18)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Sep 14 | SQL DDL and SELECT Basics | Textbook Ch. 6.1-6.2 |
| Wed | Sep 16 | SQL Joins: Inner, Outer, Semi, Anti | Textbook Ch. 6.3 |
| Fri | Sep 18 | Aggregation, GROUP BY, HAVING | Textbook Ch. 6.4 |

---

## Week 6: Advanced SQL I (Sep 21-25)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Sep 21 | Subqueries: Nested, Correlated, EXISTS, IN | Textbook Ch. 6.3.6, 10.2 |
| Wed | Sep 23 | Common Table Expressions (WITH) | PostgreSQL docs Ch. 7.8 |
| Fri | Sep 25 | Window Functions I: OVER, PARTITION BY | PostgreSQL docs Ch. 3.5 |

**Due:** Project 1 (Schema + SQL) by 11:59 PM Fri Sep 25
**Assigned:** Project 2 (released Mon Sep 21)

---

## Week 7: Advanced SQL II (Sep 28 - Oct 2)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Sep 28 | Window Functions II: Frames, Ranking, LAG/LEAD | PostgreSQL docs Ch. 9.22 |
| Wed | Sep 30 | Recursive Queries (WITH RECURSIVE) | Textbook Ch. 10.2; Hirn and Grust 2023 |
| Fri | Oct 2 | Views, Constraints, Triggers | Textbook Ch. 7-8 |

**Project 1 presentations:** Mon Sep 28 (group breakouts), Wed Sep 30 (winners to class)

---

## Week 8: Programming and Tools (Oct 5-9)

*Friday Oct 9 - Homecoming, no class*

| Day | Date | Topic | Reading |
|-----|------|-------|---------|
| Mon | Oct 5 | Python + psycopg + pandas for SQL Results | psycopg docs |
| Wed | Oct 7 | DuckDB + Notebooks + Visualization | DuckDB docs |

---

## Week 9: Storage Introduction + Exam 1 (Oct 12-16)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Oct 12 | Storage Hierarchy: Disks, SSDs, Pages, Records | Textbook Ch. 13.1-13.4 |
| Wed | Oct 14 | **Exam 1** (covers Weeks 1-8) | — |
| Fri | Oct 16 | Buffer Management and Memory | Textbook Ch. 13.5-13.6 |

---

## Week 10: Column Stores + B+ Trees (Oct 19-23)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Oct 19 | Row Stores vs Column Stores | Textbook Ch. 13.7-13.8; Stonebraker C-Store |
| Wed | Oct 21 | B+ Trees I: Structure, Search, Bulk Loading | Textbook Ch. 14.1-14.2 |
| Fri | Oct 23 | B+ Trees II: Insert, Delete, Cost Analysis | Textbook Ch. 14.2-14.3 |

**Due:** Project 2 (Advanced SQL) by 11:59 PM Fri Oct 23
**Assigned:** Project 3 (released Mon Oct 19)

---

## Week 11: Indexing II + Sorting (Oct 26-30)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Oct 26 | Hash Indexes: Static, Extendible, Linear | Textbook Ch. 14.4 |
| Wed | Oct 28 | PostgreSQL Index Types: GiST, GIN, BRIN, Partial | PostgreSQL docs Ch. 11 |
| Fri | Oct 30 | External Sorting | Textbook Ch. 15.4 |

**Project 2 presentations:** Mon Oct 26 (group breakouts), Wed Oct 28 (winners)

---

## Week 12: Join Algorithms and Execution (Nov 2-6)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Nov 2 | Joins I: Nested Loop, Block NL, Index NL | Textbook Ch. 15.2-15.3 |
| Wed | Nov 4 | Joins II: Sort-Merge, Hash, Grace Hash | Textbook Ch. 15.4-15.5 |
| Fri | Nov 6 | Iterator (Volcano) Model and Pipelining | Textbook Ch. 15.1; Graefe 1994 |

---

## Week 13: Optimization (Nov 9-13)

*Wednesday Nov 11 - Veterans Day, no class*

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Nov 9 | Vectorized Execution; Optimization I (Equivalence) | Textbook Ch. 16.1-16.2; Boncz MonetDB/X100 |
| Fri | Nov 13 | Optimization II: Cost Estimation, System R | Textbook Ch. 16.3-16.5; Leis 2015 |

**Due:** Project 3 (Indexing + Query Plans) by 11:59 PM Fri Nov 13
**Assigned:** Final Project (released Mon Nov 16)

---

## Week 14: Transactions + Exam 2 (Nov 16-20)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Nov 16 | Transactions and ACID; Serializability | Textbook Ch. 18.1-18.3 |
| Wed | Nov 18 | **Exam 2** (covers Weeks 9-13) | — |
| Fri | Nov 20 | Two-Phase Locking; Deadlock Handling | Textbook Ch. 18.4-18.5 |

**Project 3 presentations:** Mon Nov 16 (group breakouts), Fri Nov 20 (winners)

---

## Week 15: Thanksgiving Break (Nov 23-28)

*No classes.*

---

## Week 16: Concurrency, Recovery, Modern (Nov 30 - Dec 2)

| Day | Date | Topic | Reading |
|-----|------|-------|---------------|
| Mon | Nov 30 | MVCC, Snapshot Isolation, Timestamps | Textbook Ch. 18.7-18.9 |
| Wed | Dec 2 | Recovery (WAL, ARIES) + Distributed + Modern  | Textbook Ch. 17, 20-22; Mohan ARIES; DuckDB paper |

*Thursday Dec 3 - Friday Dec 4: Reading days, no class*

---

## Finals Week (Dec 5-11)

- **Final Exam (Exam 3)**: Cumulative, with emphasis on transactions, concurrency, recovery, and distributed databases. Friday, Dec 11, 10:00 AM-12:00 PM in MALA 1000.
- **Final Project due** Wed Dec 9 by 11:59 PM; brief in-person presentations during the final exam block on Fri Dec 11.

---

## Notes on Rubrics and Grading

Each graded artifact has a public rubric and an automated grader.

- Rubrics live in [`rubrics/`](rubrics/) and are released with each assignment.
- Automated graders live in [`scripts/grade_<assignment>.py`](scripts/) and are run by the TA after the deadline.
- Peer grading for projects uses a rubric subset; instructor grade is the final score with peer review weighted 30%.

---

[back](index)
