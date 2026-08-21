# COP 5725 Database Management Systems — Simple Syllabus entry sheet (Fall 2026)

This is an internal sheet for filling out the UF Simple Syllabus template. It is not the student-facing syllabus.

## How to use this file

- Each numbered section maps to a field in the UF Simple Syllabus template at <https://ufl.simplesyllabus.com>. Open it through Canvas and copy the content into the matching field.
- Sections under "Auto-populated" are inserted and locked by the template. Do not paste them. Verify them only.
- Enter the Garcia-Molina textbook in the UF Textbook Adoptions system so the Required Materials section fills in.
- Publish, not just save, before about July 6, 2026. That is the 45-day public-posting deadline for the August 20, 2026 start of classes.
- Replace the TODO placeholders for office location and phone before publishing.

---

## 1. Instructor Information

Dr. Christan Grant

Email: christan@ufl.edu

Office location: TODO add building and room

Phone: TODO add a direct or department main line

Office hours: By appointment. Booking link: <https://outlook.office.com/bookwithme/user/6e844770c73a436780726b9e85b5582d@ufl.edu?anonymous&ep=plink>

Teaching assistant: Ray Chen

TA email: chenz1@ufl.edu

TA office hours: TODO add once scheduled

Course communication: Any email to the instructor or teaching assistants must include `cop5725fa26` in the subject line. Messages without it are likely filtered as junk. You may also reach classmates and staff through Canvas at <https://ufl.instructure.com/>.

## 2. Course Description

A short catalog description auto-populates from Course Details. Add this expanded version as a component if you want the topic list visible to students.

This course covers the principles and practice of managing large-scale databases.
Students study the relational model, query languages, storage structures, indexing, query processing, query optimization, transaction management, concurrency control, and recovery.
The course balances theoretical foundations with hands-on experience using PostgreSQL and DuckDB, giving students practical exposure to both transactional (OLTP) and analytical (OLAP) database systems.

Topics include:

1. Relational model, data types, and relational algebra
2. Entity-relationship modeling and translation to relations
3. Functional dependencies and normalization
4. SQL fundamentals: DDL, joins, aggregation, subqueries
5. Advanced SQL: common table expressions, window functions, recursive queries, views, triggers
6. Python and DuckDB for query exploration and visualization
7. Storage hierarchy and file organization
8. Row stores versus column stores
9. Indexing structures: B+ trees, hash indexes, PostgreSQL GiST/GIN/BRIN
10. External sorting and join algorithms
11. Query execution: iterator model and vectorized execution
12. Query optimization and cost estimation
13. Transaction management and ACID properties
14. Concurrency control: locking, timestamps, MVCC, snapshot isolation
15. Crash recovery and write-ahead logging (ARIES)
16. Distributed databases and modern analytical systems

## 3. Prerequisites

This may appear in the auto-populated Course Details. The content is ready if a field exists.

Prerequisites: COP 3530 (Data Structures and Algorithms) and COP 4600 (Operating Systems), or equivalent.
Students should be comfortable with programming and have a basic understanding of computer architecture and operating systems concepts.
Familiarity with SQL is helpful but not required.

## 4. Course Goals and Objectives

By the end of the course, students will be able to:

1. Write complex SQL queries and design normalized relational schemas.
2. Explain how database storage, indexing, and buffer management function at the systems level.
3. Analyze query execution plans and apply optimization techniques.
4. Reason about transaction isolation, concurrency control protocols, and recovery algorithms.
5. Compare architectural tradeoffs between row-oriented (PostgreSQL) and column-oriented (DuckDB) systems.

## 5. Expectations and Student Learning Outcomes

Through participation in the course, students will be able to design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program's discipline. (ABET Criterion 3.2)

Outcomes will be evaluated through assignments, projects, and examinations.

## 6. Required Materials

The textbook auto-populates from UF Textbook Adoptions. Enter it there:

Hector Garcia-Molina, Jeffrey Ullman, and Jennifer Widom. *Database Systems: The Complete Book*, 2nd Edition. Pearson, 2008.

A Note on Materials (notes field):

Per [Regulation 8.003](https://www.flbog.edu/wp-content/uploads/2019/11/Regulation_8.003_Final-1.pdf), instructional materials for this course consist of only those materials specifically reviewed, selected, and assigned by the instructor. The instructor is only responsible for these instructional materials.

Software is provided without additional fees: PostgreSQL 16+ for transactional exercises, DuckDB for analytical exercises, Python 3.11+ with the `uv` package manager, Git and GitHub for version control, and the `psql` and DuckDB command-line tools for interactive querying.

Materials and Supplies Fees: None.

Required computer: the UF student computing requirement applies, <https://news.it.ufl.edu/education/student-computing-requirements-for-uf/>. You will need an electronic device during lectures.

## 7. Methods of Evaluation

Lectures combine traditional instruction, live SQL demonstrations, class discussions, and hands-on exercises.
Participation is required to get the most out of the class, and many graded class activities will not be announced in advance.

| Component | Percentage |
| --- | --- |
| Quizzes (drop lowest) | 15% |
| Project 1 (Schema and SQL) | 4% |
| Project 2 (Advanced SQL) | 6% |
| Project 3 (Indexing and Query Plans) | 10% |
| Final Project (capstone) | 15% |
| Exam 1 (Oct 14) | 15% |
| Exam 2 (Nov 18) | 15% |
| Final Exam (Exam 3, finals week) | 20% |
| Total | 100% |

Quizzes are short in-class quizzes that discuss important concepts from the lectures.
Each quiz asks questions about the section just completed.
There are five quizzes across the semester; the lowest score is dropped and the best four count toward the quiz weight.

Projects are individual and modeled on real industry tasks.
Each student creates a private GitHub repository on their own account named `cop5725fa26-project` and adds `cegme` (instructor) and `rkc8626` (TA) as Admins so the TA and instructor can review.
Each student claims a unique dataset from the approved roster, and successive projects build on the same dataset.
Project 0 is setup and dataset claim, graded pass or fail and not weighted above; failure to submit reduces the final grade by one full letter.
Project 1 is schema design and SQL ETL ("load this new source").
Project 2 is advanced SQL analytics ("write the metrics").
Project 3 is indexing and query optimization ("this dashboard is slow").
The Final Project ships a complete artifact such as an analytics report, data API, dashboard, or pipeline.
Each project has a public rubric and a peer-grading rubric subset.
After each deadline, students present in small breakout groups, and the highest-scored student in each group presents to the full class.
Projects increase in weight as the semester progresses, reflecting growing scope and difficulty.

Exams cover conceptual understanding of database internals, algorithms, and tradeoffs.
Exam 1 covers Sections 1 to 3 (foundations, SQL, programming).
Exam 2 covers Sections 4 to 5 (storage, indexing, query processing).
The Final Exam is cumulative and weighted toward Sections 6 to 7 (transactions, concurrency, recovery, distributed and modern systems).

## 8. Grading Scale

Grade cut-offs will be at or below the scale published by the University of Florida.

| Grade | Percentage (greater than) |
| --- | --- |
| A  | 94 |
| A- | 90 |
| B+ | 87 |
| B  | 84 |
| B- | 80 |
| C+ | 77 |
| C  | 74 |
| C- | 70 |
| D+ | 67 |
| D  | 64 |
| D- | 61 |
| E  | 0 |

The standard UF grade-points link is included in the auto-populated University Policies section, so the manual catalog link from the old syllabus can be dropped.

## 9. Course Schedule

Key dates: Exam 1 on Wednesday, October 14; Exam 2 on Wednesday, November 18; Final Exam on Friday, December 11, 10:00 AM to 12:00 PM in MALA 1000.

| Week | Topic |
| ---- | ----- |
| 1  | Welcome (Aug 21 only) |
| 2  | Database History, Relational Model, Data Types, Algebra |
| 3  | Relational Algebra, ER Modeling, ER to Relations |
| 4  | Functional Dependencies and Normalization |
| 5  | SQL Fundamentals |
| 6  | Advanced SQL I: Subqueries, CTEs, Window Functions |
| 7  | Advanced SQL II: Window Frames, Recursive Queries, Views |
| 8  | Programming with Python, psycopg, DuckDB, Visualization |
| 9  | Exam 1 (Oct 14), Storage Hierarchy |
| 10 | Row vs Column Stores, B+ Trees |
| 11 | Hash Indexes, PostgreSQL Index Types, External Sorting |
| 12 | Join Algorithms and Iterator Model |
| 13 | Vectorized Execution and Query Optimization |
| 14 | Transactions, Exam 2 (Nov 18), Two-Phase Locking |
| 15 | Thanksgiving Break |
| 16 | MVCC, Recovery, Distributed and Modern Systems |
| Finals | Final Exam (Exam 3) and Final Project Presentations |

Detailed week-by-week topics and deliverables: <https://ufdatastudio.com/cop5725fa26/schedule>

The contents of this syllabus may change with notice to the class.

---

The remaining sections have no native Simple Syllabus field. Add each one with "Add a New Component" and give it the heading shown.

## 10. Component: Late Policy

All assignments must be completed and submitted before their due date.
Exceptions can be made for significant hardships as dictated by university policy, for example medical issues, hurricanes, or a death in the family, with supporting documentation.

Late policies are often at odds with the ability of students to receive feedback.
I strongly encourage all students to submit assignments at the posted due date.
If assignments are not completed on time, the frequency of assignments will mount and cause an undue burden on students and staff.
After the due date, students may submit assignments until grading begins.
This typically gives students 1 to 3 days to complete the assignment.
Assignments submitted after grading starts will not be accepted, and the grading time will not be announced.

## 11. Component: Regrade and Makeup Requests

If a mistake was made on one of your grades, or if you feel a question on an exam was in error, you have one week to bring it to our attention.
This avoids a wave of requests at the end of the semester, long after that part of the class has passed.
All regrade requests must be delivered electronically.
In your request, carefully describe why you feel you were scored unfairly or incorrectly.
Even if you discussed the issue orally with someone, the written request must be self-contained and able to be evaluated based only on what is included in the email.
When an exam or assignment is brought for a grading question, we may examine the entire assignment, and your final grade may end up lower.

Grading questions for assignments should first be brought to the TA who did the original grading.
If that does not resolve the question, see one of the instructors.
Excused and make-up assignments are handled on a case-by-case basis, with the same hardship exceptions and supporting documentation described in the late policy.

## 12. Component: Generative AI Policy

Use of CoPilot, ChatGPT, and other generative AI systems must be clearly declared.
Any prompt used must be preserved and clearly included with the submission.
Failure to do so is an academic integrity violation.

## 13. Component: Academic Integrity Examples

Below is a selection of example situations on the border of being or not being an academic integrity violation.
This is not an exhaustive list, and the instructors will report any potential violations, <https://sccr.dso.ufl.edu/process/student-honor-code/>.

| Situation | Integrity Violation? |
| --- | --- |
| Students A and B meet and work on their assignments together. Neither student prepared anything in advance, and the resulting work is identical. | Yes |
| Students A and B create drafts independently and get together to compare answers and discuss their understanding. Each person decides independently whether to make changes. | No |
| Students A and B agree to prepare drafts independently, but only Student A does. Student A shares her draft with Student B, who reviews it and offers suggestions. | Yes |
| Students A and B agree that Student A will work the even problems and Student B the odd problems. They share their work. | Yes |
| Students A and B agree that Student A will work on a read function and Student B on the sorting function. They share their solutions. | Yes |
| Student A is helping Student B with the same project. Student A explains what Student B's code actually does, which differs from what B thinks. Student B modifies the code independently. | No |
| Student A is helping Student B with the same project. Student B cannot get one part to work, so Student A texts three lines of their solution. | Yes |
| Student A is helping Student B with the same project. Student B has trouble, so Student A tells Student B exactly what to type for several lines. | Yes |
| Student A is helping Student B with the same project. Student A suggests a debugging strategy, for example "print out the contents of the variable." | No |
| Student A is helping Student B with the same project. Student A shows Student B an example from the online textbook that helps figure out the solution. | No |
| Student A publishes solutions to an assignment on a public Internet page. | Yes |
| Students A and B work on a project together. After finishing, Student A modifies the code so the programs do not appear identical. | Yes |
| Student A copies and pastes code from a public Internet page but changes the variable names. | Yes |
| Student A uses a public Internet page to understand a concept and then writes their own code to implement it. | No |
| Student A uses an AI system to generate an idea or solution without proper attribution. | Yes |

---

## Auto-populated by Simple Syllabus (verify only, do not paste)

- Course Details: title, class number, section, meeting time, and credits from the registrar and catalog.
- Required Materials: from the UF Textbook Adoptions system. Enter the textbook there.
- University Policies and Resources: Honor Code, disability and DRC accommodations, GatorEvals course evaluations, in-class recording policy, software use, student privacy and FERPA, U Matter We Care and the campus health and wellness resources, and the academic resources (e-learning support, Career Connections Center, library support, teaching center, writing studio, and student complaint procedures). This section is locked.
- Attendance and make-up policy: the standard UF statement.

## Before you publish

- Fill the office location and phone in section 1.
- Fill the TA office hours in section 1 once scheduled.
- Enter the textbook in Textbook Adoptions so section 6 populates.
- Confirm the auto-populated meeting time and section match the registrar.
- Publish, not just save, before about July 6, 2026.
