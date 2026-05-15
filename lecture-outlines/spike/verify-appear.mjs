// Headless check of `::: appear` reveal: loads a built deck, steps the arrow
// key, and asserts fragments fade in one at a time, then the slide advances.
// Run from lecture-outlines/:  node spike/verify-appear.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve('_verify');
const DECK = 'test-appear.html';
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

const opacities = () =>
  page.$$eval('.appear', (els) => els.map((e) => Math.round(parseFloat(getComputedStyle(e).opacity) * 100) / 100));
const advance = async () => {
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(450); // let the 0.3s CSS transition settle
};

let failures = 0;
const check = (label, ok, detail) => {
  if (!ok) failures++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

try {
  await page.goto(base);
  await page.waitForTimeout(450);

  let o = await opacities();
  check('start: all 3 fragments hidden', o.join() === '0,0,0', `opacity=[${o}]`);

  await advance();
  o = await opacities();
  check('step 1: first fragment shown', o.join() === '1,0,0', `opacity=[${o}]`);

  await advance();
  o = await opacities();
  check('step 2: first two shown', o.join() === '1,1,0', `opacity=[${o}]`);

  await advance();
  o = await opacities();
  check('step 3: all three shown', o.join() === '1,1,1', `opacity=[${o}]`);

  await advance();
  const hash = await page.evaluate(() => location.hash);
  check('step 4: advances to next slide', hash === '#2', `hash=${hash}`);
} finally {
  await browser.close();
  server.close();
}
console.log(failures ? `\n${failures} check(s) FAILED.` : '\nAPPEAR OK.');
process.exit(failures ? 1 : 0);
