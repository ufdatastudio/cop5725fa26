# Papers directory notes (internal)

This file is excluded from the published site in `_config.yml`. It holds the maintenance notes that used to appear on the public papers page.

## How PDFs get here

`pdfs/` holds a local copy of every paper cited on [index.md](index.md), named in lowercase `firstauthorYEAR.pdf` form.
The shell script `scripts/fetch_papers.sh` seeds the directory from open-access sources and is idempotent.
Papers behind paywalls require manual placement; a missing file makes the citation table on the public page resolve to a 404 page that names the file.
[pdfs/MANUAL.md](pdfs/MANUAL.md) records the source mirror for every fetched PDF.

## Link conventions

The PDF column on the public page uses relative links, so they resolve on the deployed site and when browsing the repo.
Lecture slides cite the public URL (ufdatastudio.com/cop5725fa26) so slide links keep working when decks are exported.
