---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day6 Er Modeling — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day6 Er Modeling

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

A library system: each **book** can be borrowed by many **patrons** over time; each patron borrows many books. What's the cardinality of `borrows`?

A. 1:1
B. 1:N
C. N:1
D. M:N

<!--
Answer: D. Many books are borrowed by many patrons (across time). Each side has many on the other side. This is the canonical "association via history" relationship — the relationship needs its own table.
-->

---

# Clicker Check — Answer

**D. M:N (many-to-many).**

Each patron borrows many books over time; each book is borrowed by many patrons. Both sides are "many."

M:N relationships always translate to a **junction table** with foreign keys to both sides, plus any relationship attributes (here: borrow date, return date, fine).

A pure 1:N relationship — like "a department has many faculty, each faculty belongs to one department" — translates differently: the FK goes on the N side without a junction table.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

A `Section` of a course exists only when the parent `Course` exists; its identifier `section_num` is unique only **within** a course-term combination. `Section` is:

A. A strong entity
B. A weak entity
C. A relationship
D. An attribute of Course

<!--
Answer: B. Section depends on Course for its identity — its key is composite (course_id + section_num + term). That's the defining property of a weak entity. Drawn with dashed double border in Chen notation.
-->

---

# Clicker Check — Answer

**B. A weak entity.**

Two signs of a weak entity:

1. **Identity depends on another entity** — `Section` alone doesn't identify itself; you need the parent `Course` to make sense of `section_num`.
2. **Composite key** — the primary key includes the parent's key (course_id + section_num + term).

On Friday's translation lecture we'll see weak entities become tables with composite primary keys, where part of the key is a foreign key to the parent.
