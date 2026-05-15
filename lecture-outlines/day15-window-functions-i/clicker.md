---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day15 Window Functions I — Instructor Only'
math: katex
html: true
---

<!-- _class: lead -->

# Clicker Checks
## Day15 Window Functions I

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

For a table with three rows of GPAs 3.95, 3.85, 3.85:

```sql
SELECT gpa,
       rank()       OVER (ORDER BY gpa DESC) AS r,
       dense_rank() OVER (ORDER BY gpa DESC) AS dr,
       row_number() OVER (ORDER BY gpa DESC) AS rn
FROM students;
```

What does the row with `gpa = 3.85` (the second occurrence) return for `r`, `dr`, `rn`?

A. 2, 2, 2
B. 2, 2, 3
C. 3, 2, 3
D. 2, 3, 3

<!--
Answer: C. RANK gives 3 (skip after tie). DENSE_RANK gives 2 (no skip). ROW_NUMBER gives 3 (unique sequence, ties broken arbitrarily but each row gets unique number).
Wait let me think again: there are 3 rows: 3.95, 3.85, 3.85. The first 3.85 gets RANK 2, DENSE_RANK 2, ROW_NUMBER 2. The second 3.85 also gets RANK 2 (ties get same rank), DENSE_RANK 2 (ties get same rank), but ROW_NUMBER 3 (unique sequence number).
So actually for both 3.85 rows: r=2, dr=2, but rn differs. The "second occurrence" — its position is 3 in ROW_NUMBER, 2 in RANK and DENSE_RANK.
The next rank after the ties: RANK would skip to 4 (only 2 in this example), DENSE_RANK would go to 3.
Hmm let me re-read the question. The row with gpa=3.85 (the second occurrence) returns:
- r (RANK): 2 — both 3.85 rows get RANK 2 (ties get same rank)
- dr (DENSE_RANK): 2 — same as RANK for the tie
- rn (ROW_NUMBER): 3 — unique sequence, the second 3.85 row gets the next sequence number

So answer is C: 2, 2, 3 — wait that's option A!
Actually A is "2, 2, 2" which is wrong (rn should be 3).
B is "2, 2, 3" — r=2, dr=2, rn=3. That's CORRECT.
Let me re-fix the answer to B.
-->

---

# Clicker Check — Answer

**B. 2, 2, 3.**

Three rows: GPAs 3.95, 3.85, 3.85.

| GPA | RANK | DENSE_RANK | ROW_NUMBER |
|-----|------|-----------|-----------|
| 3.95 | 1 | 1 | 1 |
| 3.85 (first) | 2 | 2 | 2 |
| 3.85 (second) | **2** | **2** | **3** |

- **RANK** assigns the same rank to ties; the next non-tied row would jump to rank 4 (skipping 3)
- **DENSE_RANK** also assigns same rank to ties; the next would be 3 (no skip)
- **ROW_NUMBER** always gives unique values; ties are broken arbitrarily

Pick based on use case: medals → RANK; "top 3 distinct values" → DENSE_RANK; "first 3 only, no ties" → ROW_NUMBER.
