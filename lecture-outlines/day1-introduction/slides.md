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

# Day 1: Course Introduction

**COP 5725 - Database Management Systems**
Friday, August 21, 2026

Dr. Christan Grant
University of Florida, CISE

<!--
First class of the term. Goals: surface who they are, give the shape of the semester, get the software started, leave them excited to come back Monday. No graded work this week — say that aloud at the top.
Total time 50 min. Take a few minutes longer at the end if needed for Q&A.
-->

---

# Today's Hour

1. Who is teaching this and what they care about
2. Why a database course in 2026
3. The shape of the semester
4. Grading, expectations, integrity
5. Software preview and what to do before Monday

> There is no graded work this week.

<!--
Repeat the "no graded work" point. Students arriving from heavy first-week courses will visibly relax. The pace this week is intentionally low so that Project 0 (a setup task) lands without panic.
-->

---

<!-- _class: lead -->

# Part 1: Introductions

---

# About the Instructor

<div class="columns-left-wide">
<div>

Dr. Christan Grant — Associate Professor, CISE
Director of the [UF Data Studio](https://ufdatastudio.com)

**Research interests:**
- Data systems and information extraction
- Data engineering for AI/ML
- Applied AI and human-in-the-loop systems

**Contact:** `christan@ufl.edu`
Subject line **must** include `cop5725fa26`.

**Office hours:** by appointment — booking link in the syllabus.

**Course site:** [ufdatastudio.com/cop5725fa26](https://ufdatastudio.com/cop5725fa26)

</div>
<div>

![w:260px](images/ufdatastudio-logo.png)

<div class="caption">

The [UF Data Studio](https://ufdatastudio.com) research lab

</div>

</div>
</div>

<!--
Brief on past teaching: CIS 6930 last spring (data engineering with LLMs) is the most similar course. Mention research interests briefly and point at the UF Data Studio figure — students who care about data systems should know the lab exists and takes students.
-->

---

# About You

Take 90 seconds — share with the person next to you:

1. Your name and program
2. The most database-ish thing you have built so far
3. One question you want answered before December

> We will not collect these. The point is to surface what we know and what we want.

<!--
Time this strictly: 90 seconds total. Walk the room while they talk. After 90 seconds, ask one or two pairs to share their #3 — those questions often reveal the course's biggest motivators (and sometimes things outside scope, which I should redirect early).
-->

---

# Help Us Pick Office Hours

<div class="columns">
<div>

Instructor hours run by appointment for now, and the TA's weekly slot is not yet set.

Before you leave, tell us what works:

1. Which days? (MWF around lecture, or Tue/Thu)
2. What time? (right after class, midday, late afternoon)
3. What format? (in person, Zoom, or both)

</div>
<div>

### How to answer

- Show of hands in a moment
- Canvas poll stays open through the weekend

Winning slots are announced on Canvas and added to the syllabus next week.

</div>
</div>

<!--
Quick show of hands: days first, then time of day, then format. The Canvas poll catches anyone who stays quiet in a big room. Use the results to set the TA's weekly hours and at least one standing instructor slot, then announce both Monday. Remember to actually create the Canvas poll before class.
-->

---

<!-- _class: lead -->

# Part 2: Why a Database Course

---

# Databases Everywhere All at Once

<div class="columns">
<div>

Almost every system you will build holds data in motion and at rest.

- A web service routes user actions through a transactional store
- A model pipeline reads features from a warehouse and writes back predictions
- A spreadsheet, a Jupyter cell, a logs dashboard — all do the same thing at different sizes

A database systems course teaches you to see the machinery.

</div>
<div>

```mermaid
graph LR
  U["User"] --> A["App"]
  A --> T[("Transactional DB<br/>PostgreSQL")]
  T --> ETL["ETL / CDC"]
  ETL --> W[("Analytical DB<br/>DuckDB / Snowflake")]
  W --> ML["ML Pipeline"]
  W --> BI["Dashboards"]
```

</div>
</div>

<!--
The diagram is the punchline: every modern system runs on at least two databases that look almost nothing alike. Half the course is "what are they?" and the other half is "why are they different?"
-->

---

# Our Favorite DBMSs

We will use two open-source engines that bracket the design space.

<div class="columns">
<div>

### PostgreSQL 16

- **Workload:** Transactional (OLTP)
- **Layout:** Row-oriented
- **Shines at:** concurrent writes, ACID, ecosystem
- **History:** 1986 Berkeley project, evolved continuously

</div>
<div>

### DuckDB

- **Workload:** Analytical (OLAP)
- **Layout:** Column-oriented
- **Shines at:** single-node analytics, vectorized scans, Parquet integration
- **History:** 2019, CWI Amsterdam

</div>
</div>

Both speak SQL. Both ship as easy local installs.

<!--
Stress that "speak the same language" is precisely Codd's separation of logical from physical. Same SQL surface, completely different machinery underneath.
-->

---

# Reading Execution Plans

A working database engineer reads a query plan the way a systems engineer reads `strace` output.

```sql
EXPLAIN ANALYZE
SELECT department, AVG(salary)
FROM employees
WHERE hire_date > '2020-01-01'
GROUP BY department;
```

By Week 13 you will know what each line of the resulting plan means, why it was chosen, and how to make it faster.

<!--
Show a real EXPLAIN ANALYZE output on the projector if time. Three lines about Seq Scan, Hash Aggregate, and time costs are enough to plant the idea that "what runs" is not "what you wrote."
-->

---

<!-- _class: lead -->

# Part 3: The Semester

---

# Our Course Timeline

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'cScale0':'#1976d2', 'cScaleLabel0':'#ffffff',
  'cScale1':'#388e3c', 'cScaleLabel1':'#ffffff',
  'cScale2':'#0097a7', 'cScaleLabel2':'#ffffff',
  'cScale3':'#e65100', 'cScaleLabel3':'#ffffff',
  'cScale4':'#c2185b', 'cScaleLabel4':'#ffffff',
  'cScale5':'#5e35b2', 'cScaleLabel5':'#ffffff',
  'cScale6':'#6d4c41', 'cScaleLabel6':'#ffffff'
}}}%%
timeline
  §1 Foundations : Weeks 1-4 : Quiz 1 (Sep 11)
  §2 SQL Mastery : Weeks 5-7 : Quiz 2 (Oct 2)
  §3 Programming : Week 8 : Exam 1 (Oct 14)
  §4 Storage + Indexing : Weeks 9-11 : Quiz 3 (Oct 30)
  §5 Query Processing : Weeks 12-13 : Quiz 4 (Nov 13) : Exam 2 (Nov 18)
  §6 Transactions : Weeks 14, 16 : Quiz 5 (Dec 2)
  §7 Distributed : Week 16 : Final Exam (Dec 11)
```

<!--
Walk the timeline left to right once. The key idea: every quiz closes a section so you know what is on it (and what is not). Two exams + a final spread the load.
-->

---

# The Calendar at a Glance

<div class="columns">
<div>

**Class days you should not miss:**
- Today (Fri Aug 21)
- Quiz days: Sep 11, Oct 2, Oct 30, Nov 13, Dec 2 (Wed)
- Exam Wednesdays: Oct 14, Nov 18
- Final: Fri Dec 11, 10:00 AM-12:00 PM, MALA 1000

</div>
<div>

**No class:**
- Sep 7 (Labor Day)
- Oct 9-10 (Homecoming)
- Nov 11 (Veterans Day)
- Nov 23-28 (Thanksgiving)
- Dec 3-4 (Reading days)

</div>
</div>

A complete day-by-day schedule lives at [ufdatastudio.com/cop5725fa26/schedule](https://ufdatastudio.com/cop5725fa26/schedule).

> I have several conference and research trips this fall. When a trip lands on a class day, I will likely prerecord the lecture for that class period.

<!--
Point out that the Homecoming closure (Oct 9-10) sometimes catches students off guard. Friday classes that week do not meet.
Travel: say it plainly and without apology — several conference and research trips this fall. Affected class periods get a prerecorded lecture posted before class; specific dates will be announced as each trip firms up.
-->

---

# Projects: Individual, Peer-Graded, Progressive

```mermaid
graph LR
  P0["P0<br/>P/F<br/>Setup"] --> P1["P1<br/>4%<br/>Schema + SQL"]
  P1 --> P2["P2<br/>6%<br/>Advanced SQL"]
  P2 --> P3["P3<br/>10%<br/>Indexing + Plans"]
  P3 --> PF["Final<br/>15%<br/>Capstone"]
```

| Project | Due | Topic |
|---------|-----|-------|
| 0 | Sep 4 | Environment setup |
| 1 | Sep 25 | Schema + SQL |
| 2 | Oct 23 | Advanced SQL |
| 3 | Nov 13 | Indexing + plans |
| Final | Dec 9 | Capstone |

<!--
The progressive weighting is deliberate: Project 1 is low-stakes so a student stumbling on git or psycopg doesn't kill their grade. Final is the largest single component because students who reach the capstone have invested significantly.
-->

---

<!-- _class: lead -->

# Part 4: Grading and Expectations

---

# Grade Breakdown

<div class="columns">
<div>

| Component | Weight |
|-----------|--------|
| Quizzes (drop lowest) | 15% |
| Project 1 | 4% |
| Project 2 | 6% |
| Project 3 | 10% |
| Final Project | 15% |
| Exam 1 (Oct 14) | 15% |
| Exam 2 (Nov 18) | 15% |
| Final Exam | 20% |

</div>
<div>

<svg viewBox="0 0 480 340" width="480" role="img" aria-label="Donut chart of grade weight by category: exams 50 percent, projects 35 percent, quizzes 15 percent" style="display:block;margin:0 auto;">
  <path d="M 241 52 A 118 118 0 0 1 241 288" fill="none" stroke="#2a78d6" stroke-width="24"/>
  <path d="M 239 288 A 118 118 0 0 1 143.95 101.45" fill="none" stroke="#1baf7a" stroke-width="24"/>
  <path d="M 145.11 99.85 A 118 118 0 0 1 239 52" fill="none" stroke="#eda100" stroke-width="24"/>
  <text x="240" y="176" text-anchor="middle" font-size="18" fill="#52514e">Final grade</text>
  <text x="394" y="167" text-anchor="start" font-size="21" font-weight="600" fill="#0b0b0b">50%</text>
  <text x="394" y="189" text-anchor="start" font-size="17" fill="#52514e">Exams</text>
  <text x="103" y="237" text-anchor="end" font-size="21" font-weight="600" fill="#0b0b0b">35%</text>
  <text x="103" y="259" text-anchor="end" font-size="17" fill="#52514e">Projects</text>
  <text x="170" y="30" text-anchor="end" font-size="21" font-weight="600" fill="#0b0b0b">15%</text>
  <text x="170" y="52" text-anchor="end" font-size="17" fill="#52514e">Quizzes</text>
</svg>

</div>
</div>

<!--
Highlight: half your grade is exams. That's a contrast with last spring's data engineering course where the project was 70%. Different course, different goals — here we are anchored in well-defined material and exams test it cleanly.
Quizzes: five short in-class quizzes, each with questions about the section just completed. The lowest score is dropped, so there are no makeup quizzes — the drop absorbs an absence or illness.
-->

---

# Late Policy

<div class="columns">
<div>

### The Rule

- Submit on time
- After the deadline, you may submit until grading begins
- The start of grading is **not** announced
- After grading begins, late submissions are not accepted

</div>
<div>

### The Exception

Real hardships bend the rule: illness, family emergency, hurricane.

Talk to me with documentation. The policy bends; it does not break.

</div>
</div>

<!--
The "unannounced grading start" is intentional. It makes the late submission window real but discourages strategic lateness. In practice, grading starts 1-3 days after the deadline.
-->

---

# Academic Integrity

<div class="columns">
<div>

### Yes, violation

- Two students typing identical SQL together
- Sharing a draft for "review and suggestions"
- Using AI without declaring it
- Publishing solutions to GitHub or a tutoring service

</div>
<div>

### No, fine

- Writing independently, comparing answers, then revising
- Showing a textbook example
- Suggesting a debugging strategy
- Using a public Internet page to understand a concept

</div>
</div>

The syllabus has the long version with examples. Read it.

<!--
The AI clause is unambiguous: declare every prompt and include it with submission. I will not run a tool that detects undeclared AI; the honor system applies. Violations get reported the same way other integrity issues do.
-->

---

# The Case for Hand-Coding

<div class="columns">
<div>

Does AI assistance change what you learn? Anthropic randomized 52 engineers to build features with an unfamiliar Python library, with or without an AI assistant.

- AI users averaged 50% on the follow-up quiz, hand-coders 67%, nearly two letter grades apart
- Debugging skills showed the widest gap
- The AI group finished no faster
- Asking for explanations preserved understanding; delegating code did not

> Write your own SQL this semester. If you use AI, make it a declared tutor, not a ghostwriter.

</div>
<div>

![w:500px](images/anthropic-ai-coding-skills.png)

<div class="caption">

"How AI assistance impacts the formation of coding skills," Anthropic, Jan 29, 2026
[anthropic.com/research/AI-assistance-coding-skills](https://www.anthropic.com/research/AI-assistance-coding-skills) · [full paper](https://arxiv.org/abs/2601.20245)

</div>

</div>
</div>

<!--
This slide is the "why" behind the AI clause on the previous slide. Study details for the inevitable questions: n=52, mostly junior engineers, each with a year or more of weekly Python; the task used Trio, an async library none of them knew well; the quiz covered debugging, code reading, code writing, and concepts. The headline gap (50% vs 67%) is Cohen's d = 0.738 at p = 0.01, and the debugging sub-scores fell hardest. Debugging your own SQL and plans is a skill the projects lean on.
Say aloud that the study also found a usable lane: participants who asked follow-up questions, requested explanations, or posed conceptual queries understood more than those who delegated code generation. That lane is exactly what the declared-use policy permits.
Expect the "industry uses AI everywhere" pushback. Honest answer: true, and the study measures skill formation. A course is the skill-formation phase. Once the skill exists, assistance is leverage; before it exists, assistance is a substitute.
-->

---

<!-- _class: lead -->

# Part 5: Software and Setup

---

# What You Need to Install

<div class="columns">
<div>

| Tool | Why |
|------|-----|
| **PostgreSQL 16+** | Transactional engine |
| **DuckDB** | Analytical engine |
| **Python 3.11+ via uv** | Glue + visualization |
| **Git/GitHub** | Submission |

</div>
<div>

```mermaid
graph TD
  L["Local Machine"] --> P["PostgreSQL"]
  L --> D["DuckDB"]
  L --> U["uv + Python"]
  L --> G["Git CLI"]
  P --> PS["psql CLI"]
  D --> DC["duckdb CLI"]
  U --> PG["psycopg2"]
  U --> PD["pandas"]
  U --> JN["Jupyter"]
```

</div>
</div>

Project 0 walks through all of this. Due **Friday, Sep 4**.

---

# A 30-Second Tour

```bash
# PostgreSQL — your transactional sandbox
psql postgres
> SELECT version();

# DuckDB — your analytical sandbox
duckdb
D SELECT * FROM 'https://duckdb.org/data/flights.csv' LIMIT 5;

# Python + DuckDB — one-liner data exploration
uv run --with duckdb python -c "import duckdb; print(duckdb.sql('SELECT 42'))"
```

If these three lines run for you by next Friday, Project 0 is yours.

<!--
Do this live if the projector cooperates. The DuckDB one-liner over an HTTP CSV is the demo students remember — "wait, it just reads a remote CSV like a table?"
-->

---

<!-- _class: lead -->

# Part 6: What Monday Looks Like

---

# Monday: Database History

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
  'cScale0':'#546e7a', 'cScaleLabel0':'#ffffff',
  'cScale1':'#1565c0', 'cScaleLabel1':'#ffffff',
  'cScale2':'#00838f', 'cScaleLabel2':'#ffffff',
  'cScale3':'#2e7d32', 'cScaleLabel3':'#ffffff',
  'cScale4':'#558b2f', 'cScaleLabel4':'#ffffff',
  'cScale5':'#ef6c00', 'cScaleLabel5':'#ffffff',
  'cScale6':'#d84315', 'cScaleLabel6':'#ffffff',
  'cScale7':'#ad1457', 'cScaleLabel7':'#ffffff'
}}}%%
timeline
  title 60 Years of Databases
  1960s : Punched cards, file systems, IMS, CODASYL
  1970 : Codd's relational paper
  1974-79 : System R, INGRES
  1980s : Oracle, DB2, Sybase, Informix
  1990s : PostgreSQL, MySQL, Object-Relational
  2000s : NoSQL — BigTable, Dynamo, MongoDB
  2010s : NewSQL — Spanner, CockroachDB, Snowflake
  2020s : DuckDB, vector DBs, lakehouses
```

The arc matters: data model fights repeat. Knowing what was tried and dropped saves you from re-trying it.

<!--
The timeline diagram is the centerpiece of Monday's lecture. Showing it here, on day one, primes them. By Monday they will not be surprised that we spend a whole hour walking the timeline.
-->

---

# Before Monday

1. Clone the course repo (link on Canvas)
2. Read the syllabus
3. Start Project 0 — no rush, due Sep 4

> There is no graded work this week.

<!--
Repeat the no-grading point one more time. The first-week stress reduction is genuine: students who feel pressure to "get ahead" can use this week for setup pain. Project 0 surfacing weird Python/Postgres install issues is the goal of week 1.
-->

---

# Questions

What is on your mind?

The instructor and TAs are here for the rest of the hour.

<!--
Common first-day questions to expect: prerequisites (the syllabus is explicit), AI tool policy (yes, declared, with prompts), can projects be done in pairs (no, explicitly individual; peer review serves the discussion need), how hard is this compared to {last year's instructor / CIS 4301 / their friend's course at another school} — be honest, this is graduate level.
-->
