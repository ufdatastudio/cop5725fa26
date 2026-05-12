# Week 1: Welcome

## Overview

Week 1 sits on a single class meeting: Friday, August 21, 2026.
The hour is purely orientation.
There is no graded work in Week 1; Project 0 is released but does not come due until the end of Week 3.

**Learning Objectives:**

- Understand the structure of the course: seven content sections, five quizzes, three exams, four projects plus a capstone
- Locate every course resource: syllabus, schedule, GitHub repo, Canvas, lecture site, papers index
- Install the development tools that the rest of the semester depends on: PostgreSQL 16, DuckDB, Python with `uv`, `psql`
- Know how to contact the instructor and how to file regrade requests
- Preview the recurring rhythms: Friday quizzes, project deadlines on Fridays, paper readings before featured weeks

---

## Day 1 (Friday, August 21): Course Introduction

### Topics (50 min)

**1. Instructor and Course Introduction (5 min)**
- Background: Dr. Christan Grant, UF CISE, data systems research
- Office hours and contact protocol (subject line includes `cop5725fa26`)

**2. Why Databases, Why Now (10 min)**
- Data has overtaken code as the engineered artifact: every team holds a query optimizer, a transaction log, a recovery story
- Two engines anchor the semester: PostgreSQL for transactional/OLTP work and DuckDB for analytical/OLAP work
- A working database engineer reads execution plans the way a systems engineer reads strace output

**3. Course Map (15 min)**
- The seven sections (Foundations → SQL → Programming → Storage/Indexing → Query Processing → Transactions → Distributed/Modern)
- Quizzes close each section
- Two midterm exams plus a cumulative final
- Four projects, peer-graded, with small-group presentations and a winner-presents-to-class round
- Featured paper readings tied to Codd 1970, recursive CTEs, C-Store, query optimization, ARIES, and DuckDB

**4. Logistics and Grading (10 min)**
- Grade breakdown table
- Late policy: grading begins on an unannounced date after the deadline; submission must precede the start of grading
- Peer grading mechanics: 30% peer, 70% instructor for projects 1-3
- Academic integrity examples relevant to SQL exercises and AI-assisted code

**5. Software Preview and Q&A (10 min)**
- Quick tour of `psql`, DuckDB CLI, and a one-line `uv run python` SQL fetch
- What Monday brings: the history of databases — how the relational model came to be the default

### Action Items (no graded work this week)
- Clone the course repository
- Read the syllabus
- Begin Project 0 setup at your own pace; it is due Friday, September 4

---

## Looking Ahead to Week 2

Three meetings:

- **Mon Aug 24** — Database History: a tour from IMS and CODASYL through System R to the present.
- **Wed Aug 26** — The Relational Model and Data Types: tuples, attributes, integrity constraints, and a survey of PostgreSQL's type system.
- **Fri Aug 28** — Relational Algebra I: selection, projection, union, difference; the algebra that compiles down to SQL.
