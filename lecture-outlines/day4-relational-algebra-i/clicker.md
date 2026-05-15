---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day4 Relational Algebra I — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day4 Relational Algebra I

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Given `R = {(1, 'a'), (2, 'b'), (3, 'c')}`, what is the result of $\sigma_{x > 5}(R)$?

A. The empty set ∅
B. The original R unchanged
C. An error — no tuples match
D. NULL

<!--
Allow 30 seconds. The answer is A. A selection with no matching tuples returns an empty relation — not an error, not NULL. Relations can have zero tuples. This is a common misconception.
-->

---

# Clicker Check — Answer

**A. The empty set ∅.**

A selection that matches no tuples returns an **empty relation** — still a valid relation, just with zero tuples.

Key idea: relations are sets. The empty set is a perfectly valid set. SQL queries that return no rows are not errors.

Students who pick C (error) are thinking imperatively; selection is declarative — it filters what's there, even if that's nothing.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Given `student = {(1, 'Ada', 'CS'), (2, 'Bob', 'EE'), (3, 'Chia', 'CS')}`, what is the result of $\pi_{major}(student)$?

A. `{('CS'), ('EE'), ('CS')}` — three tuples
B. `{('CS'), ('EE')}` — two tuples
C. `{('CS', 'CS', 'EE')}` — one tuple with all three values
D. A multiset with CS appearing twice

<!--
Answer: B. Relational algebra is set-based; duplicates collapse. CS appears twice in the input but only once in the output. This is the key difference between π in algebra and SELECT in SQL (which preserves duplicates without DISTINCT).
-->

---

# Clicker Check — Answer

**B. `{('CS'), ('EE')}` — two tuples.**

Relational algebra treats relations as **sets**. After projection, the duplicate `CS` collapses to one tuple.

Compare with SQL:

```sql
SELECT major FROM student;          -- returns CS, EE, CS (three rows, bag semantics)
SELECT DISTINCT major FROM student; -- returns CS, EE (two rows, set semantics)
```

This algebra/SQL distinction matters when you reason about query plans.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

`R` has 100 tuples; `S` has 50 tuples. How many tuples does $R \times S$ have?

A. 100 + 50 = 150
B. max(100, 50) = 100
C. 100 × 50 = 5,000
D. Cannot be computed without knowing the schemas

<!--
Answer: C. Cross product produces every pair, so |R × S| = |R| × |S| = 5000. This is also why × alone is rarely the right answer in real queries; the cardinality grows multiplicatively.
-->

---

# Clicker Check — Answer

**C. 100 × 50 = 5,000.**

Cross product pairs **every** tuple in R with **every** tuple in S. The cardinality is the product.

This is exactly why × alone is rarely a useful operator: the intermediate results explode. Two 1-million-row tables would produce $10^{12}$ tuples — a trillion intermediate rows.

A join filters the cross product. We see the formal join definition Monday.
