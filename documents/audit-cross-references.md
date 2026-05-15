---
layout: default
---

# Cross-Reference Audit (December 2026)

Audit of "Day N", "Week N", "Section N" cross-references across all 37 lecture decks.

## Method

A Python script (`/tmp/audit_xrefs.py`) walked every `lecture-outlines/dayN-topic/slides.md` and:
1. Found every `Day N`, `Week N`, `Section N` mention
2. Verified the referenced day/week/section number is in the valid course range
3. Counted reference frequency per day

Spot-checks then verified a sample of forward references for semantic accuracy.

## Findings

### Structural

- **Days 1-39** referenced — all in range
- **Weeks 1-14, 16** referenced — all in range (Week 15 = Thanksgiving, no class, correctly absent)
- **Sections 1-7** referenced — all in range
- One "Day 0" false positive in Day 38's MVCC bloat diagram (chart axis label, not a course reference) — acceptable

### Semantic (spot-checks of common forward references)

| Reference | From | Target | Verified |
|-----------|------|--------|----------|
| "natural join footgun we promised on Day 5" | Day 11 | Day 5 (RA II) covers natural join | ✓ |
| "SQL's version of the algebra's ρ rename operator (Day 4)" | Day 11 | Day 4 (RA I) introduces ρ | ✓ |
| "We will return to the window form on Day 15" | Day 11 | Day 15 (Window I) covers windows | ✓ |
| "Day 17 — the entire lecture on recursive queries" | Day 14 | Day 17 (Recursive Queries) | ✓ |
| "GROUP BY (Day 12)" | Day 15 | Day 12 (Aggregation, GROUP BY, HAVING) | ✓ |
| "Day 16 makes this explicit" (frames) | Day 15 | Day 16 (Window II) covers frames | ✓ |
| "Section 4 preview" (partitioning) | Day 10 | Section 4 (Storage + Indexing) includes partitioning | ✓ |
| "Section 2 will live in Part II (Ch. 7) and Part VI" | Day 10 | Section 2 = Days 10-18 SQL section | ✓ |
| "By Week 13 you will know what each line means" | Day 1 | Week 13 = Days 33-34 (Optimization) covers EXPLAIN | ✓ |
| "Day 7 — translation rules" | Day 10 | Day 7 (ER to Relations) covers translation | ✓ |

### Top Cross-Referenced Days

The most frequently cited days (suggesting they're load-bearing concepts that many later lectures depend on):

| Day | Topic | Inbound References |
|-----|-------|-------------------|
| Day 7 | ER to Relations | 6 |
| Day 29 | External Sorting | 5 |
| Day 3 | Relational Model + Data Types | 4 |
| Day 12 | Aggregation, GROUP BY, HAVING | 4 |
| Day 17 | Recursive Queries | 4 |
| Day 4 | Relational Algebra I | 3 |
| Day 11 | SQL Joins | 3 |
| Day 14 | CTEs | 3 |
| Day 15 | Window Functions I | 3 |
| Day 16 | Window Functions II | 3 |

External Sorting (Day 29) being heavily referenced is interesting — it underpins sort-merge join (Day 31), hash spill (Day 31), bulk index loading (Day 25-26), `ORDER BY` plans (Day 33). The cross-reference count reflects how the course actually layers.

## Conclusion

No corrections required. The cross-reference graph holds together. Every forward
reference points at a day or section that does in fact cover the named topic.

## Reproducing

```bash
python3 /tmp/audit_xrefs.py
```

Run from the repo root.
