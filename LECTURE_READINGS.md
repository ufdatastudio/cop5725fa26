---
layout: default
---

# Lecture Readings - COP 5725 Database Management Systems Fall 2026

Each lecture has a primary chapter reading from Garcia-Molina, Ullman, Widom *Database Systems: The Complete Book* (referred to below as **GMW**).
Five featured paper readings throughout the semester anchor the conceptual material in primary research literature.
Supplementary papers expand each topic for graduate-level depth.

A consolidated paper index with local PDFs lives at [ufdatastudio.com/cop5725fa26/papers](https://ufdatastudio.com/cop5725fa26/papers).
Featured paper entries below include a direct PDF link.

---

## Section 1: Foundations (Weeks 1-4)

### Week 2: History and the Relational Model

- **Primary:** GMW Ch. 1 (Worlds of Database Systems), Ch. 2.1-2.3 (Relational Model)
- **Featured paper:** Codd, E.F. "A Relational Model of Data for Large Shared Data Banks." Communications of the ACM 13(6), 1970. [PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/codd1970.pdf) · [DOI](https://dl.acm.org/doi/10.1145/362384.362685)
- **Supplementary:**
  - Chamberlin, D. and Astrahan, M. et al. "A History and Evaluation of System R." CACM 24(10), 1981.
  - PostgreSQL data types documentation (numeric, text, date/time, JSON, arrays, geometric, range).

### Week 3: Relational Algebra and ER Modeling

- **Primary:** GMW Ch. 2.4-2.5 (Algebra), Ch. 4.1-4.6 (ER)
- **Supplementary:**
  - Chen, P. "The Entity-Relationship Model — Toward a Unified View of Data." ACM TODS 1(1), 1976.

### Week 4: Functional Dependencies and Normalization

- **Primary:** GMW Ch. 3 (Design Theory)
- **Supplementary:**
  - Kent, W. "A Simple Guide to Five Normal Forms in Relational Database Theory." CACM 26(2), 1983.
  - Codd, E.F. "Further Normalization of the Data Base Relational Model." Courant Symposia, 1972.

---

## Section 2: SQL Mastery (Weeks 5-7)

### Week 5: SQL Fundamentals

- **Primary:** GMW Ch. 6.1-6.4
- **Supplementary:** PostgreSQL docs Chapter 7 (Queries), Chapter 9 (Functions and Operators).

### Week 6: Advanced SQL I (Subqueries, CTEs, Window Basics)

- **Primary:** GMW Ch. 6.3.6, 10.2; PostgreSQL docs Ch. 7.8, 3.5
- **Featured paper:** Hirn, D. and Grust, T. "A Fix for the Fixation on Fixpoints." CIDR 2023. [PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/hirn2023.pdf)

### Week 7: Advanced SQL II (Window Frames, Recursion, Views)

- **Primary:** PostgreSQL docs Ch. 9.22; GMW Ch. 7-8
- **Supplementary:**
  - Eisenberg, A. et al. "SQL:2003 Has Been Published." SIGMOD Record 33(1), 2004 (window functions, MERGE).
  - Mumick, I.S., Pirahesh, H., Ramakrishnan, R. "The Magic of Duplicates and Aggregates." VLDB 1990.

---

## Section 3: Programming and Tools (Week 8)

- **Primary:** psycopg documentation, DuckDB documentation, pandas DataFrame interop with DuckDB.
- **Supplementary:**
  - Raasveldt, M. and Mühleisen, H. "DuckDB: An Embeddable Analytical Database." SIGMOD 2019 (preview before full reading in Week 16).

---

## Section 4: Storage and Indexing (Weeks 9-11)

### Week 9: Storage Hierarchy

- **Primary:** GMW Ch. 13.1-13.4
- **Supplementary:**
  - Hellerstein, J.M., Stonebraker, M., Hamilton, J. "Architecture of a Database System." Foundations and Trends in Databases 1(2), 2007 (Red Book Ch. 1).

### Week 10: Row vs Column Stores and B+ Trees

- **Primary:** GMW Ch. 13.5-13.8, 14.1-14.3
- **Featured paper:** Stonebraker, M. et al. "C-Store: A Column-oriented DBMS." VLDB 2005. [PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/stonebraker2005.pdf)
- **Supplementary:**
  - Boncz, P., Zukowski, M., Nes, N. "MonetDB/X100: Hyper-Pipelining Query Execution." CIDR 2005.
  - Comer, D. "The Ubiquitous B-Tree." ACM Computing Surveys 11(2), 1979.

### Week 11: Hash Indexes, PostgreSQL Indexes, External Sorting

- **Primary:** GMW Ch. 14.4, 15.4; PostgreSQL docs Ch. 11
- **Supplementary:**
  - O'Neil, P. et al. "The Log-Structured Merge-Tree (LSM-Tree)." Acta Informatica 33, 1996.
  - Leis, V., Kemper, A., Neumann, T. "The Adaptive Radix Tree." ICDE 2013.
  - Kraska, T. et al. "The Case for Learned Index Structures." SIGMOD 2018.

---

## Section 5: Query Processing and Optimization (Weeks 12-13)

### Week 12: Join Algorithms and Iterator Model

- **Primary:** GMW Ch. 15.1-15.5
- **Supplementary:**
  - Graefe, G. "Volcano: An Extensible and Parallel Query Evaluation System." IEEE TKDE 6(1), 1994.

### Week 13: Vectorized Execution and Optimization

- **Primary:** GMW Ch. 16
- **Featured paper:** Leis, V. et al. "How Good Are Query Optimizers, Really?" PVLDB 9(3), 2015. [PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/leis2015.pdf)
- **Supplementary:**
  - Selinger, P. et al. "Access Path Selection in a Relational Database Management System." SIGMOD 1979.
  - Neumann, T. "Efficiently Compiling Efficient Query Plans for Modern Hardware." PVLDB 4(9), 2011.

---

## Section 6: Transactions, Concurrency, Recovery (Weeks 14, 16)

### Week 14: Transactions and Two-Phase Locking

- **Primary:** GMW Ch. 18.1-18.5
- **Supplementary:**
  - Bernstein, P.A. and Goodman, N. "Concurrency Control in Distributed Database Systems." ACM Computing Surveys 13(2), 1981.

### Week 16: MVCC, Recovery, Distributed and Modern

- **Primary:** GMW Ch. 17, 18.7-18.9, 20-22
- **Featured paper (Recovery):** Mohan, C. et al. "ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking..." ACM TODS 17(1), 1992. [PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/mohan1992.pdf)
- **Featured paper (Modern):** Raasveldt, M. and Mühleisen, H. "DuckDB: An Embeddable Analytical Database." SIGMOD 2019. [PDF](https://ufdatastudio.com/cop5725fa26/papers/pdfs/raasveldt2019.pdf)
- **Supplementary:**
  - Diaconu, C. et al. "Hekaton: SQL Server's Memory-Optimized OLTP Engine." SIGMOD 2013 (MVCC).
  - Bailis, P. et al. "Highly Available Transactions: Virtues and Limitations." PVLDB 7(3), 2014.
  - Corbett, J.C. et al. "Spanner: Google's Globally-Distributed Database." OSDI 2012.

---

## Curated External Resources

- **Red Book** (Bailis, Hellerstein, Stonebraker, 5th ed.): http://www.redbook.io/
- **CMU 15-445 lectures** (Pavlo, YouTube): https://15445.courses.cs.cmu.edu/
- **DuckDB Internals**: https://duckdb.org/docs/internals/overview
- **PostgreSQL Source Reading Guide**: https://wiki.postgresql.org/wiki/Developer_FAQ

---

[back](index)
