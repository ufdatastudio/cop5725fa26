---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day7 Er To Relations — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day7 Er To Relations

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

For a 1:N relationship between `Department` (1) and `Course` (N), where does the foreign key go?

A. On the Department table
B. On the Course table
C. In a new junction table
D. On either, the database decides

<!--
Answer: B. The N side gets the FK. Each course has one department, so adding dname to the course table holds the relationship in one column per course row. Putting it on the Department side would require a multi-valued column (since one department has many courses) — a 1NF violation.
-->

---

# Clicker Check — Answer

**B. On the Course table (the N side).**

Each course belongs to one department → one `dname` per course row. The FK fits naturally as a single column.

If we put it on the Department side, we'd need a multi-valued column "list of all courses in this department" — a 1NF violation and unusable as an index target.

The general rule: **embed the FK on the N side of a 1:N relationship**. Junction tables (option C) are for M:N only.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

For a weak entity `Section` owned by `Course` (cid is course PK; section_num is partial key; term distinguishes offerings), the Section table's primary key is:

A. `(section_num)`
B. `(cid, section_num)`
C. `(cid, section_num, term)`
D. `(course_id)` — same as parent

<!--
Answer: C. The PK of a weak entity is the parent's PK concatenated with the partial key — and any other distinguishing attributes. In this example, Section 001 of COP5725 in Fall 2026 is different from Section 001 in Spring 2027, so term is part of the identity.
-->

---

# Clicker Check — Answer

**C. `(cid, section_num, term)`.**

Weak entities take their identity from the parent **plus** their own distinguishing attributes:
- `cid` from the parent Course
- `section_num` is the section's local identifier
- `term` makes the same section number unique across semesters

The full key is the **composite** of all three.

Option B would identify section across terms — wrong if you offer the same section in two semesters. Option D would only let one Section exist per Course total — clearly wrong.
