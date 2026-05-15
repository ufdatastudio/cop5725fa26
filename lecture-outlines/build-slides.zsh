#!/usr/bin/env zsh
#
# build-slides.zsh — build COP 5725 lecture decks.
#
# Produces an HTML deck (for presenting, with the live SQL runner) and a PDF
# deck (the static student handout) for each lecture. The npm build libraries
# (marp-cli and the markdown-it plugins) are installed automatically on the
# first run.
#
# Usage:
#   ./build-slides.zsh                 every deck, HTML + PDF
#   ./build-slides.zsh day10           one deck (matches day10-sql-ddl-select)
#   ./build-slides.zsh day6 day7       several specific decks
#   ./build-slides.zsh --html          every deck, HTML only
#   ./build-slides.zsh --pdf day20     one deck, PDF only
#   ./build-slides.zsh --help

set -euo pipefail

# Always operate from this script's own directory (the lecture-outlines folder),
# so the build works no matter where it is invoked from.
cd "${0:A:h}"

print_usage() {
  print "build-slides.zsh — build COP 5725 lecture decks"
  print ""
  print "Usage:"
  print "  ./build-slides.zsh                 every deck, HTML + PDF"
  print "  ./build-slides.zsh day10           one deck"
  print "  ./build-slides.zsh day6 day7       several specific decks"
  print "  ./build-slides.zsh --html          HTML only (add deck names to limit)"
  print "  ./build-slides.zsh --pdf           PDF only"
}

targets=()
decks=()
for arg in "$@"; do
  case "$arg" in
    -h|--help)    print_usage; exit 0 ;;
    --html|--pdf) targets+=("$arg") ;;
    -*)           print -u2 "build-slides: unknown option '$arg'"; print_usage; exit 1 ;;
    *)            decks+=("$arg") ;;
  esac
done

# Make sure the build libraries are installed.
if ! command -v npm >/dev/null 2>&1; then
  print -u2 "build-slides: 'npm' not found — install Node.js first: https://nodejs.org"
  exit 1
fi
if [[ ! -d node_modules ]]; then
  print "Installing slide build dependencies (marp-cli, markdown-it plugins) …"
  npm install
fi

# With deck names, build each one; with none, build every deck.
if (( ${#decks} > 0 )); then
  for deck in "${decks[@]}"; do
    print "── building ${deck}"
    node build.mjs --only "$deck" "${targets[@]}"
  done
else
  print "── building all decks"
  node build.mjs "${targets[@]}"
fi

print "Done. Outputs are written next to each slides.md / clicker.md."
