#!/usr/bin/env bash
# Download CC-licensed images for the Day 2 (Database History) lecture
# from Wikipedia / Wikimedia Commons via the REST API summary endpoint.
#
# Usage: bash scripts/fetch_day2_images.sh

set -uo pipefail

IMG_DIR="lecture-outlines/day2-database-history/images"
mkdir -p "$IMG_DIR"

# Fetch via Wikipedia REST API: returns a page's "thumbnail" URL (CC-licensed
# leading image). We then download that JPEG/PNG to the lecture's image folder.
fetch_wp() {
  local out_name="$1"
  local wp_title="$2"
  local out="$IMG_DIR/$out_name"

  if [[ -f "$out" ]]; then
    echo "[skip]   $out_name (exists)"
    return 0
  fi

  local api="https://en.wikipedia.org/api/rest_v1/page/summary/$wp_title"
  local img_url
  img_url=$(curl -fsSL --max-time 15 -A "Mozilla/5.0 (cop5725fa26 educational fetcher)" "$api" \
            | grep -o '"originalimage":{"source":"[^"]*"' \
            | head -1 \
            | sed 's|.*"source":"||;s|"$||')

  if [[ -z "$img_url" ]]; then
    # Fallback to thumbnail
    img_url=$(curl -fsSL --max-time 15 -A "Mozilla/5.0 (cop5725fa26 educational fetcher)" "$api" \
              | grep -o '"thumbnail":{"source":"[^"]*"' \
              | head -1 \
              | sed 's|.*"source":"||;s|"$||')
  fi

  if [[ -z "$img_url" ]]; then
    echo "[fail]   $out_name (no image in Wikipedia page $wp_title)"
    return 1
  fi

  if curl -fsSL --max-time 30 -A "Mozilla/5.0 (cop5725fa26 educational fetcher)" -o "$out" "$img_url"; then
    echo "[ok]     $out_name ($img_url)"
  else
    rm -f "$out"
    echo "[fail]   $out_name (download failed: $img_url)"
    return 1
  fi
}

# Direct fetch (when we already know the URL)
fetch_direct() {
  local out_name="$1"
  local url="$2"
  local out="$IMG_DIR/$out_name"

  if [[ -f "$out" ]]; then
    echo "[skip]   $out_name (exists)"
    return 0
  fi

  if curl -fsSL --max-time 30 -A "Mozilla/5.0 (cop5725fa26 educational fetcher)" -o "$out" "$url"; then
    echo "[ok]     $out_name"
  else
    rm -f "$out"
    echo "[fail]   $out_name (download failed: $url)"
    return 1
  fi
}

# People — Wikipedia article titles
fetch_wp codd.jpg              "Edgar_F._Codd"
fetch_wp stonebraker.jpg       "Michael_Stonebraker"
fetch_wp gray.jpg              "Jim_Gray_(computer_scientist)"
fetch_wp selinger.jpg          "Patricia_Selinger"
fetch_wp chamberlin.jpg        "Donald_D._Chamberlin"
fetch_direct ullman.jpg        "https://infolab.stanford.edu/~ullman/gifs/ullman2.jpg"
fetch_direct aho.jpg           "https://awards.acm.org/binaries/content/gallery/acm/awards/photo/a-b/aho_1046358"
fetch_wp ritchie-thompson.jpg  "Ken_Thompson"
fetch_wp dean-ghemawat.jpg     "Jeff_Dean"
fetch_wp cutting.jpg           "Doug_Cutting"

# Places — Wikipedia
fetch_wp bell-labs-murray-hill.jpg "Bell_Labs"
fetch_wp ibm-almaden.jpg           "IBM_Almaden_Research_Center"
fetch_direct berkeley-soda.jpg     "https://www.berkeley.edu/wp-content/uploads/2024/04/soda.jpg"

# Logos — official press / repo
fetch_direct postgresql-logo.png   "https://wiki.postgresql.org/images/3/30/PostgreSQL_logo.3colors.120x120.png"
fetch_direct duckdb-logo.png       "https://duckdb.org/images/logo-dl/DuckDB_Logo.png"

echo ""
echo "Done."
ls -1 "$IMG_DIR"/*.{jpg,jpeg,png} 2>/dev/null | wc -l | xargs printf "Images in folder: %s\n"
