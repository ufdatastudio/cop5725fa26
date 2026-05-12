---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day39 Recovery Distributed Modern — Instructor Only'
math: katex
html: true
style: |
  footer { font-size: 0.6em; }
  section.lead h1 { text-align: center; }
  table { font-size: 0.85em; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
---

<!-- _class: lead -->

# Clicker Checks
## Day39 Recovery Distributed Modern

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

A transaction committed at LSN 5000. The crash occurred at LSN 5800. The transaction's dirty pages had **not** yet been flushed to disk. After recovery, what's in the database?

A. The committed changes are lost
B. The committed changes are present (redo restored them)
C. The transaction is rolled back
D. The database is corrupt

<!-- _backgroundColor: #fff8e1 -->

<!--
Answer: B. The commit record was on disk (durability guarantee). On recovery, the redo phase walks the log and re-applies every change. The committed transaction's changes are restored.
-->

---

# 📊 Clicker Check — Answer

**B. The committed changes are present (redo restored them).**

The commit record was on disk before the crash (durability guarantee). On recovery:

1. **Analysis** identifies the committed transaction
2. **Redo** walks the log from the dirty-page LSN forward
3. Each log record corresponds to a change; redo re-applies it if the page on disk doesn't already reflect it
4. The committed transaction's changes are fully restored

This is the durability guarantee in action. As long as the log fsync'd before the crash, no committed transaction is ever lost.
