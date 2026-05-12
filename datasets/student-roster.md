---
layout: default
---

# Dataset Roster

Each student claims a unique dataset slice for their semester project.
Open a pull request adding your name beside an unclaimed slice; first PR merged wins.

The slices are sized to be tractable on a laptop but rich enough to support normalization, advanced SQL, and performance tuning.

---

## Available Slices

### NYC Yellow Taxi (year-month slices)

| Slice | Approx rows | Status |
|-------|-------------|--------|
| 2024-01 yellow | ~3 M | unclaimed |
| 2024-02 yellow | ~3 M | unclaimed |
| 2024-03 yellow | ~3 M | unclaimed |
| 2024-04 yellow | ~3 M | unclaimed |
| 2024-01 green  | ~50 k | unclaimed |
| 2024-02 green  | ~50 k | unclaimed |
| 2024 FHV (Q1)  | ~5 M | unclaimed |

Source: NYC TLC Trip Record Data (Parquet on CloudFront).

### IMDb Non-Commercial Data (genre slices)

| Slice | Status |
|-------|--------|
| Action movies | unclaimed |
| Comedy movies | unclaimed |
| Documentaries | unclaimed |
| Horror movies | unclaimed |
| Sci-Fi movies | unclaimed |
| TV series (any) | unclaimed |
| Animation | unclaimed |

Source: https://datasets.imdbws.com/

### Hacker News (year slices)

| Slice | Status |
|-------|--------|
| 2020 | unclaimed |
| 2021 | unclaimed |
| 2022 | unclaimed |
| 2023 | unclaimed |
| 2024 | unclaimed |
| 2025 | unclaimed |

Source: BigQuery public dataset `bigquery-public-data.hacker_news` or the Algolia HN dump.

### OpenAlex (field-of-study slices)

| Slice | Status |
|-------|--------|
| Computer Science papers | unclaimed |
| Biology papers | unclaimed |
| Physics papers | unclaimed |
| Economics papers | unclaimed |
| Mathematics papers | unclaimed |
| Medicine papers | unclaimed |

Source: https://docs.openalex.org/

### GitHub Archive (month slices)

| Slice | Status |
|-------|--------|
| 2024-01 | unclaimed |
| 2024-06 | unclaimed |
| 2025-01 | unclaimed |
| 2025-06 | unclaimed |

Source: https://www.gharchive.org/

### Stack Overflow (tag slices)

| Slice | Status |
|-------|--------|
| Posts tagged `python` (recent year) | unclaimed |
| Posts tagged `sql` (recent year) | unclaimed |
| Posts tagged `postgresql` (recent year) | unclaimed |
| Posts tagged `javascript` (recent year) | unclaimed |
| Posts tagged `rust` (recent year) | unclaimed |

Source: BigQuery public dataset `bigquery-public-data.stackoverflow`.

### US Census ACS (state slices)

| Slice | Status |
|-------|--------|
| Florida demographics | unclaimed |
| California demographics | unclaimed |
| Texas demographics | unclaimed |
| New York demographics | unclaimed |
| (any other state) | unclaimed |

Source: https://api.census.gov

---

## Propose Your Own

If none of the slices above fit your interest, open a PR proposing your own dataset with:

- A direct download link (no signup required)
- A licence summary
- An estimate of row count and table count
- One paragraph on why this dataset is interesting

Instructor approval is required for proposed datasets.

---

## Claim Rules

1. One slice per student.
2. First PR merged wins.
3. Claim by **Friday, August 28** for Project 0 credit.
4. Late claims are still possible but you start Project 1 behind.

---

[back to datasets](index)
