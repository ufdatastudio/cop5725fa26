// Headless check that mermaid blocks render to SVG in the HTML build.
// Run from lecture-outlines/ after building _verify/test-mermaid.html.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve('_verify');
const DECK = 'test-mermaid.html';
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

let failures = 0;
const check = (label, ok, detail) => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

try {
  await page.goto(base);
  await page.waitForFunction(
    () => ['done', 'error', 'none'].includes(document.documentElement.dataset.mermaid),
    { timeout: 30000 },
  );
  const state = await page.evaluate(() => document.documentElement.dataset.mermaid);
  check('mermaid runtime finished', state === 'done', `state=${state}`);

  const svgPerBlock = await page.$$eval('.mermaid', (els) =>
    els.map((e) => e.querySelectorAll('svg').length));
  check('every mermaid block became one SVG',
    svgPerBlock.length > 0 && svgPerBlock.every((n) => n === 1), `svg counts=[${svgPerBlock}]`);

  await page.goto(`${base}#2`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'spike/_shots/mermaid-s2.png' });
  console.log('  wrote spike/_shots/mermaid-s2.png');
} finally {
  await browser.close();
  server.close();
}
console.log(failures ? `\n${failures} check(s) FAILED.` : '\nMERMAID (HTML) OK.');
process.exit(failures ? 1 : 0);
