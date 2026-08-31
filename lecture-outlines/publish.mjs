/*
 * Publish built lecture decks into the deployed site tree.
 *
 *   node publish.mjs <site-dir>       e.g. node lecture-outlines/publish.mjs _site
 *
 * Copies the built deck files for each dayN-topic directory into
 * <site-dir>/lecture-outlines/dayN-topic/, plus images/ where present.
 * Decks are URL-only: nothing on the site links to them.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const SRC = fileURLToPath(new URL('.', import.meta.url));
const yaml = createRequire(import.meta.url)('js-yaml');

// One-line toggle for the instructor clicker decks.
const PUBLISH_CLICKER = true;

// Allowlist gate, read from the site's _config.yml (published_lectures).
// While non-empty, only the listed decks publish. Clear the list there to
// publish everything (PUBLISH_DATES below then takes over for date-gating).
const siteConfig = yaml.load(readFileSync(join(SRC, '..', '_config.yml'), 'utf8'));
const PUBLISH_ONLY = new Set(siteConfig.published_lectures ?? []);

// Date-gating hook (inert while empty: everything publishes). To gate a deck,
// add its directory name with the first date it may appear, e.g.
// ['day2-database-history', '2026-08-24']. Dates are in schedule.md. Pair with
// the workflow's commented schedule: trigger so gated decks appear on
// class-day mornings without a push.
const PUBLISH_DATES = new Map([]);
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const siteDir = process.argv[2];
if (!siteDir) {
  console.error('usage: node publish.mjs <site-dir>');
  process.exit(1);
}

const files = ['slides.html', 'slides.pdf',
  ...(PUBLISH_CLICKER ? ['clicker.html', 'clicker.pdf'] : [])];

// Present for some decks only; copied when built, never reported missing.
const optionalFiles = ['handout.pdf'];

let published = 0;
let missing = 0;
const decks = readdirSync(SRC, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^day\d+-/.test(e.name))
  .map((e) => e.name)
  .sort();

for (const deck of decks) {
  if (PUBLISH_ONLY.size && !PUBLISH_ONLY.has(deck)) {
    console.log(`  hold ${deck} (not in PUBLISH_ONLY)`);
    continue;
  }
  const gate = PUBLISH_DATES.get(deck);
  if (gate && today < gate) {
    console.log(`  hold ${deck} (publishes ${gate})`);
    continue;
  }
  const dest = join(siteDir, 'lecture-outlines', deck);
  mkdirSync(dest, { recursive: true });
  for (const file of files) {
    const from = join(SRC, deck, file);
    if (!existsSync(from)) {
      console.error(`  MISSING ${deck}/${file}`);
      missing += 1;
      continue;
    }
    cpSync(from, join(dest, file));
  }
  for (const file of optionalFiles) {
    const from = join(SRC, deck, file);
    if (existsSync(from)) cpSync(from, join(dest, file));
  }
  const images = join(SRC, deck, 'images');
  if (existsSync(images)) cpSync(images, join(dest, 'images'), { recursive: true });
  published += 1;
}

console.log(`published ${published} deck(s) into ${join(siteDir, 'lecture-outlines')}`);
if (missing) process.exit(1);
