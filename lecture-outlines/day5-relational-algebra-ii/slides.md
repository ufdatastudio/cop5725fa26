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
---

<!-- _class: lead -->

# Day 5: Relational Algebra II

**COP 5725 - Database Management Systems**
Monday, August 31, 2026

Joins, division, and the operators every real query uses

<!--
Open by recapping Friday: six operators (σ, π, ∪, ∩, −, ×) plus ρ.
Ask the class which operator they expect to add today. The answer "join" almost always comes back; use that to motivate why join deserves to be first-class even though it is technically derivable.
Budget ~50 min total. Joins are 20 min; the rest is paced to leave 3-5 min at the end for the handout walkthrough.
-->

---

# Where We Are in the Algebra

<div class="columns-left-wide">
<div>

Friday gave you the building blocks.
Today extends them so a single expression can answer the kind of question you would type into a search box.

Three additions:

1. **Joins** — combine relations by matching values
2. **Division** — find "all of" relationships
3. **Extended operators** — aggregation, sort, computed projection

</div>
<div>

```mermaid
graph TD
  Core["Core Algebra<br/>σ π ∪ ∩ − × ρ"] --> Joins["Joins<br/>⋈θ ⋈ ⟕ ⟖ ⟗"]
  Core --> Div["Division ÷"]
  Core --> Ext["Extended<br/>γ τ δ π̃"]
  Joins --> SQL["SQL"]
  Div --> SQL
  Ext --> SQL
```

</div>
</div>

<!--
The mermaid graph emphasizes that everything we add today is layered on the seven operators from Friday. Joins and extended operators in particular are conveniences — closure and composition come from the core seven.
-->

---

# Today's Roadmap

1. Joins as cross product + selection
2. Outer joins
3. Division ÷
4. Extended algebra: γ, τ, δ, generalized π
5. SQL ↔ algebra round-trip

<!--
This is the densest algebra day. Pace check at slide 12 (after outer joins). If we are behind, abbreviate division to the one motivating example and skip the formal definition until students see it on the handout.
-->

---

<!-- _class: lead -->

# Part 1: Joins

---

# Joins Are σ Around ×

Every join is a cross product followed by a selection on matching attributes.

$$R \bowtie_\theta S \;=\; \sigma_\theta(R \times S)$$

The optimizer treats this as a single operator because it can execute the combined form in one pass through memory.
For the algebra we treat it as one operator because it shows up everywhere.

<!--
Stress that the optimizer's distinction here is not pedantic. A naive cross product blows up to |R| * |S| tuples. A join algorithm (hash, sort-merge, nested loop with predicate pushdown) avoids materializing that intermediate. We will see those algorithms in Section 5, Week 12.
-->

---

# Three Joins, One Pattern

<div class="columns-3">
<div>

### Theta Join $\bowtie_\theta$

Predicate is any comparison.

$$R \bowtie_{R.x < S.y} S$$

Used when you want a range or inequality.

</div>
<div>

### Equi-Join

Theta join restricted to equality.

$$R \bowtie_{R.id = S.id} S$$

The everyday case. Most indexes target this.

</div>
<div>

### Natural Join $\bowtie$

Equi-join on every common attribute name, with duplicates removed.

$$R \bowtie S$$

Convenient. Dangerous if a column name overlaps by accident.

</div>
</div>

<!--
Natural join is elegant on paper but a footgun in production: rename one column and your join silently changes. I recommend students write explicit equi-joins in SQL even when the natural form is shorter.
-->

---

# Natural Join: Worked Example

<div class="columns">
<div>

**student**

| sid | name | major |
|-----|------|-------|
| 1 | Ada | CS |
| 2 | Bob | EE |
| 3 | Chia | CS |

**enrollment**

| sid | course |
|-----|--------|
| 1 | COP5725 |
| 1 | COT5405 |
| 3 | COP5725 |

</div>
<div>

**student ⋈ enrollment**

(joins on `sid`)

| sid | name | major | course |
|-----|------|-------|--------|
| 1 | Ada | CS | COP5725 |
| 1 | Ada | CS | COT5405 |
| 3 | Chia | CS | COP5725 |

Bob disappears: he has no enrollment row, so he matches nothing.

</div>
</div>

<!--
Walk row-by-row through the join for Ada to make the matching concrete. The fact that Bob disappears motivates the next slide on outer joins.
-->

---

<!-- _class: lead -->

# Part 2: Outer Joins

---

# The Three Outer Joins

When a row from one side has no match on the other, an inner join drops it.
An outer join keeps it, filling the missing attributes with NULL.

```mermaid
graph LR
  L["Left Outer ⟕<br/>keep all of LEFT"] --> A((A))
  F["Full Outer ⟗<br/>keep both sides"] --> A
  R["Right Outer ⟖<br/>keep all of RIGHT"] --> A
  A["NULLs fill unmatched attrs"]
```

<!--
Outer joins are how you find what is missing. The classic interview question "find students who have never enrolled" is just student ⟕ enrollment with WHERE enrollment.sid IS NULL. The NULL filter on the right side is the giveaway.
-->

---

# Left Outer Join: Worked Example

<div class="columns">
<div>

**student ⟕ enrollment**

| sid | name | major | course |
|-----|------|-------|--------|
| 1 | Ada | CS | COP5725 |
| 1 | Ada | CS | COT5405 |
| 2 | Bob | EE | NULL |
| 3 | Chia | CS | COP5725 |

</div>
<div>

Bob comes back because he is in the left relation.

His `course` is NULL because there is no enrollment row for him.

</div>
</div>

The SQL equivalent:

```sql
SELECT s.*, e.course
FROM student s LEFT OUTER JOIN enrollment e USING (sid);
```

<!--
LEFT vs LEFT OUTER are interchangeable in SQL; the OUTER keyword is optional but worth keeping for clarity. Same for RIGHT and FULL.
-->

---

# Outer Join Replaces Difference

> Find students who have never enrolled.

<div class="columns">
<div>

**With difference**

$$\pi_{sid}(student) - \pi_{sid}(enrollment)$$

Then join back to student to recover names.

</div>
<div>

**With outer join**

$$\pi_{name}(\sigma_{course\,IS\,NULL}(student \;⟕\; enrollment))$$

Often faster: one scan, one merge, no second pass.

</div>
</div>

<!--
The optimizer can usually transform one into the other. This is one of the classic rewrites discussed in the Selinger 1979 paper we will read in Section 5. Both are legal answers on quizzes.
-->

---

<!-- _class: lead -->

# Part 3: Division ÷

---

# When Division Shows Up

The English giveaway: **"all"**, **"every"**, **"each"**.

<div class="columns-3">
<div>

> Suppliers who supply *every* part

</div>
<div>

> Students who took *all* required courses

</div>
<div>

> Customers who bought *every* product in a category

</div>
</div>

Division is the algebra operator for these. SQL has no `DIVIDE` keyword — you spell it out with `NOT EXISTS` or `GROUP BY ... HAVING count(*) = ...`.

---

# Division Defined

Given $R(A, B)$ and $S(B)$:

$$R \div S = \{\, t : t \in \pi_A(R) \,\land\, \forall s \in S,\, (t, s) \in R \,\}$$

In words: $R \div S$ returns the $A$-values from $R$ that are paired with **every** $B$-value in $S$.

<!--
The formal definition is the hardest one of the day. Encourage students to translate this into English on the spot: "for an A-value to qualify, it must appear in R alongside every B-value in S." Then walk through the example.
-->

---

# Division: Worked Example

<div class="columns-3">
<div>

**enrollment** (R)

| sid | course |
|-----|--------|
| 1 | COP5725 |
| 1 | COT5405 |
| 1 | CIS4301 |
| 2 | COP5725 |
| 3 | COP5725 |
| 3 | COT5405 |

</div>
<div>

**required** (S)

| course |
|--------|
| COP5725 |
| COT5405 |

</div>
<div>

**enrollment ÷ required**

| sid |
|-----|
| 1 |
| 3 |

Student 2 took only one of the required courses, so they do not qualify.

</div>
</div>

<!--
Take 2 minutes here. Have students explain in their own words why student 2 was filtered out. The mistake to avoid: treating division as set intersection. It is not — it answers a quantifier-over-set question.
-->

---

# Division in SQL

```sql
-- Students who took every required course
SELECT e.sid
FROM enrollment e, required r
WHERE e.course = r.course
GROUP BY e.sid
HAVING count(DISTINCT e.course) = (SELECT count(*) FROM required);
```

Or with `NOT EXISTS`:

```sql
SELECT DISTINCT e.sid FROM enrollment e
WHERE NOT EXISTS (
  SELECT 1 FROM required r
  WHERE NOT EXISTS (
    SELECT 1 FROM enrollment e2
    WHERE e2.sid = e.sid AND e2.course = r.course
  )
);
```

<!--
The double-NOT-EXISTS form is the textbook translation but very hard to read. In practice the GROUP BY ... HAVING count form is preferred. Both produce the same plan in PostgreSQL after rewrite.
-->

---

<!-- _class: lead -->

# Part 4: Extended Algebra

---

# Why "Extended"

The pure algebra (σ, π, ∪, ∩, −, ×, ρ, ⋈, ÷) cannot express:

- "Average salary per department"
- "Top 5 students by GPA"
- "All distinct majors"
- "name as `Last, First`"

We extend the algebra with three operators plus a generalized projection.

```mermaid
graph LR
  P[Pure Algebra] --> E[Extended Algebra]
  E --> G["γ — Aggregation"]
  E --> T["τ — Sort"]
  E --> D["δ — Deduplicate"]
  E --> PI["π̃ — Generalized projection"]
```

<!--
The point of this slide is that SQL's expressiveness is exactly the extended algebra. Optimizers translate SQL into trees of these operators. By Week 12 students will read plans whose nodes are labeled with these symbols.
-->

---

# Aggregation γ

$$\gamma_{G, A_1, A_2, ...; F_1(B_1), F_2(B_2), ...}(R)$$

- $G, A_1, ...$ are grouping attributes
- $F_i(B_i)$ are aggregate functions over attribute $B_i$

Aggregate functions: `count`, `sum`, `avg`, `min`, `max`.

<div class="columns">
<div>

### Algebra

$$\gamma_{major; \text{avg}(gpa)}(student)$$

</div>
<div>

### SQL

```sql
SELECT major, AVG(gpa)
FROM student
GROUP BY major;
```

</div>
</div>

---

# Sort τ

$$\tau_{A_1, A_2, ...}(R)$$

Returns the tuples of $R$ in the order given by the listed attributes.

Sort breaks set semantics — the result is technically a *list*, not a relation. This is why SQL allows `ORDER BY` only on the **outermost** query.

<div class="columns">
<div>

### Algebra

$$\tau_{gpa\,desc}(student)$$

</div>
<div>

### SQL

```sql
SELECT * FROM student
ORDER BY gpa DESC;
```

</div>
</div>

<!--
Brief note: subqueries cannot have ORDER BY in standard SQL (PostgreSQL allows it as an extension, but the order is not preserved through downstream operators). This is the algebra reason why.
-->

---

# Duplicate Elimination δ

$$\delta(R)$$

Returns $R$ with duplicate tuples removed. Turns a bag back into a set.

Algebra operators preserve set semantics by default, so δ rarely appears explicitly in algebra expressions. It is essential when reasoning about the bag-semantics of real SQL.

<div class="columns">
<div>

### Algebra

$$\delta(\pi_{major}(student))$$

</div>
<div>

### SQL

```sql
SELECT DISTINCT major FROM student;
```

</div>
</div>

---

# Generalized Projection $\tilde{\pi}$

Standard projection picks attributes by name.
Generalized projection allows computed expressions.

<div class="columns">
<div>

### Algebra

$$\tilde{\pi}_{last \,\|\, ',\,\,' \,\|\, first, \,gpa \times 25}(student)$$

</div>
<div>

### SQL

```sql
SELECT last || ', ' || first AS fullname,
       gpa * 25 AS percent
FROM student;
```

</div>
</div>

Most algebra texts fold this into π and call it a day. We will keep the tilde when we want to emphasize that the column came from a computation.

---

<!-- _class: lead -->

# Part 5: SQL ↔ Algebra Round-Trip

---

# A Real Query, Translated

> Average GPA per major, only majors with at least 5 students, sorted by average descending.

<div class="columns">
<div>

### Algebra

$$\tau_{avg\_gpa\,desc}\big( \sigma_{n \geq 5}\big( \gamma_{major; \text{count}(*) \to n, \text{avg}(gpa) \to avg\_gpa}(student) \big) \big)$$

Three operators: γ, σ, τ.

</div>
<div>

### SQL

```sql
SELECT major,
       count(*) AS n,
       avg(gpa) AS avg_gpa
FROM student
GROUP BY major
HAVING count(*) >= 5
ORDER BY avg_gpa DESC;
```

Four clauses: SELECT, GROUP BY, HAVING, ORDER BY.

</div>
</div>

<!--
The mapping is consistent: WHERE → σ before γ, HAVING → σ after γ, GROUP BY → γ, ORDER BY → τ, SELECT → π or π̃. Drive this mapping until it is automatic; students will read plans in this shape all semester.
-->

---

# A Plan Tree, Sketched

```mermaid
graph BT
  scan["scan(student)"] --> agg["γ_major;count(*),avg(gpa)"]
  agg --> sel["σ_count(*) ≥ 5"]
  sel --> sort["τ_avg_gpa desc"]
  sort --> out["result"]
```

This is what `EXPLAIN` will show you in Section 5.
The plan is an algebra expression drawn vertically.

<!--
Foreshadow Week 9: Storage and Indexing. When we read execution plans there, students should recognize this same shape with physical operators (Hash Aggregate, Filter, Sort) replacing the logical ones (γ, σ, τ).
-->

---

# Wrap-up

You now have the full algebra:

<div class="columns">
<div>

**Core (Friday)**
σ, π, ∪, ∩, −, ×, ρ

**Joins (today)**
⋈_θ, ⋈, ⟕, ⟖, ⟗

</div>
<div>

**Division (today)**
÷

**Extended (today)**
γ, τ, δ, $\tilde{\pi}$

</div>
</div>

SQL compiles down to this small set of operators. Optimizers rewrite trees of these operators. Quizzes and exams will ask you to translate in both directions.

---

# Wednesday: ER Modeling

We step away from "what is computable" and ask "what is the right schema in the first place."

ER lets us design with concepts (entities and relationships) before committing to tables.
By Friday we will turn an ER diagram into the SQL DDL we have been writing all along.

Read GMW Ch. 4.1-4.5 before class.

---

# Practice Before Wednesday

Three more problems on the handout in the day-5 folder:

1. Find suppliers who supply every part in `red_parts`.
2. Express the average enrollment per course in algebra and SQL.
3. Translate this plan tree back into a SQL query.

Answers due in your repo before 8:30 AM Wed Sep 2.

<!--
Problem 3 is the hardest — it goes from a plan tree (what the optimizer sees) back up to surface SQL. This is a skill students need by Section 5; introducing it on a low-stakes handout gives them a chance to fail safely.
-->

---

# Questions

What is on your mind?

Project 1 ships Wednesday. Project 0 setup remains due Fri Sep 4.
