---
marp: true
theme: default
paginate: true
backgroundColor: #fff8e1
footer: 'Clicker Checks — Day18 Views Constraints Triggers — Instructor Only'
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
## Day18 Views Constraints Triggers

**Instructor Only — Do Not Distribute**

Interleave these question/answer pairs into the lecture at the indicated points.

---

# 📊 Clicker Check

<!-- _backgroundColor: #fff8e1 -->

You have a view `recent_orders AS SELECT * FROM orders WHERE status = 'open'`. Then you write `INSERT INTO recent_orders (id, customer_id, status) VALUES (1, 5, 'closed')`. What happens?

A. Error — views are read-only
B. Inserts into `orders`; the new row is not visible via the view (status mismatch)
C. Inserts into a separate `recent_orders` table
D. Inserts with status overridden to 'open'

<!--
Answer: B. PostgreSQL's "simple updatable views" allow INSERT/UPDATE/DELETE if the view is straightforward (single base table, no aggregates). The insert goes to the base table. But since the new row has status='closed', it won't appear via the view that filters status='open'. Add WITH CHECK OPTION to reject such inserts.
-->

---

# Clicker Check — Answer

**B. Inserts into `orders`; the new row is not visible via the view.**

PostgreSQL's "simple updatable views" allow INSERT/UPDATE/DELETE on views built from a single base table with no aggregation, DISTINCT, or GROUP BY.

The INSERT lands in the underlying `orders` table. But since `status='closed'` doesn't satisfy the view's `WHERE status='open'`, the new row is invisible via the view.

To **prevent** inserts that wouldn't be visible via the view, add `WITH CHECK OPTION`:

```sql
CREATE VIEW recent_orders AS
  SELECT * FROM orders WHERE status = 'open'
  WITH CHECK OPTION;
-- now INSERT ... status='closed' raises an error
```
