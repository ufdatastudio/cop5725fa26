# Day 2 Images

13 of 16 images are present in this directory, fetched by
`scripts/fetch_day2_images.sh` from Wikipedia/Wikimedia Commons and
official press kits.

## Present

| Filename | Source |
|----------|--------|
| `codd.jpg` | Wikimedia Commons — Edgar F. Codd page |
| `stonebraker.jpg` | Wikimedia Commons — Michael Stonebraker page |
| `gray.jpg` | Wikimedia Commons — Jim Gray (Computing in the 21st Century 2006) |
| `selinger.jpg` | Wikimedia Commons — Pat Selinger at Stonebraker70 |
| `chamberlin.jpg` | Wikimedia Commons — Don Chamberlin |
| `ritchie-thompson.jpg` | Wikimedia Commons — Ken Thompson (2019) |
| `dean-ghemawat.jpg` | Wikimedia Commons — Jeff Dean (2025) |
| `cutting.jpg` | Wikimedia Commons — Doug Cutting |
| `bell-labs-murray-hill.jpg` | Wikimedia Commons — Nokia Bell Labs (2023) |
| `ibm-almaden.jpg` | Wikimedia Commons — IBM Research Almaden |
| `postgresql-logo.png` | PostgreSQL wiki press kit |
| `duckdb-logo.png` | DuckDB.org official logo |

## Still to Source Manually

Wikipedia's API returned no thumbnail for these (no image on the page); use these starting points:

| Filename | Suggested source |
|----------|------------------|
| `ullman.jpg` | Stanford CS faculty page http://infolab.stanford.edu/~ullman/ — or ACM Turing Award 2020 page for Aho/Ullman |
| `aho.jpg` | Columbia CS faculty page http://www.cs.columbia.edu/~aho/ — or ACM Turing Award 2020 page |
| `berkeley-soda.jpg` | Wikipedia commons has Soda Hall images; search `Soda_Hall_Berkeley` directly on commons |

For ACM Turing Award photos, see https://amturing.acm.org/award_winners/aho_5077907.cfm and https://amturing.acm.org/award_winners/ullman_5077395.cfm.

## Re-fetching

```bash
bash scripts/fetch_day2_images.sh
```

The script is idempotent. After adding the three missing images by hand,
re-run to verify nothing else changed.

All images are used **only** in the Day 2 lecture slides; they are not
distributed on the public course site. The slides go to Canvas.
