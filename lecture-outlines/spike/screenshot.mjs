// Render specific Marp slides to PNGs for visual checks.
// Run from lecture-outlines/:  node spike/screenshot.mjs <build.html> <slides> [tag]
//   <build.html>  path to a built deck, relative to lecture-outlines/
//   <slides>      comma-separated 1-based slide numbers, e.g. 1,2,7
//   [tag]         output filename prefix (default: shot)
// PNGs land in spike/_shots/. The deck is served over http so client-side
// mermaid renders before the screenshot is taken.
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const [build, slideArg, tag = 'shot'] = process.argv.slice(2);
if (!build || !slideArg) {
  console.error('usage: node spike/screenshot.mjs <build.html> <slides> [tag]');
  process.exit(1);
}

const ROOT = resolve('.');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const outDir = 'spike/_shots';
await mkdir(outDir, { recursive: true });
const name = basename(build).replace(/\.html$/, '');

const browser = await chromium.launch();
for (const n of slideArg.split(',')) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`${base}/${build}#${n}`);
  // Wait for the mermaid runtime to finish (or report nothing to render).
  await page
    .waitForFunction(
      () => ['done', 'none', 'error'].includes(document.documentElement.dataset.mermaid),
      { timeout: 30000 },
    )
    .catch(() => {});
  await page.waitForTimeout(400);
  const out = `${outDir}/${tag}-${name}-s${n}.png`;
  await page.screenshot({ path: out });
  console.log('wrote', out);
  await page.close();
}
await browser.close();
server.close();
