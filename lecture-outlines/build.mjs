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
import { basename, dirname, join, resolve } from 'node:path';

import { chromium } from 'playwright';

import { expandFragments, hasAppear } from './lib/expand-fragments.mjs';
import { createMermaidRenderer, hasMermaid, replaceMermaid } from './lib/render-mermaid.mjs';

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
    for (const file of ['slides.md', 'clicker.md', 'handout.md']) {
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

/*
 * PDF printer backed by one headless browser. marp-cli's own --pdf pass runs
 * the printed file through pdf-lib to stamp metadata, and that rewrite drops
 * the tagged (accessible) structure Chrome generates — image alt text never
 * reaches the PDF. Printing the marp HTML ourselves with `tagged: true`
 * keeps the accessibility tree intact.
 */
async function createPdfPrinter() {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch {
    browser = await chromium.launch();
  }
  return {
    async print(htmlPath, outPath) {
      const page = await browser.newPage();
      try {
        await page.goto(`file://${resolve(htmlPath)}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        // The bespoke template marks every non-active slide aria-hidden/inert,
        // which removes it from the accessibility tree — and therefore from
        // the tagged PDF. Print CSS shows all slides, so unhide them for the
        // accessibility tree too.
        await page.evaluate(() => {
          for (const el of document.querySelectorAll('[aria-hidden], [inert]')) {
            el.removeAttribute('aria-hidden');
            el.removeAttribute('inert');
          }
        });
        await page.pdf({
          path: outPath,
          printBackground: true,
          preferCSSPageSize: true, // the deck's @page rule carries the slide size
          tagged: true,
        });
      } finally {
        await page.close();
      }
    },
    close: () => browser.close(),
  };
}

// Build one deck to one target. Mermaid is pre-rendered to images for both
// targets, so neither build depends on a CDN at view time. `::: appear` blocks
// expand into one page per reveal step for PDF only.
async function buildDeck(deck, source, target, renderer, printer) {
  const base = basename(deck, '.md');
  const dir = dirname(deck);
  const ext = target === 'pdf' ? 'pdf' : 'html';
  const out = join(dir, `${base}.${ext}`);

  let markdown = source;
  let rewritten = false;
  if (renderer && hasMermaid(markdown)) {
    markdown = await replaceMermaid(markdown, renderer);
    rewritten = true;
  }
  if (target === 'pdf' && hasAppear(markdown)) {
    markdown = expandFragments(markdown, (m) => console.warn(`  warn ${deck}: ${m}`));
    rewritten = true;
  }

  // The PDF target converts to HTML first (still under MARP_TARGET=pdf so the
  // engine renders print variants), then prints it with the tagged option.
  const viaPrinter = target === 'pdf' && printer;
  const marpOut = viaPrinter ? join(dir, `.${base}.pdf-print.html`) : out;
  const marpArgs = target === 'pdf' && !viaPrinter
    ? ['--pdf', '--allow-local-files', '-o', marpOut]
    : ['--html', '-o', marpOut];

  const input = rewritten ? join(dir, `.${base}.${ext}-src.md`) : deck;
  if (rewritten) await writeFile(input, markdown);
  try {
    await marp([input], marpArgs, target);
    if (viaPrinter) await printer.print(marpOut, out);
  } finally {
    if (rewritten) await rm(input, { force: true });
    if (viaPrinter) await rm(marpOut, { force: true });
  }
}

async function buildAll(decks, sources, target, renderer, printer) {
  console.log(`${target.toUpperCase()}  ${decks.length} deck(s) …`);
  let failed = 0;
  for (let i = 0; i < decks.length; i += 1) {
    try {
      await buildDeck(decks[i], sources[i], target, renderer, printer);
      console.log(`  ok   ${decks[i]}`);
    } catch (error) {
      failed += 1;
      console.error(`  FAIL ${decks[i]} — ${error.message}`);
    }
  }
  return failed;
}

const decks = await findDecks();
if (decks.length === 0) {
  console.error('no decks found' + (only ? ` matching "${only}"` : ''));
  process.exit(1);
}
const sources = await Promise.all(decks.map((d) => readFile(d, 'utf8')));

// One browser-backed Mermaid renderer for the whole run, shared by both
// targets; it caches repeated diagrams.
let renderer = null;
if (sources.some(hasMermaid)) {
  try {
    process.stdout.write('mermaid renderer … ');
    renderer = await createMermaidRenderer();
    console.log('ready');
  } catch (error) {
    console.log('unavailable');
    console.warn(`  mermaid pre-render skipped: ${error.message}`);
  }
}

let printer = null;
if (wantPdf) {
  try {
    printer = await createPdfPrinter();
  } catch (error) {
    console.warn(`  tagged PDF printer unavailable, falling back to marp --pdf: ${error.message}`);
  }
}

let failed = 0;
try {
  if (wantHtml) failed += await buildAll(decks, sources, 'html', renderer);
  if (wantPdf) failed += await buildAll(decks, sources, 'pdf', renderer, printer);
} finally {
  if (renderer) await renderer.close();
  if (printer) await printer.close();
}
if (failed) {
  console.error(`\n${failed} build(s) failed.`);
  process.exit(1);
}
console.log('build complete.');
