// Render specific Marp slides to PNGs for visual checks.
// Run from lecture-outlines/:  node spike/screenshot.mjs <build.html> <slides> [tag]
//   <build.html>  path to a built deck, relative to lecture-outlines/
//   <slides>      comma-separated 1-based slide numbers, e.g. 1,2,7
//   [tag]         output filename prefix (default: shot)
// PNGs land in spike/_shots/.
import { mkdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { chromium } from 'playwright';

const [build, slideArg, tag = 'shot'] = process.argv.slice(2);
if (!build || !slideArg) {
  console.error('usage: node spike/screenshot.mjs <build.html> <slides> [tag]');
  process.exit(1);
}

const outDir = 'spike/_shots';
await mkdir(outDir, { recursive: true });
const name = basename(build).replace(/\.html$/, '');

const browser = await chromium.launch();
for (const n of slideArg.split(',')) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`file://${resolve(build)}#${n}`);
  await page.waitForTimeout(700);
  const out = `${outDir}/${tag}-${name}-s${n}.png`;
  await page.screenshot({ path: out });
  console.log('wrote', out);
  await page.close();
}
await browser.close();
