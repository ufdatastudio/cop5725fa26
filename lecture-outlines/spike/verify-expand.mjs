// Check the PDF fragment expander: a slide with 3 appear blocks must expand
// into 4 progressive slides. Run from lecture-outlines/.
import { readFile, writeFile } from 'node:fs/promises';
import { expandFragments } from '../lib/expand-fragments.mjs';

const source = await readFile('spike/test-appear.md', 'utf8');
const out = expandFragments(source);
await writeFile('_verify/test-appear.expanded.md', out);

// Body slides = chunks between `---`, minus the front matter delimiters.
const body = out.slice(out.indexOf('---', 3) + 3);
const slides = body.split(/^---$/m);

let failures = 0;
const check = (label, ok, detail) => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`);
};

check('slide 1 (3 appears) + slide 2 -> 5 slides', slides.length === 5, `got ${slides.length}`);

const reveals = slides.map((s) => [
  s.includes('First reveal'),
  s.includes('Second reveal'),
  s.includes('Third reveal'),
].filter(Boolean).length);
check('progressive reveal count is 0,1,2,3 then slide 2', reveals.join() === '0,1,2,3,0', `got ${reveals}`);
check('base content kept on every variant',
  slides.slice(0, 4).every((s) => s.includes('Base content')), '');
check('appear markers stripped from output', !out.includes('::: appear') && !/^:::/m.test(out), '');
check('variant 0 hides all reveals', !slides[0].includes('reveal —'), '');

console.log(failures ? `\n${failures} check(s) FAILED.` : '\nEXPAND OK.');
process.exit(failures ? 1 : 0);
