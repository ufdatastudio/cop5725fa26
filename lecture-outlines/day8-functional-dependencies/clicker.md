---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day8 Functional Dependencies — Instructor Only'
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
## Day8 Functional Dependencies

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Given $F = \{A \rightarrow B, B \rightarrow C, CD \rightarrow E\}$, what is $\{A, D\}^+$?

A. $\{A, D\}$
B. $\{A, B, D\}$
C. $\{A, B, C, D\}$
D. $\{A, B, C, D, E\}$

<!--
Answer: D. A→B adds B. B→C adds C. CD→E fires because both C and D are now in the closure. So we end up with all 5 attributes. Students often stop at C (option C) forgetting that CD→E becomes applicable after C joins.
-->

---

# Clicker Check — Answer

**D. $\{A, B, C, D, E\}$.**

Step through:
1. Start: $\{A, D\}$
2. $A \rightarrow B$: result becomes $\{A, B, D\}$
3. $B \rightarrow C$: result becomes $\{A, B, C, D\}$
4. $CD \rightarrow E$: now applicable because both $C$ and $D$ are in result → adds $E$
5. Result: $\{A, B, C, D, E\}$

Students who pick C stop at step 3, forgetting that the FD $CD \rightarrow E$ becomes applicable only **after** step 2 puts C in the closure. The closure algorithm keeps re-scanning F until no new attributes appear.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

Given $F = \{A \rightarrow B, B \rightarrow C\}$ and $G = \{A \rightarrow B, A \rightarrow C\}$. Are $F$ and $G$ equivalent?

A. Yes — both have the same closure
B. No — F derives B → C; G does not
C. Only if the relation has specific data
D. Cannot be determined without more FDs

<!--
Answer: B. F derives B→C directly. G has no FD starting with B; B+ under G is {B} alone. So G does NOT derive B→C. They have different closures. This is exactly the trap minimal-cover construction catches.
-->

---

# Clicker Check — Answer

**B. No — F derives B → C; G does not.**

Two FD sets are equivalent only if they have the **same closure**.

- $F = \{A \rightarrow B, B \rightarrow C\}$: under $F$, $\{B\}^+ = \{B, C\}$, so $B \rightarrow C$ holds.
- $G = \{A \rightarrow B, A \rightarrow C\}$: under $G$, $\{B\}^+ = \{B\}$ alone — no FD starts with $B$. So $B \rightarrow C$ does **not** hold.

Both sets derive $A \rightarrow C$ (trap A), but they disagree on whether $B \rightarrow C$ holds. Not equivalent.

This is exactly the kind of subtle non-equivalence minimal-cover construction is designed to catch.
