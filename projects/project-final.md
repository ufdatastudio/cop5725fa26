---
layout: default
---

# Final Project: Capstone

| | |
|---|---|
| **Weight** | 15% of course grade |
| **Released** | Monday, November 16, 2026 |
| **Due** | Wednesday, December 9, 2026 at 11:59 PM |

---

## Goal

Take the dataset you have grown across Projects 0-3 and **ship something complete**.

You choose what to ship. Four shapes are pre-approved; you may propose your own with instructor approval.

By the end you will have a public artifact you can show prospective employers — the work of one student's semester turned into a portfolio piece.

---

## Choose One Shape

### Shape A — Analytics Report (4-6 pages)

A short paper that answers a substantive question using your dataset.

Required elements:
- Introduction with the research question
- Schema description (1 page)
- Methods section explaining your SQL approach
- Results section with at least 4 charts
- Discussion section with limitations and future work
- Embedded SQL for every claim

Format: PDF generated from LaTeX, Quarto, or Markdown.

### Shape B — Data API

A small REST API backed by your schema.

Required elements:
- FastAPI / Flask / similar framework
- At least 5 endpoints exposing different queries from Projects 1-2
- OpenAPI / Swagger documentation
- At least one endpoint using pagination
- Connection pooling appropriate for the workload
- Containerized via Docker

The API should run locally with one command.

### Shape C — Dashboard

An interactive dashboard backed by your data.

Required elements:
- Streamlit, Dash, Observable, or similar
- At least 4 distinct interactive views (filters, drilldowns)
- At least one chart that uses a window function from Project 2
- A loading state for queries > 1 second
- Hosted locally; instructions for one-command run

### Shape D — Pipeline

An automated daily-refresh pipeline.

Required elements:
- A scheduler (cron, GitHub Actions, Airflow, Prefect)
- Idempotent loader that handles re-runs gracefully
- At least one transformation step (cleaning, deduplication, enrichment)
- A materialized view or summary table refreshed each run
- Validation step that fails the run on schema drift
- A simple alerting mechanism (log, email, Slack — any one)

### Custom Shape — Propose Your Own

If none of A-D fits your interests, open an issue on your repo with:
- One paragraph describing the shape
- Why it's not already covered above
- What deliverables you'd produce

Instructor approval required by Wed Nov 25 (one week before Thanksgiving).

---

## Deliverables (all shapes)

```
cop5725fa26-project/
├── ... (from previous projects)
├── final/
│   ├── README.md            # onboarding-quality
│   ├── architecture.md      # one diagram
│   ├── ARTIFACT/            # the actual shape — folder layout depends on choice
│   └── demo.mp4 or demo.webm
└── README.md                # top-level updated
```

### `final/README.md`

Written **as if onboarding the next engineer**.

Required sections:
- What the artifact does
- How to install (every dependency, every command)
- How to run (the command(s) to make it go)
- How to test (the smoke test, the demo flow)
- Where to look in the code if you want to extend it
- Known limitations

### `final/architecture.md`

One page with:
- A single architecture diagram (mermaid is fine)
- Three paragraphs explaining the diagram
- Honest sections on "what didn't work" and "what I'd do differently with another month"

### `final/demo.mp4` or `final/demo.webm`

A 3-5 minute screen recording showing the artifact working.

Tools: macOS QuickTime, Loom, OBS, anything that produces a playable MP4 or WebM.

Audio narration explaining what's on screen.

### Updated top-level `README.md`

Add a "Final Project: <Title>" section at the top with:
- One-paragraph elevator pitch
- Link to `final/demo.mp4`
- Quick-start command

---

## Submission

```bash
git add final/ README.md
git commit -m "Final project: <your title>"
git tag final
git push origin main final
```

---

## Presentations

In the final exam slot on Friday, Dec 11, 10:00 AM-12:00 PM in MALA 1000:

- 5 minutes per student
- 3 minutes of demo (the artifact running)
- 2 minutes of architecture / what was hard / what you learned

Slides optional. The demo is what matters.

Class vote selects the strongest capstone. Small recognition; no grade impact.

---

## Grading Rubric

100 points total.

| Component | Points | Criteria |
|-----------|--------|----------|
| **Artifact completeness** | 30 | All required elements for your chosen shape present and working |
| **Working demo** | 20 | Video shows the artifact running; clean audio narration |
| **Architecture document** | 15 | Diagram + explanation; honest "what didn't work" |
| **README quality** | 15 | A new engineer can install and run without help |
| **Code quality** | 10 | Readable; idiomatic for the language/framework used |
| **Integration with semester work** | 10 | Visibly uses Project 1 schema, Project 2 queries, Project 3 tuning |

### Peer Grading

Peer reviewers grade only the **demo and README** dimensions:

1. **Demo clarity** (0-5): can you tell what the artifact does after watching?
2. **Reproducibility** (0-5): could you re-run it from the README?
3. **Polish** (0-5): does it look like a finished piece of work?

Peer scores normalized and contribute **30%**; instructor + TA **70%**.

---

## Why This Matters

When you apply for internships or jobs, recruiters skim:

1. Your most recent project
2. Whether it has a working demo
3. Whether the README lets them try it

The Final Project is calibrated to produce exactly the artifact you can put at the top of that pile. Treat it that way.

---

## Common Pitfalls

- **Choosing too ambitious a shape** — a working Shape A beats a half-built Shape D. Match scope to the four weeks you have.
- **Demo video on day-of** — record it Monday or Tuesday before the deadline. Re-record if it's rough.
- **README assumes I know your project** — write it for the cold reader.
- **Skipping the architecture doc** — even if your design is "obvious", documenting it forces the reflection that improves the work.
- **Last-minute changes that break things** — `git tag final` should point to a version you have actually tested.

---

## FAQ

**Q: Can I switch shapes mid-project?**
A: Yes, but be careful — the four weeks pass quickly. Switching after Thanksgiving usually means choosing a less ambitious shape.

**Q: Can I work with another student on a single project?**
A: No. Each student ships their own artifact. You may discuss approaches and review each other's READMEs (that's healthy peer feedback).

**Q: My artifact requires cloud resources (GPU, large storage, etc.).**
A: Use UF HiPerGator if applicable. Otherwise, document the cloud requirements clearly and provide a local-mode that runs on a laptop for grading.

**Q: Can my Final Project become a published portfolio item?**
A: Yes — make your repo public after the semester ends if your dataset license allows. This is one of the cleanest things to point to in interviews.

---

[back](index)
