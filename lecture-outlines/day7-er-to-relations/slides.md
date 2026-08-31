---
marp: true
theme: cop5725
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management Systems - Fall 2026'
math: katex
html: true
---

<!-- _class: lead -->

# Day 7: ER to Relations

**COP 5725 - Database Management Systems**
Friday, September 4, 2026

Translating the registrar ER diagram into SQL DDL

<!--
Project 0 is due tonight. The lecture's job is to close the design loop: take the ER diagram from Wednesday and produce a SQL DDL script. Pace 50 min, with last 8 min on tradeoffs and the look-ahead to normalization next week.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Wednesday we drew an ER diagram for a registrar system.
Today we turn that diagram into SQL `CREATE TABLE` statements <span class="cite">(Textbook §4.5, p. 157)</span>.

The translation is mechanical for most ER constructs.
A few cases, such as 1:1 relationships and ISA hierarchies, require a design choice.
We will see all of them.

</div>
<div>

```mermaid
graph TB
  W["World"] --> ER["ER<br/>diagram"]
  ER --> SCH["Relational<br/>schema"]
  SCH --> SQL["SQL DDL"]
  classDef done fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  class W,ER done
  class SCH,SQL now
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  R["1. The six<br/>translation rules"] --> W["2. Walk the<br/>registrar diagram"]
  W --> T["3. Tradeoffs the<br/>rules hide"]
  T --> N["4. What ER<br/>did not tell us"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class R,W,T,N step
```

The result is a SQL script that runs against PostgreSQL.

<!--
The "what ER did not tell us" section is foreshadowing for Week 4: functional dependencies and normalization. ER produces *a* schema, not necessarily the *best* one. Normalization fixes redundancy ER does not catch.
-->

---

<!-- _class: lead -->

# Part 1: The Six Translation Rules

---

# The Six Rules

| ER Construct | Translation |
|--------------|-------------|
| Strong entity | One table; PK is the entity's key |
| Weak entity | One table; PK = owner's PK + partial key |
| 1:1 relationship | Three options (next slides) |
| 1:N relationship | Embed FK on the N side |
| M:N relationship | New table; PK = both FKs |
| Multi-valued attribute | New table; PK = owner PK + value |

ISA hierarchies add three strategies of their own.

We will apply each rule to the registrar diagram <span class="cite">(Textbook §4.5, p. 157 and §4.6, p. 165)</span>.

---

# Rule 1: Strong Entity → Table

<div class="columns">
<div>

```mermaid
graph TB
  S["Student"]
  S --- SID(("<u>student_id</u>"))
  S --- N(("name"))
  S --- G(("gpa"))
  classDef entity fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#0d47a1
  classDef attr fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  classDef key fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
  class S entity
  class N,G attr
  class SID key
```

</div>
<div>

```sql
CREATE TABLE student (
  student_id  bigint        PRIMARY KEY,
  name        text          NOT NULL,
  gpa         numeric(3,2)  CHECK (gpa BETWEEN 0 AND 4.0)
);
```

</div>
</div>

<div class="rule">

**Rule:** Each strong entity becomes a table. The primary key in the diagram becomes the `PRIMARY KEY` in the table <span class="cite">(Textbook §4.5.1, p. 157)</span>.

</div>

<!--
The simplest rule and the most common. The only design choice is the SQL data type — which we covered on Day 3.
-->

---

# Rule 2: Weak Entity → Composite Key Table

<div class="columns">
<div>

```mermaid
graph LR
  C["Course"] === O{"offered as"} === Sec["<span class='weak-inner'>Section</span>"]
  Sec --- SN(("<u>section_num</u>"))
  Sec --- T(("term"))
  Sec --- R(("room"))
  classDef entity fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#0d47a1
  classDef weak fill:#ffebee,stroke:#c62828,stroke-width:3px,color:#b71c1c
  classDef irel fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#e65100
  classDef attr fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  classDef key fill:#fff9c4,stroke:#f57f17,stroke-width:3px
  class C entity
  class Sec weak
  class O irel
  class T,R attr
  class SN key
```

</div>
<div>

```sql
CREATE TABLE section (
  course_id    text REFERENCES course(course_id),
  section_num  int  NOT NULL,
  term         text NOT NULL,
  room         text,
  PRIMARY KEY (course_id, section_num, term)
);
```

</div>
</div>

<div class="rule">

**Rule:** Weak entity becomes a table whose primary key is the **owner's primary key** concatenated with the **partial key**. The owner's key is also a foreign key <span class="cite">(Textbook §4.5.4, p. 161)</span>.

</div>

<!--
The composite key has three parts here because `term` is also part of the identity — Section 001 of COP5725 in Fall 2026 is a different section from Section 001 in Spring 2027. The exact composition depends on what makes the section unique.
The underlined section_num in yellow is the partial key (drawn with a dashed underline on paper, per the Day 6 convention).
-->

---

# Rule 3: 1:1 Relationships

<div class="columns-3">
<div>

### Option A: Merge

Combine into one table.

```sql
CREATE TABLE person (
  pid bigint PK,
  name text,
  passport_num text UNIQUE
);
```

When: 1:1 with total participation on both sides, no separate use cases.

</div>
<div>

### Option B: FK in either

Pick one side; put the FK there.

```sql
CREATE TABLE person (
  pid bigint PK,
  name text
);
CREATE TABLE passport (
  passport_num text PK,
  pid bigint REFERENCES person(pid) UNIQUE
);
```

When: one side may exist without the other.

</div>
<div>

### Option C: Separate table

A relationship table.

```sql
CREATE TABLE has_passport (
  pid bigint PK REFERENCES person,
  passport_num text UNIQUE REFERENCES passport
);
```

When: the relationship has its own attributes.

</div>
</div>

<div class="tradeoff">

**Tradeoff:** Option A is fastest but loses independence. Option B is the working default. Option C adds a join but supports relationship attributes.

</div>

<!--
For most 1:1 cases, Option B is the right answer. The exceptions are when one of the entities makes no sense on its own (then Option A) or when the relationship has its own attributes (then Option C).
-->

---

# Rule 4: 1:N Relationship → FK on N Side

<div class="columns">
<div>

```mermaid
graph LR
  D["Department"] -- "1" --- B{"belongs to"}
  B -- "N" --- C["Course"]
  classDef entity fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#0d47a1
  classDef rel fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#e65100
  class D,C entity
  class B rel
```

</div>
<div>

```sql
CREATE TABLE course (
  course_id  text PRIMARY KEY,
  title      text NOT NULL,
  credits    int  NOT NULL,
  dname      text REFERENCES department(dname)
);
```

</div>
</div>

<div class="rule">

**Rule:** Embed the foreign key on the **N** side. Each course has *one* department; the dname column captures that <span class="cite">(Textbook §4.5.2, p. 158 and §4.5.3, p. 160)</span>.

</div>

The FK can be `NOT NULL` if participation is total ("every course belongs to a department").

<!--
This is the workhorse rule. Most relationships in real schemas are 1:N, and most foreign keys you write follow this pattern. The "embed on N side" intuition: the N-side row already exists once, so adding an FK column is one column per row instead of a whole new table.
-->

---

# Rule 5: M:N Relationship → Junction Table

<div class="columns">
<div>

```mermaid
graph LR
  S["Student"] -- "M" --- E{"enrolls in"}
  E -- "N" --- Sec["<span class='weak-inner'>Section</span>"]
  E --- G(("grade"))
  classDef entity fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#0d47a1
  classDef weak fill:#ffebee,stroke:#c62828,stroke-width:3px,color:#b71c1c
  classDef rel fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#e65100
  classDef attr fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  class S entity
  class Sec weak
  class E rel
  class G attr
```

</div>
<div>

```sql
CREATE TABLE enrollment (
  student_id   bigint REFERENCES student(student_id),
  course_id    text,
  section_num  int,
  term         text,
  grade        char(2),
  PRIMARY KEY (student_id, course_id, section_num, term),
  FOREIGN KEY (course_id, section_num, term)
    REFERENCES section(course_id, section_num, term)
);
```

</div>
</div>

<div class="rule">

**Rule:** Every M:N relationship becomes its own table. Primary key = both side FKs. Relationship attributes become additional columns <span class="cite">(Textbook §4.5.2, p. 158)</span>.

</div>

<!--
The junction-table pattern is everywhere. The complication here is that Section is a weak entity, so its FK is three columns (course_id, section_num, term), not one. The FK declaration needs all three.
-->

---

# Rule 6: Multi-Valued Attribute → Side Table

<div class="columns">
<div>

```mermaid
graph TB
  S["Student"]
  S --- Phone(("<span class='multi-inner'>phone</span>"))
  classDef entity fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#0d47a1
  classDef multi fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
  class S entity
  class Phone multi
```

</div>
<div>

```sql
CREATE TABLE student_phone (
  student_id  bigint REFERENCES student(student_id),
  phone       text   NOT NULL,
  PRIMARY KEY (student_id, phone)
);
```

</div>
</div>

<div class="tradeoff">

**Alternative in PostgreSQL:** keep `phones text[]` on the student row. Cheaper for read-mostly use cases, harder for indexes on individual phones.

</div>

<!--
PostgreSQL's array support lets you sidestep this rule when you don't query into the array. The textbook's pure-relational answer is the side table; the practical 2026 answer often involves arrays or JSONB. Pick based on access pattern.
-->

---

# ISA Hierarchies

Three strategies <span class="cite">(Textbook §4.6, p. 165)</span>:

<div class="columns-3">
<div>

### Strategy 1: Single Table

One table with all columns, plus a `kind` discriminator.

```sql
CREATE TABLE person (
  pid bigint PK,
  kind text CHECK (kind IN ('student', 'faculty')),
  -- common
  name text,
  -- student only
  gpa numeric(3,2),
  -- faculty only
  salary numeric
);
```

Pro: one join-free table.
Con: many NULLs.

</div>
<div>

### Strategy 2: Per-Subclass

One table per subclass; common attributes repeated.

```sql
CREATE TABLE student (
  student_id bigint PK,
  name text,
  gpa numeric(3,2)
);
CREATE TABLE faculty (
  fid bigint PK,
  name text,
  salary numeric
);
```

Pro: no NULLs.
Con: queries over "all people" need UNION.

</div>
<div>

### Strategy 3: Joined Table

Parent table + child tables.

```sql
CREATE TABLE person (
  pid bigint PK,
  name text
);
CREATE TABLE student (
  pid bigint PK REFERENCES person,
  gpa numeric(3,2)
);
```

Pro: normalized; OO-friendly.
Con: every read joins.

</div>
</div>

<!--
PostgreSQL has table inheritance (CREATE TABLE student INHERITS person), which is a built-in version of Strategy 3 with some performance optimizations. It's underused — useful when you want polymorphic reads.
-->

---

<!-- _class: lead -->

# Part 2: Walk the Registrar Diagram

---

# Wednesday's Diagram

```mermaid
graph LR
  S["Student"] -- "M" --- E{"enrolls in"}
  E -- "N" --- Sec["<span class='weak-inner'>Section</span>"]
  Sec -- "N" --- O{"offered as"}
  O -- "1" --- C["Course"]
  C -- "N" --- B{"belongs to"}
  B -- "1" --- D["Department"]
  F["Faculty"] -- "N" --- M{"member of"}
  M -- "1" --- D
  F -- "1" --- T{"teaches"}
  T -- "N" --- Sec
  E --- G(("grade"))
  classDef entity fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#0d47a1
  classDef weak fill:#ffebee,stroke:#c62828,stroke-width:3px,color:#b71c1c
  classDef rel fill:#fff9c4,stroke:#f57f17,stroke-width:3px,color:#e65100
  classDef attr fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
  class S,C,F,D entity
  class Sec weak
  class E,O,B,M,T rel
  class G attr
```

Five entities, one weak, five relationships, one relationship attribute. We translate each.

---

# The Translation

<div class="build">

![w:1050](images/translation-build-1.svg)

::: appear
![w:1050](images/translation-build-2.svg)
:::

::: appear
![w:1050](images/translation-build-3.svg)
:::

::: appear
![w:1050](images/translation-build-4.svg)
:::

::: appear
![w:1050](images/translation-build-5.svg)
:::

</div>

<!--
The whole lecture in one figure before the rule-by-rule walk. Each right-arrow applies one rule: the amber wash marks the diagram region being translated, and the bright SQL lines are what that rule just produced. Frames: strong entities (§4.5.1), the two 1:N foreign keys (§4.5.2-4.5.3), the weak Section with its composite key plus the embedded teaches FK (§4.5.4), the M:N enrollment junction table, then the constraint polish. The detailed rules follow on the next slides; return to this slide at the end if time allows.
-->

---

# Step 1: Strong Entities

```sql
CREATE TABLE student (
  student_id  bigint        PRIMARY KEY,
  name        text          NOT NULL,
  gpa         numeric(3, 2) CHECK (gpa BETWEEN 0 AND 4.0)
);

CREATE TABLE course (
  course_id  text PRIMARY KEY,
  title      text NOT NULL,
  credits    int  NOT NULL CHECK (credits BETWEEN 1 AND 6)
);

CREATE TABLE faculty (
  fid    bigint PRIMARY KEY,
  name   text NOT NULL,
  salary numeric(12, 2)
);

CREATE TABLE department (
  dname    text PRIMARY KEY,
  building text
);
```

Four `CREATE TABLE`s, one per strong entity. No foreign keys yet.

---

# Step 2: Add 1:N Foreign Keys

Course belongs to a Department.
Faculty is a member of a Department.

```sql
ALTER TABLE course
  ADD COLUMN dname text REFERENCES department(dname);

ALTER TABLE faculty
  ADD COLUMN dname text REFERENCES department(dname);
```

(Or equivalently, declare the columns in the original `CREATE TABLE`.)

The FKs go on the N side, `course` and `faculty`.

---

# Step 3: Weak Entity Section

```sql
CREATE TABLE section (
  course_id    text   REFERENCES course(course_id),
  section_num  int    NOT NULL,
  term         text   NOT NULL,
  room         text,
  fid          bigint REFERENCES faculty(fid),
  PRIMARY KEY (course_id, section_num, term)
);
```

Two things happened in one table:

1. **Section** is a weak entity, so its PK is composite.
2. **Faculty teaches Section** is 1:N, so `fid` is an FK on Section (the N side).

<!--
Combining the weak entity translation with the teaches FK in one table is the natural result. We didn't need a separate "teaches" table because the relationship is 1:N — embedding works.
-->

---

# Step 4: M:N Enrollment

```sql
CREATE TABLE enrollment (
  student_id   bigint REFERENCES student(student_id),
  course_id    text,
  section_num  int,
  term         text,
  grade        char(2),  -- NULL until graded
  PRIMARY KEY (student_id, course_id, section_num, term),
  FOREIGN KEY (course_id, section_num, term)
    REFERENCES section(course_id, section_num, term)
);
```

The relationship is M:N, so it becomes a table.
`grade` is the relationship attribute, a property of the enrollment.

<!--
The composite FK to section is the bookkeeping cost of having a weak entity in the schema. If Section had a single surrogate key (section_id), the FK would be one column. Tradeoff: weak entities require composite FKs but make the natural-key constraints cleaner.
-->

---

# Junction Table Example

<div class="columns">
<div>

**student**

<table>
<thead><tr><th>student_id</th><th>name</th></tr></thead>
<tbody>
<tr style="background:#F8BBD0"><td>1</td><td>Ada</td></tr>
<tr style="background:#F8BBD0"><td>2</td><td>Bob</td></tr>
</tbody>
</table>

**section** (key columns)

<table>
<thead><tr><th>course_id</th><th>section_num</th><th>term</th></tr></thead>
<tbody>
<tr style="background:#90CAF9"><td>COP5725</td><td>1</td><td>Fall2026</td></tr>
<tr style="background:#90CAF9"><td>COT5405</td><td>1</td><td>Fall2026</td></tr>
</tbody>
</table>

</div>
<div>

**enrollment**

<table>
<thead><tr><th>student_id</th><th>course_id</th><th>section_num</th><th>term</th><th>grade</th></tr></thead>
<tbody>
<tr><td style="background:#F8BBD0">1</td><td style="background:#90CAF9">COP5725</td><td style="background:#90CAF9">1</td><td style="background:#90CAF9">Fall2026</td><td style="background:#FFE082">A</td></tr>
<tr><td style="background:#F8BBD0">1</td><td style="background:#90CAF9">COT5405</td><td style="background:#90CAF9">1</td><td style="background:#90CAF9">Fall2026</td><td style="background:#FFE082">B+</td></tr>
<tr><td style="background:#F8BBD0">2</td><td style="background:#90CAF9">COP5725</td><td style="background:#90CAF9">1</td><td style="background:#90CAF9">Fall2026</td><td style="background:#FFE082"><strong>NULL</strong></td></tr>
</tbody>
</table>

Pink cells copy the student key, blue cells copy section's composite key, and the amber grade is the relationship's own attribute.

</div>
</div>

<!--
The colors trace provenance: enrollment stores nothing of its own except grade — every other column is a borrowed key. Bob's NULL grade is an enrollment awaiting grading, the reason grade is nullable in the DDL on the previous slide.
-->

---

# Step 5: Constraints and Polish

```sql
-- Total participation: every course must have a department
ALTER TABLE course
  ALTER COLUMN dname SET NOT NULL;

ALTER TABLE faculty
  ALTER COLUMN dname SET NOT NULL;

-- Some grades only
ALTER TABLE enrollment
  ADD CONSTRAINT valid_grade
  CHECK (grade IS NULL OR grade IN ('A', 'A-', 'B+', 'B', 'B-',
                                    'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'));

-- Indexes on frequent join columns
CREATE INDEX idx_section_fid     ON section (fid);
CREATE INDEX idx_enrollment_student_id  ON enrollment (student_id);
```

`NOT NULL` enforces the **total participation** the ER diagram captured.
The `CHECK` enforces a domain constraint not visible in the ER notation.
Indexes are a Week 9 topic, mentioned in passing here.

---

# The Full Schema

```sql
CREATE TABLE department (
  dname text PRIMARY KEY,
  building text
);
CREATE TABLE student (
  student_id bigint PRIMARY KEY,
  name text NOT NULL,
  gpa numeric(3,2) CHECK (gpa BETWEEN 0 AND 4.0)
);
CREATE TABLE faculty (
  fid bigint PRIMARY KEY,
  name text NOT NULL,
  salary numeric(12,2),
  dname text NOT NULL REFERENCES department(dname)
);
CREATE TABLE course (
  course_id text PRIMARY KEY,
  title text NOT NULL,
  credits int NOT NULL CHECK (credits BETWEEN 1 AND 6),
  dname text NOT NULL REFERENCES department(dname)
);
CREATE TABLE section (
  course_id text REFERENCES course(course_id),
  section_num int NOT NULL,
  term text NOT NULL,
  room text,
  fid bigint REFERENCES faculty(fid),
  PRIMARY KEY (course_id, section_num, term)
);
CREATE TABLE enrollment (
  student_id bigint REFERENCES student(student_id),
  course_id text, section_num int, term text,
  grade char(2),
  PRIMARY KEY (student_id, course_id, section_num, term),
  FOREIGN KEY (course_id, section_num, term) REFERENCES section(course_id, section_num, term)
);
```

One diagram produced six tables and about sixty lines of DDL.

<!--
Worth pausing to note: this is the entire registrar schema in 60 lines. Real schemas grow from here, but the bones are this small. ER thinking is what makes the bones obvious.
-->

---

<!-- _class: lead -->

# Part 3: Tradeoffs the Rules Hide

---

# Where the Rules Stop Working

<div class="columns">
<div>

The rules give *a* schema, not necessarily the best one.

Three places where judgment beats mechanical translation:

1. Whether to embed or separate a 1:1 with partial participation
2. Which of the three ISA strategies to use
3. Whether a multi-valued attribute becomes an array, a side table, or a document

</div>
<div>

```mermaid
graph TD
  R["Mechanical<br/>rules"] --> S["A schema"]
  S --> N["Next week:<br/>normalize"]
  S --> J["This week:<br/>judgment calls"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  classDef next fill:#fff3e0,stroke:#e65100,stroke-width:2px
  class R,S step
  class N,J next
```

</div>
</div>

---

# Multi-Valued Attributes in Practice

```sql
-- Textbook rule: side table
CREATE TABLE student_phone (
  student_id bigint REFERENCES student(student_id),
  phone text,
  PRIMARY KEY (student_id, phone)
);

-- PostgreSQL array
ALTER TABLE student ADD COLUMN phones text[];

-- JSONB document
ALTER TABLE student ADD COLUMN contacts jsonb;
-- contacts: {"phones": ["555-1234"], "emails": ["ada@uf.edu"]}
```

<div class="tradeoff">

**When to pick which:**
- Use a side table when you query individual values, join on them, or update one at a time.
- Use an array when reads grab the whole list, writes replace the whole list, and nothing references individual elements.
- Use JSONB when the structure is varied or evolving and queries are exploratory.

</div>

<!--
The textbook ranking is reversed in practice. JSONB is the most common modern choice for "messy" fields; arrays are common for "list of references" fields; side tables are common when integrity matters most. Match the choice to access pattern, not to dogma.
-->

---

# What the Rules Ignore

The translation rules ignore three things that matter in production.

<div class="columns-3">
<div>

### Cardinality of reads vs writes

A junction table is great for M:N relationships that change a lot.
For relationships that rarely change, arrays or denormalization beat it.

</div>
<div>

### Query shape

If every read joins three tables, consider denormalizing the third into the second.
The ER rules cannot know your query patterns.

</div>
<div>

### Indexability

A composite key on a weak entity gives you a natural index.
A surrogate key requires you to add a unique constraint on the natural key.

<div class="small">

A surrogate key is a system-generated identifier with no real-world meaning. A natural key is built from attributes the domain already has.

</div>

</div>
</div>

<!--
ER thinking is necessary but not sufficient. Section 5 (Query Processing) and Section 4 (Indexing) revisit these tradeoffs with the tools to make principled decisions. For now, ER produces a reasonable starting point that you can optimize from.
-->

---

<!-- _class: lead -->

# Part 4: What ER Did Not Tell Us

---

# Three Questions ER Cannot Answer

<div class="columns-3">
<div>

### 1. Is the schema redundant?

ER tells us *what* lives where. It does not say if any data is duplicated.

Example: if every section repeats the course title, we have redundancy.

</div>
<div>

### 2. Is the schema lossless?

If we split or merge tables, do we lose the ability to recover the original?

ER assumes the diagram is faithful; normalization proves it.

</div>
<div>

### 3. Are dependencies preserved?

The functional dependencies in the data should still be enforceable after decomposition.

ER does not enforce; normalization does.

</div>
</div>

These three questions motivate functional dependencies and normalization in Week 4.

<!--
Foreshadow next week's content. Normalization is the math that proves an ER-derived schema is actually well-formed. Most ER diagrams produce 3NF schemas already; normalization is what tells you for sure.
-->

---

# Looking Ahead to Week 4

```mermaid
graph LR
  Today["Today:<br/>ER → SQL"] --> Lab["Labor Day<br/>no class Mon"]
  Lab --> FD["Wed: Functional<br/>Dependencies"]
  FD --> Norm["Fri: Normal Forms<br/>+ Quiz 1"]
  classDef done fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
  classDef next fill:#fff3e0,stroke:#e65100,stroke-width:2px
  classDef milestone fill:#ffebee,stroke:#c62828,stroke-width:2px
  class Today done
  class Lab,FD next
  class Norm milestone
```

Quiz 1 closes Section 1: relational model, algebra, ER, FDs, normalization.

Reading for Wednesday: Textbook §3.1-3.3, pp. 67-92.

<!--
Quiz 1 is a week from today. The single best preparation: walk the algebra ↔ SQL ↔ ER paths in both directions. Most quiz questions ask students to move between two of the three.
-->

---

# Project 0 Reminder

<div class="columns">
<div>

### Due tonight, 11:59 PM

- PostgreSQL 16+ running locally
- DuckDB installed and reachable
- Python via `uv`, with `psycopg` and `duckdb` packages
- `git clone` of the assigned repo, with at least one verified push

</div>
<div>

### Pass criteria

```bash
python -m project0.verify
```

Exits 0 if all four checks pass.
Submit by pushing to your project0 branch and tagging `v0`.

</div>
</div>

<!--
The Project 0 grader runs the same `verify` script the students run locally. If their local check passes, the grade passes. The grader was the first script I wrote; it lives in scripts/grade_project0.py.
-->

---

# Practice Before Wednesday

Three problems on the handout posted with these slides:

1. Produce the SQL DDL for the library ER diagram you drew Wednesday.
2. Given a Person→{Student, Faculty} hierarchy, argue for one of the three ISA strategies based on stated access patterns.
3. Translate a Building → Floor → Room weak-entity chain into SQL DDL.

This is an exercise.

---

# Wrap-up

- Strong entities become tables; weak entities get composite keys that include the owner's key.
- 1:N relationships embed a foreign key on the N side; M:N relationships become junction tables.
- 1:1 relationships and ISA hierarchies require a choice among the documented options.
- Multi-valued attributes become side tables, arrays, or JSONB depending on access pattern.
- ER translation yields a starting schema; normalization checks it for redundancy.

<!--
Close by walking the list against the registrar schema on the previous slide: point to the table that each bullet produced. The common student mistake all term will be putting the FK on the 1 side of a 1:N relationship — call it out here one more time.
-->

---

# Questions

What is on your mind?

Project 0 setup is due at 11:59 PM tonight.
No class Monday (Labor Day).
We resume Wednesday with functional dependencies.

<!--
Common questions to expect: "Why didn't we use surrogate keys everywhere?" (philosophy answer: natural keys carry meaning; pragmatic answer: surrogate keys are often cleaner, but both are correct). "Does PostgreSQL enforce all the FKs we declared?" (yes, unless DEFERRABLE INITIALLY DEFERRED). "Can the verify script run on Windows?" (the verify script is OS-agnostic; the install path differs but the checks are the same).
-->
