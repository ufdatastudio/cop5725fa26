/*
 * Build every COP 5725 lecture deck.
 *
 *   node build.mjs              both targets
 *   node build.mjs --html       presentation HTML only (live SQL runner)
 *   node build.mjs --pdf        student PDF only (static, fragments expanded)
 *   node build.mjs --only day2  restrict to decks whose path matches a string
 *
 * HTML and PDF outputs land next to each slides.md / clicker.md so relative
 * image paths keep working. Both are gitignored.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { expandFragments, hasAppear } from './lib/expand-fragments.mjs';

const MARP = join('node_modules', '.bin', 'marp');

const args = process.argv.slice(2);
const onlyAt = args.indexOf('--only');
const only = onlyAt !== -1 ? args[onlyAt + 1] : null;
const wantHtml = args.includes('--html') || !args.includes('--pdf');
const wantPdf = args.includes('--pdf') || !args.includes('--html');

async function findDecks() {
  const entries = await readdir('.', { withFileTypes: true });
  const decks = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^day\d+/.test(entry.name)) continue;
    // Match `--only day2` to day2-database-history without also catching day20.
    if (only && entry.name !== only && !entry.name.startsWith(`${only}-`)) continue;
    for (const file of ['slides.md', 'clicker.md']) {
      const path = join(entry.name, file);
      if (existsSync(path)) decks.push(path);
    }
  }
  return decks.sort();
}

function marp(inputs, extraArgs, target) {
  return new Promise((resolve, reject) => {
    // stdin MUST be 'ignore': marp-cli treats an open non-TTY stdin as piped
    // markdown input and blocks forever waiting for EOF.
    const child = spawn(MARP, [...inputs, ...extraArgs], {
      stdio: ['ignore', 'inherit', 'inherit'],
      env: { ...process.env, MARP_TARGET: target },
    });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`marp exited with code ${code}`)));
  });
}

async function buildHtml(decks) {
  process.stdout.write(`HTML  ${decks.length} deck(s) … `);
  await marp(decks, ['--html'], 'html'); // outputs <deck>.html next to source
  console.log('done');
}

async function buildPdf(deck) {
  const out = join(dirname(deck), `${basename(deck, '.md')}.pdf`);
  const source = await readFile(deck, 'utf8');

  if (!hasAppear(source)) {
    await marp([deck], ['--pdf', '--allow-local-files', '-o', out], 'pdf');
    return;
  }
  // Expand appear blocks into a temp deck beside the original so relative
  // image paths still resolve.
  const tmp = join(dirname(deck), `.${basename(deck, '.md')}.pdf-src.md`);
  await writeFile(tmp, expandFragments(source, (m) => console.warn(`  warn ${deck}: ${m}`)));
  try {
    await marp([tmp], ['--pdf', '--allow-local-files', '-o', out], 'pdf');
  } finally {
    await rm(tmp, { force: true });
  }
}

const decks = await findDecks();
if (decks.length === 0) {
  console.error('no decks found' + (only ? ` matching "${only}"` : ''));
  process.exit(1);
}

if (wantHtml) await buildHtml(decks);

if (wantPdf) {
  console.log(`PDF   ${decks.length} deck(s) …`);
  let failed = 0;
  for (const deck of decks) {
    try {
      await buildPdf(deck);
      console.log(`  ok   ${deck}`);
    } catch (error) {
      failed += 1;
      console.error(`  FAIL ${deck} — ${error.message}`);
    }
  }
  if (failed) {
    console.error(`\n${failed} PDF build(s) failed.`);
    process.exit(1);
  }
}

console.log('build complete.');
