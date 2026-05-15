// Headless check of the SQL runner: serves a built deck over http, opens each
// runnable slide, clicks Run, and asserts the result table renders.
// Run from lecture-outlines/:  node spike/verify-runner.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve('_verify');
const DECK = 'test-sql.html';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = createServer(async (req, res) => {
  try {
    const path = (req.url === '/' ? `/${DECK}` : req.url).split('?')[0];
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/${DECK}`;

// slide number -> substrings expected in the rendered result table
const cases = [
  { slide: 2, expect: ['42', 'duckdb'] },
  { slide: 3, expect: ['Ada', '3.9', 'Chen'] },
];

const browser = await chromium.launch();
let failures = 0;
try {
  for (const { slide, expect } of cases) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(`${base}#${slide}`);
    const runner = page.locator('section:visible .sql-runner.is-hydrated').first();

    // Arrow keys typed inside the editor must not navigate the deck.
    if (slide === 2) {
      await runner.locator('textarea').focus();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(200);
      const hash = await page.evaluate(() => location.hash);
      const stayed = hash === `#${slide}`;
      if (!stayed) failures++;
      console.log(`  ${stayed ? 'PASS' : 'FAIL'}  editor keystrokes do not navigate  [hash=${hash}]`);
    }

    await runner.locator('.sql-runner__run').click();
    // Either a result table or an error box must appear.
    await runner.locator('.sql-runner__output table, .sql-runner__error').first()
      .waitFor({ timeout: 90000 });
    const text = (await runner.locator('.sql-runner__output').innerText()).replace(/\s+/g, ' ');
    const status = await runner.locator('.sql-runner__status').innerText();
    const missing = expect.filter((s) => !text.includes(s));
    const ok = missing.length === 0;
    if (!ok) failures++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  slide ${slide}  [${status}]`);
    console.log(`        result: ${text.slice(0, 120)}`);
    if (!ok) console.log(`        missing: ${missing.join(', ')}`);
    await runner.screenshot({ path: `spike/_shots/runner-result-s${slide}.png` });
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(failures ? `\n${failures} case(s) FAILED.` : '\nSQL RUNNER OK.');
process.exit(failures ? 1 : 0);
