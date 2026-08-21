---
layout: default
title: Visual Calendar
---

# Visual Calendar — Fall 2026

Month view of every class day, exam, quiz, project release, due date, and presentation.
For full topic details, readings, and rubrics see the [Schedule](schedule) and [Assignments](assignments) pages.

<style>
.cal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin: 14px 0 22px;
  font-size: 12px;
}
.cal-legend-item { display: flex; align-items: center; gap: 6px; }
.cal-legend-box {
  display: inline-block;
  width: 22px;
  height: 14px;
  border-radius: 3px;
  border-left-width: 4px;
  border-left-style: solid;
}
.cal-wrapper { overflow-x: auto; margin: 20px 0 36px; }
.cal-month {
  display: grid;
  grid-template-columns: repeat(7, minmax(120px, 1fr));
  gap: 1px;
  background: #cfd8dc;
  border: 1px solid #cfd8dc;
  min-width: 860px;
}
.cal-month-title {
  grid-column: 1 / -1;
  background: #263238;
  color: #fff;
  padding: 10px 14px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.cal-dow {
  background: #eceff1;
  color: #455a64;
  padding: 6px 8px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cal-day {
  background: #fff;
  min-height: 118px;
  padding: 4px 6px 6px;
  font-size: 11px;
  line-height: 1.3;
}
.cal-day-num { font-weight: 700; font-size: 13px; color: #263238; }
.cal-day-out { background: #f7f9fa; }
.cal-day-out .cal-day-num { color: #b0bec5; }
.cal-day-holiday { background: #f5f5f5; }
.cal-event {
  display: block;
  padding: 2px 5px;
  margin: 3px 0;
  border-radius: 3px;
  font-size: 10.5px;
  line-height: 1.25;
  border-left: 4px solid #999;
  background: #f0f0f0;
  color: #333;
}
.cal-event small { display: block; font-size: 9.5px; opacity: 0.85; }
.cal-s1 { background: #e3f2fd; border-left-color: #1976d2; color: #0d47a1; }
.cal-s2 { background: #e8f5e9; border-left-color: #388e3c; color: #1b5e20; }
.cal-s3 { background: #e0f7fa; border-left-color: #0097a7; color: #006064; }
.cal-s4 { background: #fff3e0; border-left-color: #f57c00; color: #e65100; }
.cal-s5 { background: #fce4ec; border-left-color: #c2185b; color: #880e4f; }
.cal-s6 { background: #ede7f6; border-left-color: #5e35b2; color: #311b92; }
.cal-s7 { background: #efebe9; border-left-color: #6d4c41; color: #3e2723; }
.cal-exam {
  background: #ffcdd2;
  border-left-color: #c62828;
  color: #b71c1c;
  font-weight: 700;
  border: 1.5px solid #c62828;
}
.cal-quiz { background: #fff9c4; border-left-color: #f9a825; color: #5d4037; font-weight: 600; }
.cal-due { background: #ffe0b2; border-left-color: #ef6c00; color: #bf360c; font-weight: 600; }
.cal-rel { background: #dcedc8; border-left-color: #558b2f; color: #33691e; }
.cal-pres { background: #f8bbd0; border-left-color: #ad1457; color: #880e4f; }
.cal-paper { background: #d7ccc8; border-left-color: #4e342e; color: #3e2723; font-style: italic; }
.cal-noclass { background: #e0e0e0; border-left-color: #757575; color: #424242; font-style: italic; }
@media print {
  .cal-month { page-break-inside: avoid; }
  .cal-wrapper { overflow: visible; }
}
</style>

## Legend

<div class="cal-legend" markdown="0">
  <div class="cal-legend-item"><span class="cal-legend-box cal-s1"></span> §1 Foundations</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-s2"></span> §2 SQL Mastery</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-s3"></span> §3 Programming &amp; Tools</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-s4"></span> §4 Storage &amp; Indexing</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-s5"></span> §5 Query Processing</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-s6"></span> §6 Transactions</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-s7"></span> §7 Distributed &amp; Modern</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-exam"></span> Exam</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-quiz"></span> Section Quiz</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-rel"></span> Project Released</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-due"></span> Project Due</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-pres"></span> Presentations</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-paper"></span> Paper Discussion</div>
  <div class="cal-legend-item"><span class="cal-legend-box cal-noclass"></span> No Class</div>
</div>

{::nomarkdown}

<div class="cal-wrapper">
<div class="cal-month" aria-label="August 2026">
  <div class="cal-month-title">August 2026</div>
  <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div><div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>

  <!-- Week of Aug 26 (Sun) - Aug 1 (Sat) -->
  <div class="cal-day cal-day-out"><span class="cal-day-num">26</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">27</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">28</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">29</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">30</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">31</span></div>
  <div class="cal-day"><span class="cal-day-num">1</span></div>

  <div class="cal-day"><span class="cal-day-num">2</span></div>
  <div class="cal-day"><span class="cal-day-num">3</span></div>
  <div class="cal-day"><span class="cal-day-num">4</span></div>
  <div class="cal-day"><span class="cal-day-num">5</span></div>
  <div class="cal-day"><span class="cal-day-num">6</span></div>
  <div class="cal-day"><span class="cal-day-num">7</span></div>
  <div class="cal-day"><span class="cal-day-num">8</span></div>

  <div class="cal-day"><span class="cal-day-num">9</span></div>
  <div class="cal-day"><span class="cal-day-num">10</span></div>
  <div class="cal-day"><span class="cal-day-num">11</span></div>
  <div class="cal-day"><span class="cal-day-num">12</span></div>
  <div class="cal-day"><span class="cal-day-num">13</span></div>
  <div class="cal-day"><span class="cal-day-num">14</span></div>
  <div class="cal-day"><span class="cal-day-num">15</span></div>

  <div class="cal-day"><span class="cal-day-num">16</span></div>
  <div class="cal-day"><span class="cal-day-num">17</span></div>
  <div class="cal-day"><span class="cal-day-num">18</span></div>
  <div class="cal-day"><span class="cal-day-num">19</span></div>
  <div class="cal-day"><span class="cal-day-num">20</span></div>
  <div class="cal-day">
    <span class="cal-day-num">21</span>
    <span class="cal-event cal-s1">Course Introduction <small>Syllabus, repo tour</small></span>
    <span class="cal-event cal-rel">Project 0 released</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">22</span></div>

  <div class="cal-day"><span class="cal-day-num">23</span></div>
  <div class="cal-day">
    <span class="cal-day-num">24</span>
    <span class="cal-event cal-s1">History of Databases <small>Codd 1970, GMW Ch. 1</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">25</span></div>
  <div class="cal-day">
    <span class="cal-day-num">26</span>
    <span class="cal-event cal-s1">Relational Model &amp; Data Types <small>GMW 2.1-2.3</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">27</span></div>
  <div class="cal-day">
    <span class="cal-day-num">28</span>
    <span class="cal-event cal-s1">Relational Algebra I <small>Select, Project, Sets</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">29</span></div>

  <div class="cal-day"><span class="cal-day-num">30</span></div>
  <div class="cal-day">
    <span class="cal-day-num">31</span>
    <span class="cal-event cal-s1">Relational Algebra II <small>Joins, Division</small></span>
  </div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">1</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">2</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">3</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">4</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">5</span></div>
</div>
</div>

<div class="cal-wrapper">
<div class="cal-month" aria-label="September 2026">
  <div class="cal-month-title">September 2026</div>
  <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div><div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>

  <div class="cal-day cal-day-out"><span class="cal-day-num">30</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">31</span></div>
  <div class="cal-day"><span class="cal-day-num">1</span></div>
  <div class="cal-day">
    <span class="cal-day-num">2</span>
    <span class="cal-event cal-s1">ER Modeling <small>GMW 4.1-4.5</small></span>
    <span class="cal-event cal-rel">Project 1 released</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">3</span></div>
  <div class="cal-day">
    <span class="cal-day-num">4</span>
    <span class="cal-event cal-s1">ER-to-Relations <small>GMW 4.5-4.6</small></span>
    <span class="cal-event cal-due">Project 0 due 11:59 PM</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">5</span></div>

  <div class="cal-day"><span class="cal-day-num">6</span></div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">7</span>
    <span class="cal-event cal-noclass">Labor Day — no class</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">8</span></div>
  <div class="cal-day">
    <span class="cal-day-num">9</span>
    <span class="cal-event cal-s1">Functional Dependencies <small>Closure, Keys</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">10</span></div>
  <div class="cal-day">
    <span class="cal-day-num">11</span>
    <span class="cal-event cal-s1">Normalization <small>1NF–BCNF</small></span>
    <span class="cal-event cal-quiz">§1 Quiz (Foundations)</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">12</span></div>

  <div class="cal-day"><span class="cal-day-num">13</span></div>
  <div class="cal-day">
    <span class="cal-day-num">14</span>
    <span class="cal-event cal-s2">SQL DDL &amp; SELECT Basics <small>GMW 6.1-6.2</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">15</span></div>
  <div class="cal-day">
    <span class="cal-day-num">16</span>
    <span class="cal-event cal-s2">SQL Joins <small>Inner, Outer, Semi, Anti</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">17</span></div>
  <div class="cal-day">
    <span class="cal-day-num">18</span>
    <span class="cal-event cal-s2">Aggregation, GROUP BY, HAVING <small>GMW 6.4</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">19</span></div>

  <div class="cal-day"><span class="cal-day-num">20</span></div>
  <div class="cal-day">
    <span class="cal-day-num">21</span>
    <span class="cal-event cal-s2">Subqueries <small>Correlated, EXISTS, IN</small></span>
    <span class="cal-event cal-rel">Project 2 released</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">22</span></div>
  <div class="cal-day">
    <span class="cal-day-num">23</span>
    <span class="cal-event cal-s2">CTEs (WITH) <small>PostgreSQL 7.8</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">24</span></div>
  <div class="cal-day">
    <span class="cal-day-num">25</span>
    <span class="cal-event cal-s2">Window Functions I <small>OVER, PARTITION BY</small></span>
    <span class="cal-event cal-due">Project 1 due 11:59 PM</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">26</span></div>

  <div class="cal-day"><span class="cal-day-num">27</span></div>
  <div class="cal-day">
    <span class="cal-day-num">28</span>
    <span class="cal-event cal-s2">Window Functions II <small>Frames, LAG/LEAD</small></span>
    <span class="cal-event cal-pres">Project 1 breakouts</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">29</span></div>
  <div class="cal-day">
    <span class="cal-day-num">30</span>
    <span class="cal-event cal-s2">Recursive Queries <small>WITH RECURSIVE</small></span>
    <span class="cal-event cal-paper">Paper: Hirn &amp; Grust 2023</span>
    <span class="cal-event cal-pres">Project 1 winners present</span>
  </div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">1</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">2</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">3</span></div>
</div>
</div>

<div class="cal-wrapper">
<div class="cal-month" aria-label="October 2026">
  <div class="cal-month-title">October 2026</div>
  <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div><div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>

  <div class="cal-day cal-day-out"><span class="cal-day-num">27</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">28</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">29</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">30</span></div>
  <div class="cal-day"><span class="cal-day-num">1</span></div>
  <div class="cal-day">
    <span class="cal-day-num">2</span>
    <span class="cal-event cal-s2">Views, Constraints, Triggers <small>GMW 7-8</small></span>
    <span class="cal-event cal-quiz">§2 Quiz (SQL Mastery)</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">3</span></div>

  <div class="cal-day"><span class="cal-day-num">4</span></div>
  <div class="cal-day">
    <span class="cal-day-num">5</span>
    <span class="cal-event cal-s3">Python + psycopg + pandas</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">6</span></div>
  <div class="cal-day">
    <span class="cal-day-num">7</span>
    <span class="cal-event cal-s3">DuckDB + Notebooks + Viz</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">8</span></div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">9</span>
    <span class="cal-event cal-noclass">Homecoming — no class</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">10</span></div>

  <div class="cal-day"><span class="cal-day-num">11</span></div>
  <div class="cal-day">
    <span class="cal-day-num">12</span>
    <span class="cal-event cal-s4">Storage Hierarchy <small>Disks, SSDs, Pages</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">13</span></div>
  <div class="cal-day">
    <span class="cal-day-num">14</span>
    <span class="cal-event cal-exam">Exam 1 <small>Weeks 1-8</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">15</span></div>
  <div class="cal-day">
    <span class="cal-day-num">16</span>
    <span class="cal-event cal-s4">Buffer Management <small>GMW 13.5-13.6</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">17</span></div>

  <div class="cal-day"><span class="cal-day-num">18</span></div>
  <div class="cal-day">
    <span class="cal-day-num">19</span>
    <span class="cal-event cal-s4">Row vs Column Stores</span>
    <span class="cal-event cal-paper">Paper: C-Store (VLDB 2005)</span>
    <span class="cal-event cal-rel">Project 3 released</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">20</span></div>
  <div class="cal-day">
    <span class="cal-day-num">21</span>
    <span class="cal-event cal-s4">B+ Trees I <small>Search, Bulk Loading</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">22</span></div>
  <div class="cal-day">
    <span class="cal-day-num">23</span>
    <span class="cal-event cal-s4">B+ Trees II <small>Insert, Delete, Cost</small></span>
    <span class="cal-event cal-due">Project 2 due 11:59 PM</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">24</span></div>

  <div class="cal-day"><span class="cal-day-num">25</span></div>
  <div class="cal-day">
    <span class="cal-day-num">26</span>
    <span class="cal-event cal-s4">Hash Indexes <small>Extendible, Linear</small></span>
    <span class="cal-event cal-pres">Project 2 breakouts</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">27</span></div>
  <div class="cal-day">
    <span class="cal-day-num">28</span>
    <span class="cal-event cal-s4">PostgreSQL Index Types <small>GiST, GIN, BRIN</small></span>
    <span class="cal-event cal-pres">Project 2 winners present</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">29</span></div>
  <div class="cal-day">
    <span class="cal-day-num">30</span>
    <span class="cal-event cal-s4">External Sorting <small>GMW 15.4</small></span>
    <span class="cal-event cal-quiz">§4 Quiz (Storage)</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">31</span></div>
</div>
</div>

<div class="cal-wrapper">
<div class="cal-month" aria-label="November 2026">
  <div class="cal-month-title">November 2026</div>
  <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div><div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>

  <div class="cal-day"><span class="cal-day-num">1</span></div>
  <div class="cal-day">
    <span class="cal-day-num">2</span>
    <span class="cal-event cal-s5">Joins I <small>Nested Loop, Block NL</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">3</span></div>
  <div class="cal-day">
    <span class="cal-day-num">4</span>
    <span class="cal-event cal-s5">Joins II <small>Sort-Merge, Hash, Grace</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">5</span></div>
  <div class="cal-day">
    <span class="cal-day-num">6</span>
    <span class="cal-event cal-s5">Iterator (Volcano) Model</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">7</span></div>

  <div class="cal-day"><span class="cal-day-num">8</span></div>
  <div class="cal-day">
    <span class="cal-day-num">9</span>
    <span class="cal-event cal-s5">Vectorized Execution; Opt. I <small>Boncz MonetDB/X100</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">10</span></div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">11</span>
    <span class="cal-event cal-noclass">Veterans Day — no class</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">12</span></div>
  <div class="cal-day">
    <span class="cal-day-num">13</span>
    <span class="cal-event cal-s5">Optimization II <small>Cost Est., System R</small></span>
    <span class="cal-event cal-paper">Paper: Leis 2015</span>
    <span class="cal-event cal-quiz">§5 Quiz (Optimization)</span>
    <span class="cal-event cal-due">Project 3 due 11:59 PM</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">14</span></div>

  <div class="cal-day"><span class="cal-day-num">15</span></div>
  <div class="cal-day">
    <span class="cal-day-num">16</span>
    <span class="cal-event cal-s6">Transactions &amp; ACID <small>Serializability</small></span>
    <span class="cal-event cal-rel">Final Project released</span>
    <span class="cal-event cal-pres">Project 3 breakouts</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">17</span></div>
  <div class="cal-day">
    <span class="cal-day-num">18</span>
    <span class="cal-event cal-exam">Exam 2 <small>Weeks 9-13</small></span>
  </div>
  <div class="cal-day"><span class="cal-day-num">19</span></div>
  <div class="cal-day">
    <span class="cal-day-num">20</span>
    <span class="cal-event cal-s6">Two-Phase Locking <small>Deadlocks</small></span>
    <span class="cal-event cal-pres">Project 3 winners present</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">21</span></div>

  <div class="cal-day"><span class="cal-day-num">22</span></div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">23</span>
    <span class="cal-event cal-noclass">Thanksgiving break</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">24</span>
    <span class="cal-event cal-noclass">Thanksgiving break</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">25</span>
    <span class="cal-event cal-noclass">Thanksgiving break</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">26</span>
    <span class="cal-event cal-noclass">Thanksgiving break</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">27</span>
    <span class="cal-event cal-noclass">Thanksgiving break</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">28</span>
    <span class="cal-event cal-noclass">Thanksgiving break</span>
  </div>

  <div class="cal-day"><span class="cal-day-num">29</span></div>
  <div class="cal-day">
    <span class="cal-day-num">30</span>
    <span class="cal-event cal-s6">MVCC &amp; Snapshot Isolation <small>Timestamps</small></span>
  </div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">1</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">2</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">3</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">4</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">5</span></div>
</div>
</div>

<div class="cal-wrapper">
<div class="cal-month" aria-label="December 2026">
  <div class="cal-month-title">December 2026</div>
  <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div><div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>

  <div class="cal-day cal-day-out"><span class="cal-day-num">29</span></div>
  <div class="cal-day cal-day-out"><span class="cal-day-num">30</span></div>
  <div class="cal-day"><span class="cal-day-num">1</span></div>
  <div class="cal-day">
    <span class="cal-day-num">2</span>
    <span class="cal-event cal-s6">Recovery (WAL, ARIES)</span>
    <span class="cal-event cal-s7">+ Distributed &amp; Modern</span>
    <span class="cal-event cal-paper">Papers: ARIES, DuckDB</span>
    <span class="cal-event cal-quiz">§6 Quiz (Transactions)</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">3</span>
    <span class="cal-event cal-noclass">Reading day</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">4</span>
    <span class="cal-event cal-noclass">Reading day</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">5</span>
    <span class="cal-event cal-noclass">Finals week begins</span>
  </div>

  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">6</span>
    <span class="cal-event cal-noclass">Finals week</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">7</span>
    <span class="cal-event cal-noclass">Finals week</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">8</span>
    <span class="cal-event cal-noclass">Finals week</span>
  </div>
  <div class="cal-day">
    <span class="cal-day-num">9</span>
    <span class="cal-event cal-due">Final Project due 11:59 PM</span>
  </div>
  <div class="cal-day cal-day-holiday">
    <span class="cal-day-num">10</span>
    <span class="cal-event cal-noclass">Finals week</span>
  </div>
  <div class="cal-day">
    <span class="cal-day-num">11</span>
    <span class="cal-event cal-exam">Final Exam (Exam 3) <small>10:00 AM-12:00 PM, MALA 1000</small></span>
    <span class="cal-event cal-pres">Final Project presentations</span>
  </div>
  <div class="cal-day"><span class="cal-day-num">12</span></div>

  <div class="cal-day"><span class="cal-day-num">13</span></div>
  <div class="cal-day"><span class="cal-day-num">14</span></div>
  <div class="cal-day"><span class="cal-day-num">15</span></div>
  <div class="cal-day"><span class="cal-day-num">16</span></div>
  <div class="cal-day"><span class="cal-day-num">17</span></div>
  <div class="cal-day"><span class="cal-day-num">18</span></div>
  <div class="cal-day"><span class="cal-day-num">19</span></div>
</div>
</div>

{:/nomarkdown}

**Final Exam (Exam 3):** Friday, Dec 11, 10:00 AM–12:00 PM in MALA 1000.

---

[back](index)
