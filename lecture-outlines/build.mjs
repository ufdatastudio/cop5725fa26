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

async function buildPdf(deck, source, renderer) {
  const out = join(dirname(deck), `${basename(deck, '.md')}.pdf`);
  const pdfArgs = ['--pdf', '--allow-local-files', '-o', out];

  let markdown = source;
  let rewritten = false;
  // Pre-render Mermaid to images: foreignObject SVG labels do not survive print.
  if (renderer && hasMermaid(markdown)) {
    markdown = await replaceMermaid(markdown, renderer);
    rewritten = true;
  }
  // Expand `::: appear` blocks into one slide per reveal step.
  if (hasAppear(markdown)) {
    markdown = expandFragments(markdown, (m) => console.warn(`  warn ${deck}: ${m}`));
    rewritten = true;
  }
  if (!rewritten) {
    await marp([deck], pdfArgs, 'pdf');
    return;
  }
  // Write the transformed deck beside the original so relative images resolve.
  const tmp = join(dirname(deck), `.${basename(deck, '.md')}.pdf-src.md`);
  await writeFile(tmp, markdown);
  try {
    await marp([tmp], pdfArgs, 'pdf');
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
  const sources = await Promise.all(decks.map((d) => readFile(d, 'utf8')));

  // One browser-backed Mermaid renderer for the whole run, if any deck uses it.
  let renderer = null;
  if (sources.some(hasMermaid)) {
    try {
      process.stdout.write('      starting mermaid renderer … ');
      renderer = await createMermaidRenderer();
      console.log('ok');
    } catch (error) {
      console.log('unavailable');
      console.warn(`      mermaid pre-render skipped: ${error.message}`);
    }
  }

  let failed = 0;
  try {
    for (let i = 0; i < decks.length; i += 1) {
      try {
        await buildPdf(decks[i], sources[i], renderer);
        console.log(`  ok   ${decks[i]}`);
      } catch (error) {
        failed += 1;
        console.error(`  FAIL ${decks[i]} — ${error.message}`);
      }
    }
  } finally {
    if (renderer) await renderer.close();
  }
  if (failed) {
    console.error(`\n${failed} PDF build(s) failed.`);
    process.exit(1);
  }
}

console.log('build complete.');
