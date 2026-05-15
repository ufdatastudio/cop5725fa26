/*
 * PDF build step: expand `::: appear :::` blocks into progressive slides.
 *
 * The HTML deck reveals an appear block on a click. The student PDF cannot
 * click, so each build step becomes its own page: a slide with K appear blocks
 * expands to K+1 pages — base content, then one more block revealed per page.
 *
 * Scope: top-level (non-nested) appear blocks. A nested appear is revealed
 * together with its parent. Fenced code is skipped, so `:::` or `---` inside a
 * code block is never mistaken for syntax.
 */

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const SEPARATOR = /^-{3,}\s*$/;
const APPEAR_OPEN = /^:::+\s+appear\b/;
const APPEAR_CLOSE = /^:::+\s*$/;

/** Split body lines into slide chunks (lines between `---` separators). */
function splitSlides(lines) {
  const slides = [[]];
  let fence = '';
  lines.forEach((line, i) => {
    const m = line.match(FENCE);
    if (!fence && m) fence = m[1][0];
    else if (fence && m && m[1][0] === fence) fence = '';
    const prevBlank = i === 0 || lines[i - 1].trim() === '';
    if (!fence && SEPARATOR.test(line) && prevBlank) {
      slides.push([]);
    } else {
      slides[slides.length - 1].push(line);
    }
  });
  return slides;
}

/** Locate top-level appear blocks within one slide's lines. */
function findAppearBlocks(lines) {
  const blocks = [];
  let depth = 0;
  let start = -1;
  let fence = '';
  let nested = false;
  lines.forEach((line, i) => {
    const m = line.match(FENCE);
    if (!fence && m) { fence = m[1][0]; return; }
    if (fence && m && m[1][0] === fence) { fence = ''; return; }
    if (fence) return;
    if (APPEAR_OPEN.test(line)) {
      if (depth === 0) start = i;
      else nested = true;
      depth += 1;
    } else if (APPEAR_CLOSE.test(line) && depth > 0) {
      depth -= 1;
      if (depth === 0) blocks.push({ start, end: i });
    }
  });
  return { blocks, nested };
}

/** Expand one slide into 1 chunk (no appear) or K+1 progressive chunks. */
function expandSlide(lines, warn) {
  const { blocks, nested } = findAppearBlocks(lines);
  if (blocks.length === 0) return [lines];
  if (nested) warn('nested "::: appear" — inner block reveals with its parent');

  const variants = [];
  for (let revealed = 0; revealed <= blocks.length; revealed += 1) {
    const out = [];
    let i = 0;
    let b = 0;
    while (i < lines.length) {
      if (b < blocks.length && i === blocks[b].start) {
        // Revealed blocks emit their inner content; the `:::` lines are dropped.
        if (b < revealed) out.push(...lines.slice(blocks[b].start + 1, blocks[b].end));
        i = blocks[b].end + 1;
        b += 1;
      } else {
        out.push(lines[i]);
        i += 1;
      }
    }
    variants.push(out);
  }
  return variants;
}

/**
 * Expand every `::: appear` block in a Marp deck for PDF export.
 * @param {string} source raw slides.md contents
 * @param {(msg: string) => void} [warn] optional warning sink
 * @returns {string} markdown with appear blocks expanded into separate slides
 */
export function expandFragments(source, warn = () => {}) {
  const lines = source.split('\n');

  let head = '';
  let body = lines;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end !== -1) {
      head = lines.slice(0, end + 1).join('\n') + '\n';
      body = lines.slice(end + 1);
    }
  }

  const expanded = splitSlides(body).flatMap((slide) => expandSlide(slide, warn));
  return head + expanded.map((s) => s.join('\n')).join('\n---\n');
}

/** True when a deck has at least one appear block worth expanding. */
export function hasAppear(source) {
  return source.split('\n').some((line) => APPEAR_OPEN.test(line));
}
