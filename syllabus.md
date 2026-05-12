---
layout: default
---

# COP 5725 Database Management Fall 2026 #

**Class Number:** 27221 | **Section:** 7LL9


**Class Hours:** Monday, Wednesday, Friday 2nd Period _(8:30 AM to 9:20 AM)_<br/>
**Location:** [Matherly Hall, MALA 1000](https://campusmap.ufl.edu/#/index/1024)

**Exams:** Exam 1 on Wed, Oct 14; Exam 2 on Wed, Nov 18; Final Exam during the finals period (December 5-11, 2026)


## Instructors

Dr. Christan Grant
- **Email:** christan@ufl.edu
- **Office Hours**: By appointment (booking link [Book Here](https://outlook.office.com/bookwithme/user/6e844770c73a436780726b9e85b5582d@ufl.edu?anonymous&ep=plink))

---


<font color="red">**Note: Any email messages to the professors or teaching assistants must include `cop5725fa26` in the subject line.**</font>
Any email without this string in the subject line will likely be filtered as junk.
You may also contact class members through the course [Canvas](https://ufl.instructure.com/).


## Course Information


### Course Description
This course covers the principles and practice of managing large-scale databases.
Students will study the relational model, query languages, storage structures, indexing, query processing, query optimization, transaction management, concurrency control, and recovery.
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


## Course Pre-Requisites

**Prerequisites:** COP 3530 (Data Structures and Algorithms) and COP 4600 (Operating Systems), or equivalent.
Students should be comfortable with programming and have a basic understanding of computer architecture and operating systems concepts.
Familiarity with SQL is helpful but not required.


### Course Objectives
By the end of the course, students will be able to:

1. Write complex SQL queries and design normalized relational schemas.
2. Explain how database storage, indexing, and buffer management function at the systems level.
3. Analyze query execution plans and apply optimization techniques.
4. Reason about transaction isolation, concurrency control protocols, and recovery algorithms.
5. Compare architectural tradeoffs between row-oriented (PostgreSQL) and column-oriented (DuckDB) systems.


### Student Outcomes
Through participation of the course, students will be able to design, implement, and evaluate a computing-based solution to meet a given set of computing requirements in the context of the program's discipline. (ABET Criterion 3.2)

Outcomes will be evaluated through assignments, projects, and examinations.


## Required Textbooks and Software

### Textbook

**Required:**

- Hector Garcia-Molina, Jeffrey Ullman, and Jennifer Widom. *Database Systems: The Complete Book*, 2nd Edition. Pearson, 2008.

[Per 8.003](https://www.flbog.edu/wp-content/uploads/2019/11/Regulation_8.003_Final-1.pdf)
Instructional materials for this course consist of only those materials specifically reviewed, selected, and assigned by the instructor(s). The instructor(s) is only responsible for these instructional materials.


### Software

The course will require the use of GitHub and other cloud services that will be provided without additional fees.
- **PostgreSQL 16+** for transactional database exercises
- **DuckDB** for analytical query exercises
- **Python 3.11+** with `uv` package manager
- **Git/GitHub** for version control
- **psql** and **DuckDB CLI** for interactive querying

### Required Computer
UF student computing requirement: <https://news.it.ufl.edu/education/student-computing-requirements-for-uf/>.
You will need an electronic device while attending lectures.


## Course Schedule

Lectures combine traditional instruction, live SQL demonstrations, class discussions, and hands-on exercises.
Participation is required to get the most out of the class.
Many of the graded class _activities_ will not be announced.

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
| 15 | **Thanksgiving Break** |
| 16 | MVCC, Recovery, Distributed and Modern Systems |
| Finals | Final Exam (Exam 3) and Final Project Presentations |

See the [Schedule](schedule) page for detailed week-by-week topics and deliverables.


## Attendance Policy, Class Expectations, and Makeup Policy

Students are expected to attend class and participate regularly.

The grade breakdown will be as follows:

| |Percentage|
| --- |--- |
| In-class clicker checks (participation) | 15%|
| Project 1 (Schema + SQL) | 4%|
| Project 2 (Advanced SQL) | 6%|
| Project 3 (Indexing + Query Plans) | 10%|
| Final Project (capstone) | 15%|
| Exam 1 (Oct 14) | 15%|
| Exam 2 (Nov 18) | 15%|
| Final Exam (Exam 3, finals week) | 20%|
|         |**100%**|

Projects increase in weight as the semester progresses, reflecting growing scope and difficulty.
Project 0 is a pass/fail setup check; failure to submit reduces the final grade by one full letter.

**In-class clicker checks** are short comprehension questions delivered through the UF-supported clicker system multiple times per lecture.
They verify that students are following along; grading is on participation, not correctness.
The lowest 3-5 class days are dropped from the participation total to absorb absences and tech issues.
Project 0 is a pass/fail setup check and is not weighted in the table above; failure to submit reduces the final grade by one full letter.

**Projects** are individual and modeled on real industry tasks.
Each student creates a private GitHub repository on their own account named `cop5725fa26-project` and adds `cegme` as Admin so the TA and instructor can review.
Each student claims a unique dataset from the approved roster, and successive projects build on the same dataset.
Project 0 is setup and dataset claim (P/F).
Project 1 is schema design and SQL ETL ("load this new source").
Project 2 is advanced SQL analytics ("write the metrics").
Project 3 is indexing and query optimization ("this dashboard is slow").
The Final Project ships a complete artifact (analytics report, data API, dashboard, or pipeline).
Each project has a public rubric and a peer-grading rubric subset.
After each deadline, students present in small breakout groups; the highest-scored student in each group then presents to the full class.

**Exams** cover conceptual understanding of database internals, algorithms, and tradeoffs.
Exam 1 covers Sections 1-3 (foundations, SQL, programming).
Exam 2 covers Sections 4-5 (storage, indexing, query processing).
The Final Exam is cumulative, weighted toward Sections 6-7 (transactions, concurrency, recovery, distributed and modern systems).

### Late Policy

All assignments must be completed and submitted before their due date.
Exceptions can be made for significant hardships as dictated by university policy (e.g. medical issues, hurricanes, death in the family, etc) with supporting documentation.

Late policies are often at odds with the ability of students to receive feedback.
I strongly encourage all students to submit assignments at the posted due date.
If assignments are not completed on time, the frequency of assignments will mount, causing an undue burden on students and staff.
After the due date, students may submit assignments until they are graded.
This typically means students will have 1-3 days to complete the assignment.
If the assignment is submitted after grading starts, it will not be accepted.
The grading time will not be announced, and we will not accept assignments after grading begins.


#### Policy on Regrade and Makeup Requests ####
If a mistake was made on one of your grades, or if you feel a question on an exam was in error, **you have one (1) week to bring it to our attention**.
This is to avoid a wave of requests for changes to be made at the end of a semester, long after that part of the class has passed.
All regrade requests must be delivered electronically.
In your regrade request, carefully describe why you feel that you were scored unfairly and/or incorrectly.
Even if you discussed the grading issue orally with someone, the written discussion must be self-contained and be able to be evaluated based only on what is included in the email.
_Please note that when an exam/assignment is brought with grading questions, we may examine the entire assignment, and your final grade may end up lower._


### Grading Policy

Grade cut-offs will be at or below [the scale published by the University of Florida](https://catalog.ufl.edu/UGRD/academic-regulations/grades-grading-policies/).

| Grades |  Percentage (>) |
| ------ | --------------- |
|A  | 94 |
|A- | 90 |
|B+ | 87 |
|B  | 84 |
|B- | 80 |
|C+ | 77 |
|C  | 74 |
|C- | 70 |
|D+ | 67 |
|D  | 64 |
|D-	| 61 |
|E  | 0 |


### Grade questions

Grading questions for assignments should first be brought to the TA that initially did the grading.
If talking to the TA does not resolve your question, please see one of the instructors.
All grading questions must be brought to our attention within one week of the release of the grades.
_Please note that when an exam/assignment is brought with grading questions, we may examine the entire assignment, and your final grade may end up lower._

Excused and make-up assignments will be handled on a case-by-case basis.
Exceptions can be made for significant hardships as dictated by university policy (e.g. medical issues, hurricanes, death in the family, etc) with supporting documentation.


### Integrity Examples

Below is a selection of example situations on the border of being or not being an academic integrity violation.
Note that this is not an exhaustive list, and the instructors will report any potential integrity violations <https://teach.ufl.edu/resource-library/academic-integrity-at-uf/>.


**Use of CoPilot, ChatGPT, and other generative AI systems should be clearly declared.
Any prompt used should be preserved and clearly included.
Failure to do so will be considered an academic integrity violation.**

|Situation | Integrity Violation? |
| ------------------- | ------- |
| Students A and B meet and work on their assignments together. Neither student prepared anything in advance, and the resulting work is identical. | Yes |
|Students A and B create drafts of their assignment independently and get together to compare answers and discuss their understanding of the material. Each person decides independently whether to make changes that are discussed. | No |
|Students A and B agree to prepare drafts of their assignments independently, but only Student A does. Student A shares her draft with Student B, who reviews it and offers suggestions for improvement. |Yes|
|Students A and B agree that student A will work the even problems and Student B will work the odd problems. They share their work. |Yes|
|Students A and B agree that Student A will work on a read function, and Student B will work on the sorting function. They share their solutions. |Yes|
|Student A has completed a project and is helping Student B complete the same project. Student A explains to Student B what Student B's code actually does, which is different than what Student B thinks the code does. Student B determines how to modify the code independently.|No|
|Student A has completed a project and is helping Student B complete the same project. Student B is having trouble getting one part of the program to work, so Student A texts Student B three lines of their solution. |Yes|
|Student A has completed a project and is helping Student B complete the same project. Student B has difficulty getting the program to work, so student A tells student B exactly what to type for several lines. |Yes|
|Student A has completed a project and is helping Student B complete the same project. Student B has difficulty getting the program to work, so Student A suggests that Student B use a specific debugging strategy (e.g., "Print out the contents of the variable"). |No|
|Student A has completed a project and is helping Student B complete the same project. Student A shows Student B an example program in the online textbook that will be helpful in figuring out the solution to the problem. |No|
|Student A publishes solutions to an assignment on a public Internet page. |Yes|
|Students A and B work on a project together. After they have finished it, student A takes the code and modifies it so the programs do not appear to be identical.|Yes|
|Student A copies and pastes code from a public Internet page but changes the variable names. |Yes|
| Student A uses a public Internet page to help them understand a concept and then writes their own code to implement it. |No|
| Student A uses an AI system to generate an idea or solution without proper attribution. | Yes |

## Important Messages ##

### Students Requiring Accommodations
Students with disabilities who experience learning barriers and would like to request academic
accommodations should connect with the Disability Resource Center by visiting
<https://disability.ufl.edu/students/get-started/>. It is important for students to share their
accommodation letter with their instructor and discuss their access needs, as early as possible in the
semester.

### Course Evaluation
Students are expected to provide professional and respectful feedback on the quality of instruction in
this course by completing course evaluations online via GatorEvals. Guidance on how to give feedback
in a professional and respectful manner is available at <https://gatorevals.aa.ufl.edu/students/>.
Students will be notified when the evaluation period opens, and can complete evaluations through the
email they receive from GatorEvals, in their Canvas course menu under GatorEvals, or via
<https://ufl.bluera.com/ufl/>. Summaries of course evaluation results are available to students at
<https://gatorevals.aa.ufl.edu/public-results/>

### In-Class Recording
Students are allowed to record video or audio of class lectures. However, the purposes for which these
recordings may be used are strictly controlled. The only allowable purposes are (1) for personal
educational use, (2) in connection with a complaint to the university, or (3) as evidence in, or in
preparation for, a criminal or civil proceeding. All other purposes are prohibited. Specifically, students
may not publish recorded lectures without the written consent of the instructor.
A "class lecture" is an educational presentation intended to inform or teach enrolled students about a
particular subject, including any instructor-led discussions that form part of the presentation, and
delivered by any instructor hired or appointed by the University, or by a guest instructor, as part of a
University of Florida course. A class lecture does not include lab sessions, student presentations,
clinical presentations such as patient history, academic exercises involving solely student participation,
assessments (quizzes, tests, exams), field trips, private conversations between students in the class or
between a student and the faculty or lecturer during a class session.

Publication without permission of the instructor is prohibited. To "publish" means to share, transmit,
circulate, distribute, or provide access to a recording, regardless of format or medium, to another
person (or persons), including but not limited to another student within the same class section.
Additionally, a recording, or transcript of a recording, is considered published if it is posted on or
uploaded to, in whole or in part, any media platform, including but not limited to social media, book,
magazine, newspaper, leaflet, or third-party note/tutoring services. A student who publishes a
recording without written consent may be subject to a civil cause of action instituted by a person
injured by the publication and/or discipline under UF Regulation 4.040 Student Honor Code and
Student Conduct Code


### University Honesty Policy
UF students are bound by The Honor Pledge which states, "We, the members of the University of Florida
community, pledge to hold ourselves and our peers to the highest standards of honor and integrity by
abiding by the Honor Code. On all work submitted for credit by students at the University of Florida,
the following pledge is either required or implied: "On my honor, I have neither given nor received
unauthorized aid in doing this assignment." The Honor Code
(<https://sccr.dso.ufl.edu/process/student-conduct-code/>) specifies a number of behaviors that are in
violation of this code and the possible sanctions. Furthermore, you are obligated to report any
condition that facilitates academic misconduct to appropriate personnel. If you have any questions or
concerns, please consult with the instructor or TAs in this class.


### Commitment to a Safe and Inclusive Learning Environment
The Herbert Wertheim College of Engineering values broad diversity within our community and is
committed to individual and group empowerment, inclusion, and the elimination of discrimination. It
is expected that every person in this class will treat one another with dignity and respect regardless of
gender, sexuality, disability, age, socioeconomic status, ethnicity, race, and culture.
If you feel like your performance in class is being impacted by discrimination or harassment of any
kind, please contact your instructor or any of the following:

- Your academic advisor or Graduate Program Coordinator
- HWCOE Human Resources, 352-392-0904, <student-support-hr@eng.ufl.edu>
- Pam Dickrell, Associate Dean of Student Affairs, 352-392-2177, <pld@ufl.edu>
- Toshikazu Nishida, Associate Dean of Academic Affairs, 352-392-0943, <nishida@eng.ufl.edu>

### Software Use
All faculty, staff, and students of the University are required and expected to obey the laws and legal
agreements governing software use. Failure to do so can lead to monetary damages and/or criminal
penalties for the individual violator. Because such violations are also against University policies and
rules, disciplinary action will be taken as appropriate. We, the members of the University of Florida
community, pledge to uphold ourselves and our peers to the highest standards of honesty and integrity.

### Student Privacy
There are federal laws protecting your privacy with regard to grades earned in courses and on
individual assignments. For more information, please see: <https://registrar.ufl.edu/ferpa.html>



## Campus Resources (Health and Wellness)

### U Matter, We Care:
Your well-being is important to the University of Florida. The U Matter, We Care initiative is
committed to creating a culture of care on our campus by encouraging members of our community
to look out for one another and to reach out for help if a member of our community is in need. If
you or a friend is in distress, please contact umatter@ufl.edu so that the U Matter, We Care Team
can reach out to the student in distress. A nighttime and weekend crisis counselor is available by
phone at 352-392-1575. The U Matter, We Care Team can help connect students to the many other
helping resources available including, but not limited to, Victim Advocates, Housing staff, and the
Counseling and Wellness Center. Please remember that asking for help is a sign of strength. In case
of emergency, call 9-1-1.

### Counseling and Wellness Center:
Visit <https://counseling.ufl.edu>, and 392-1575; and the University
Police Department: 392-1111 or 9-1-1 for emergencies.

### Sexual Discrimination, Harassment, Assault, or Violence
If you or a friend has been subjected to sexual discrimination, sexual harassment, sexual assault,
or violence contact the [Office of Title IX Compliance](https://titleix.ufl.edu/), located at Yon Hall Room 427, 1908
Stadium Road, (352) 273-1094, <title-ix@ufl.edu>

### Sexual Assault Recovery Services (SARS)
Student Health Care Center, 392-1161.

### University Police Department
Call at 392-1111 (or 9-1-1 for emergencies), or
<http://www.police.ufl.edu/>.


## Campus Resources (Academic)

#### E-learning technical support
Call  352-392-4357 (select option 2) or e-mail to <Learningsupport@ufl.edu>. <https://elearning.ufl.edu/>.

##### Career Connections Center
Located in the Reitz Union, 392-1601. Career assistance and counseling;
<https://career.ufl.edu>.

##### Library Support
Visit <http://cms.uflib.ufl.edu/ask>. Various ways to receive assistance with respect to
using the libraries or finding resources.

##### Teaching Center
Located in Broward Hall, 392-2010 or 392-6420. General study skills and tutoring.
<https://teachingcenter.ufl.edu/>.

##### Writing Studio
Located in 302 Tigert Hall, 846-1138. Help brainstorming, formatting, and writing papers.
<https://writing.ufl.edu/writing-studio/>.

##### Student Complaints Campus
Visit <https://sccr.dso.ufl.edu/policies/student-honor-code-studentconduct-code/>; <https://care.dso.ufl.edu>.

##### On-Line Student Complaints
<https://distance.ufl.edu/getting-help/>; <https://distance.ufl.edu/state-authorization-status/#studentcomplaint>.

### Giving Quality Feedback
This page describes the types of grading feedback <https://citt.ufl.edu/resources/assessing-student-learning/providing-effective-feedback/types-of-feedback/>

_Please note the contents of this syllabus may change without warning._

---

[back](index)
