---
marp: true
theme: default
paginate: true
backgroundColor: #fff
footer: 'COP 5725 - Database Management - Fall 2026'
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
  .interactive { background: #fff3e0; border-left: 4px solid #ff6f00; padding: 1em; border-radius: 4px; }
  .error { background: #ffebee; border-left: 4px solid #c62828; padding: 1em; border-radius: 4px; }
  .doc { background: #e3f2fd; border-left: 4px solid #1976d2; padding: 1em; border-radius: 4px; }
  pre code { font-size: 0.85em; }
---

<!-- _class: lead -->

# Day 16: Window Functions II

**COP 5725 - Database Management**
Monday, September 28, 2026

Frames, neighbors, boundaries

<!--
Project 1 group presentations start this week. The first 30 min of class today is small-group breakouts; the remaining 20 min covers Window II content. Adjust pacing — the slide deck assumes 50 minutes, but in practice today is closer to 25 minutes of content delivery. Hit the highlights (frames, LAG/LEAD, moving averages) and move the rest to the practice handout.
-->

---

# Where We Are

<div class="columns-left-wide">
<div>

Friday's lecture gave us the OVER clause with `PARTITION BY` and `ORDER BY`.

Today we add the third piece — **frames** — and three more function families: neighbor, boundary, and offset functions.

By the end of the hour you compute moving averages, period-over-period deltas, and gap detection.

</div>
<div>

```mermaid
graph TB
  D15["Day 15:<br/>OVER, ranking,<br/>aggregates"]
  Frame["Today:<br/>+ frames,<br/>+ neighbors"]
  D17["Wed:<br/>recursion"]
  D15 --> Frame
  Frame --> D17
  classDef done fill:#e8f5e9,stroke:#388e3c
  classDef now fill:#fff3e0,stroke:#e65100,stroke-width:3px
  classDef next fill:#e3f2fd,stroke:#1976d2
  class D15 done
  class Frame now
  class D17 next
```

</div>
</div>

---

# Today's Roadmap

```mermaid
graph LR
  F["1. Frames"] --> N["2. LAG /<br/>LEAD"]
  N --> B["3. FIRST_VALUE,<br/>LAST_VALUE"]
  B --> M["4. Moving<br/>averages"]
  M --> P["5. Project 1<br/>presentations"]
  classDef step fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
  class F,N,B,M step
  classDef pres fill:#ffebee,stroke:#c62828,stroke-width:2px
  class P pres
```

Reference: PostgreSQL docs [Ch. 9.22 Window Functions](https://www.postgresql.org/docs/current/functions-window.html).

---

<!-- _class: lead -->

# Part 1: Frame Clauses

---

# The Default Frame

A window function without an explicit frame uses a default — and the default depends on whether `ORDER BY` is present.

<div class="columns">
<div>

### No ORDER BY

```sql
avg(salary) OVER (PARTITION BY dname)
```

Default frame: **entire partition**.
`avg` is the department average.

</div>
<div>

### With ORDER BY

```sql
avg(salary) OVER (
  PARTITION BY dname
  ORDER BY hire_date
)
```

Default frame: **start of partition through current row**.
`avg` is a running average.

</div>
</div>

This default surprises everyone. Once. Then it surprises them again.

<!--
The "ORDER BY changes the default frame" rule is the source of many "why does my average grow as I scroll down?" questions. The fix is to set an explicit frame.
-->

---

# Explicit Frame Syntax

```sql
function() OVER (
  PARTITION BY ...
  ORDER BY ...
  ROWS BETWEEN frame_start AND frame_end
)
```

<div class="columns">
<div>

### Frame start options

- `UNBOUNDED PRECEDING`
- `n PRECEDING`
- `CURRENT ROW`

</div>
<div>

### Frame end options

- `CURRENT ROW`
- `n FOLLOWING`
- `UNBOUNDED FOLLOWING`

</div>
</div>

```sql
ROWS BETWEEN 6 PRECEDING AND CURRENT ROW   -- 7-row trailing window
ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING   -- 3-row centered window
ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING  -- whole partition
```

---

# ROWS vs RANGE

<div class="columns">
<div>

### ROWS BETWEEN

Counts **physical rows** in the partition.

```sql
ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
```

Always returns a fixed number of rows (or fewer at boundaries).

</div>
<div>

### RANGE BETWEEN

Counts **value distance** from the ORDER BY column.

```sql
RANGE BETWEEN INTERVAL '7 days' PRECEDING
          AND CURRENT ROW
```

Returns all rows whose ORDER BY value is within the range.

</div>
</div>

`RANGE` works with `INTERVAL` for time windows — perfect for "everything in the last 7 days." Reference: [PostgreSQL Ch. 4.2.8 Window Function Calls](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS).

---

# Moving Average: A Worked Frame

```sql
-- 7-day moving average of daily enrollments
SELECT
  enrollment_date,
  count(*) AS daily,
  avg(count(*)) OVER (
    ORDER BY enrollment_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d
FROM   enrollment
GROUP BY enrollment_date
ORDER BY enrollment_date;
```

For each day, the window includes the current row and the 6 preceding rows — a 7-day rolling average.

```mermaid
graph LR
  D1["Day 1"] -. "in" .-> W["7-day frame"]
  D2["Day 2"] -. "in" .-> W
  D3["Day 3"] -. "in" .-> W
  D4["Day 4"] -. "in" .-> W
  D5["Day 5"] -. "in" .-> W
  D6["Day 6"] -. "in" .-> W
  D7["Day 7 (current)"] -. "in" .-> W
  classDef row fill:#e3f2fd,stroke:#1976d2
  classDef win fill:#fff3e0,stroke:#e65100,stroke-width:3px
  class D1,D2,D3,D4,D5,D6,D7 row
  class W win
```

---

<!-- _class: lead -->

# Part 2: LAG and LEAD

---

# Peek Backward and Forward

```sql
SELECT
  enrollment_date,
  count(*)                                AS today,
  lag(count(*), 1)  OVER (ORDER BY enrollment_date) AS yesterday,
  lead(count(*), 1) OVER (ORDER BY enrollment_date) AS tomorrow
FROM   enrollment
GROUP BY enrollment_date;
```

| date | today | yesterday | tomorrow |
|------|-------|-----------|----------|
| 2026-09-01 | 12 | NULL | 18 |
| 2026-09-02 | 18 | 12 | 25 |
| 2026-09-03 | 25 | 18 | NULL |

`lag(expr, offset, default)` and `lead(expr, offset, default)` look at neighboring rows in the window.

<!--
LAG and LEAD are the "running diff" tool. With them, "how much did enrollment change day-over-day?" becomes one expression.
-->

---

# Period-Over-Period

```sql
-- Day-over-day change
SELECT
  enrollment_date,
  count(*) AS today,
  count(*) - lag(count(*), 1, 0) OVER (ORDER BY enrollment_date) AS day_change,
  count(*) - lag(count(*), 7, 0) OVER (ORDER BY enrollment_date) AS week_change
FROM   enrollment
GROUP BY enrollment_date;
```

The third argument to `lag` is the default when there is no preceding row.
Use 0 to make boundary rows show a delta of "the value itself" rather than NULL.

---

<!-- _class: lead -->

# Part 3: FIRST_VALUE, LAST_VALUE, NTH_VALUE

---

# Refer to the Ends of the Window

```sql
SELECT
  name, dname, salary,
  first_value(salary) OVER (
    PARTITION BY dname
    ORDER BY salary DESC
  ) AS dept_top_salary,
  last_value(salary) OVER (
    PARTITION BY dname
    ORDER BY salary DESC
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS dept_bottom_salary
FROM   faculty;
```

`first_value` and `last_value` pull the value from the first or last row of the **frame** (not the partition).

---

# The LAST_VALUE Surprise

```sql
-- WRONG: returns the *current* row's salary, not the partition's last
SELECT
  name, salary,
  last_value(salary) OVER (PARTITION BY dname ORDER BY salary DESC) AS top
FROM   faculty;
```

<div class="error">

**Why it bites:** with ORDER BY and no explicit frame, the default frame is `UNBOUNDED PRECEDING ... CURRENT ROW`. The "last" row of that frame is the current row.

</div>

The fix: explicit `UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`, or use `first_value` with reversed ORDER BY.

<!--
This is one of the great SQL gotchas. Every working SQL writer trips over LAST_VALUE at least once. Drilling the explicit frame habit prevents it.
-->

---

<!-- _class: lead -->

# Part 4: Patterns

---

# 7-Day Moving Average

```sql
SELECT
  enrollment_date,
  count(*) AS daily,
  avg(count(*)) OVER (
    ORDER BY enrollment_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS ma_7d
FROM   enrollment
GROUP BY enrollment_date;
```

---

# Cumulative Distribution

```sql
SELECT
  name, gpa,
  cume_dist() OVER (ORDER BY gpa) AS cdf,
  percent_rank() OVER (ORDER BY gpa) AS pr
FROM   student;
```

`cume_dist()` returns the fraction of rows at or below the current row.
`percent_rank()` returns the rank percentile (without the current row).

Together they answer "what percentile is this row in?" without manual quartile math.

---

# Gaps and Islands

> "Find runs of consecutive enrollment days."

```sql
WITH dated AS (
  SELECT enrollment_date,
         enrollment_date - (row_number() OVER (ORDER BY enrollment_date))::int AS grp
  FROM   (SELECT DISTINCT enrollment_date FROM enrollment) d
)
SELECT min(enrollment_date) AS run_start,
       max(enrollment_date) AS run_end,
       count(*)             AS run_length
FROM   dated
GROUP BY grp
ORDER BY run_start;
```

The "row_number minus date" trick gives the same `grp` to consecutive dates.
Then GROUP BY collapses each run into one row.

<!--
Gaps-and-islands is the canonical "show off your SQL chops" problem. It uses row_number to detect runs of consecutive values — useful for active-streak reporting, time-series gap detection, and tenure calculations.
-->

---

# Wrap-up

You now have:

<div class="columns">
<div>

- Explicit frame clauses (`ROWS BETWEEN`, `RANGE BETWEEN`)
- Neighbor functions: `LAG`, `LEAD` with offset and default
- Boundary functions: `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`

</div>
<div>

- The LAST_VALUE default-frame trap
- Moving averages, percent ranks, gap-and-island patterns
- Window functions are now complete — you can write the queries dashboards demand

</div>
</div>

---

# Wednesday: Recursive Queries

We turn `WITH` into something that can iterate.

By the end of Wednesday you traverse org charts, find friends-of-friends, and reason about the termination of a SQL loop.

Read PostgreSQL docs Ch. 7.8.2 and Hirn & Grust, *A Fix for the Fixation on Fixpoints* (CIDR 2023) before class.

---

# Project 1 Presentations: Today

<div class="columns">
<div>

### Last 20 minutes

- Form into small breakout groups (4-5 students each, assigned at start of class)
- Each student presents their Project 1 in 3-4 minutes
- Group votes for the strongest presentation
- Winners present to the full class on Wednesday

</div>
<div>

### Project 2 released today

**Advanced SQL.** Due **Fri Oct 23**.

The project tests subqueries, CTEs, window functions, and (after Wednesday) recursive queries.

</div>
</div>

---

# Practice Before Wednesday

Five queries:

1. 7-day moving average of section enrollments by date.
2. Day-over-day percent change in active enrollments.
3. For each faculty member, their salary relative to the department's highest.
4. Identify runs of 3+ consecutive enrollment days.
5. For each student, the time gap between their last two enrollments.

Answers due in your repo before 8:30 AM Wed Sep 30.

---

# Questions

What is on your mind?

Project 2 released today. Project 1 winners present on Wednesday.

<!--
Project 1 presentations dominate today. Save window function questions for the practice handout and office hours.
-->
