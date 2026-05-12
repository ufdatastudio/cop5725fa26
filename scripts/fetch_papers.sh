#!/usr/bin/env bash
# Download open-access PDFs for COP 5725 cited papers.
#
# Some papers are behind paywalls (ACM, IEEE without subscription).
# This script grabs the freely-available ones from publisher-hosted or
# author-hosted URLs. Paywalled ones are listed at the end with a note.
#
# Usage:
#   bash scripts/fetch_papers.sh
#
# Output:
#   papers/pdfs/<name>.pdf
#   papers/pdfs/MANUAL.md (papers requiring manual download)

set -uo pipefail   # no -e: keep going on individual failures

PDF_DIR="papers/pdfs"
mkdir -p "$PDF_DIR"

fetch() {
  local name="$1"
  local url="$2"
  local out="$PDF_DIR/$name.pdf"
  if [[ -f "$out" ]]; then
    echo "[skip]   $name (exists)"
    return 0
  fi
  if curl -fsSL --max-time 30 --user-agent "Mozilla/5.0 (Macintosh)" -o "$out" "$url" 2>/dev/null; then
    if file "$out" | grep -q "PDF document"; then
      echo "[ok]     $name"
      return 0
    else
      rm "$out"
      echo "[badpdf] $name (response was not a PDF: $url)"
      return 1
    fi
  else
    rm -f "$out"
    echo "[fail]   $name (curl error: $url)"
    return 1
  fi
}

# Freely available, publisher or author-hosted
fetch hirn2023        "https://www.cidrdb.org/cidr2023/papers/p14-hirn.pdf"
fetch stonebraker2005 "https://www.vldb.org/archives/website/2005/program/paper/thu/p553-stonebraker.pdf"
fetch leis2015        "https://www.vldb.org/pvldb/vol9/p204-leis.pdf"
fetch raasveldt2019   "https://duckdb.org/pdf/SIGMOD2019-demo-duckdb.pdf"
fetch boncz2005       "https://www.cidrdb.org/cidr2005/papers/P19.pdf"
fetch hellerstein2007 "https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf"
fetch corbett2012     "https://www.usenix.org/system/files/conference/osdi12/osdi12-final-16.pdf"
fetch oneil1996       "https://www.cs.umb.edu/~poneil/lsmtree.pdf"
fetch kraska2018      "https://arxiv.org/pdf/1712.01208.pdf"
fetch neumann2011     "https://www.vldb.org/pvldb/vol4/p539-neumann.pdf"
fetch bailis2014      "https://www.vldb.org/pvldb/vol7/p181-bailis.pdf"
fetch leis2013        "https://db.in.tum.de/~leis/papers/ART.pdf"
fetch behm2022        "https://people.eecs.berkeley.edu/~matei/papers/2022/sigmod_photon.pdf"
fetch pedreira2022    "https://www.vldb.org/pvldb/vol15/p3372-pedreira.pdf"
fetch dageville2016   "https://www.snowflake.com/wp-content/uploads/2019/06/Snowflake_SIGMOD.pdf"
fetch verbitski2017   "https://web.stanford.edu/class/cs245/readings/aurora.pdf"
fetch selinger1979    "https://www.cs.berkeley.edu/~brewer/cs262/3-selinger79.pdf"

# Classic papers hosted by author / course sites (paywalled at ACM/IEEE)
fetch codd1970        "https://www.seas.upenn.edu/~zives/03f/cis550/codd.pdf"
fetch graefe1994      "https://cs-people.bu.edu/mathan/reading-groups/papers-classics/volcano.pdf"
fetch mohan1992       "https://web.stanford.edu/class/cs345d-01/rl/aries.pdf"

# Print a manual-download note for paywalled or unverified URLs
cat > "$PDF_DIR/MANUAL.md" <<'MANUAL'
# Manual Download Required

The following papers are behind paywalls or did not have a reliably-stable
public URL when this script was written. Download manually from the source
shown, and save into `papers/pdfs/` with the filename in the left column.

| Filename | Citation | Source |
|----------|----------|--------|
| `codd1970.pdf` | Codd, *A Relational Model of Data for Large Shared Data Banks*, CACM 1970 | ACM Digital Library (requires login) |
| `codd1972.pdf` | Codd, *Further Normalization of the Data Base Relational Model*, 1972 | Courant Symposia archive |
| `chen1976.pdf` | Chen, *The Entity-Relationship Model*, ACM TODS 1(1) | ACM Digital Library |
| `chamberlin1981.pdf` | Chamberlin et al., *A History and Evaluation of System R*, CACM 1981 | ACM Digital Library |
| `comer1979.pdf` | Comer, *The Ubiquitous B-Tree*, ACM Computing Surveys | ACM Digital Library |
| `bernstein1981.pdf` | Bernstein & Goodman, *Concurrency Control in Distributed DB*, ACM Comp. Surv. 1981 | ACM Digital Library |
| `graefe1994.pdf` | Graefe, *Volcano: An Extensible and Parallel Query Evaluation System*, IEEE TKDE 6(1) | IEEE Xplore |
| `kent1983.pdf` | Kent, *A Simple Guide to Five Normal Forms*, CACM 26(2), 1983 | ACM Digital Library |
| `diaconu2013.pdf` | Diaconu et al., *Hekaton: SQL Server's Memory-Optimized OLTP Engine*, SIGMOD 2013 | ACM Digital Library |
| `eisenberg2004.pdf` | Eisenberg et al., *SQL:2003 Has Been Published*, SIGMOD Record 33(1) | ACM Digital Library |
| `mumick1990.pdf` | Mumick, Pirahesh, Ramakrishnan, *The Magic of Duplicates and Aggregates*, VLDB 1990 | ACM Digital Library |
| `mohan1992.pdf` | Mohan et al., *ARIES*, ACM TODS 17(1), 1992 | ACM Digital Library (or [author copy](https://www.ics.uci.edu/~cs223/papers/p94-mohan.pdf)) |

UF library subscriptions cover ACM and IEEE — log in via the library
portal then download. Save into `papers/pdfs/` with the exact filename
above so the references in `papers/index.md` resolve.
MANUAL

echo ""
echo "Done. Fetched papers in $PDF_DIR/"
echo "Manual-download list: $PDF_DIR/MANUAL.md"
ls -1 "$PDF_DIR"/*.pdf 2>/dev/null | wc -l | xargs printf "Total PDFs downloaded: %s\n"
