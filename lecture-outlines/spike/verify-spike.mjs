// Headless verification of the DuckDB-WASM spike: serves the spike over http
// (Web Workers are blocked on file://), loads it in Chromium, and asserts every
// case passes. Exits non-zero on any failure.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const server = createServer(async (req, res) => {
  try {
    const path = (req.url === '/' ? '/duckdb-spike.html' : req.url).split('?')[0];
    const body = await readFile(join(here, path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('  [page error]', e.message));

let spike;
try {
  await page.goto(`http://localhost:${port}/duckdb-spike.html`);
  await page.waitForFunction(() => window.__spike?.done === true, { timeout: 90000 });
  spike = await page.evaluate(() => window.__spike);
} finally {
  await browser.close();
  server.close();
}

if (spike.error) {
  console.error('LOAD ERROR:', spike.error);
}
for (const r of spike.results ?? []) {
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`);
  if (!r.ok) console.log('        ', r.detail.replace(/\n/g, '\n         '));
}
console.log(spike.ok ? '\nSPIKE OK — DuckDB-WASM runs in-browser.' : '\nSPIKE FAILED.');
process.exit(spike.ok ? 0 : 1);
