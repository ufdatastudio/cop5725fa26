/*
 * Generate the annotated ER build-animation frames for Days 6 and 7.
 *
 *   node gen-er-frames.mjs        (run from lecture-outlines/)
 *
 * Each build is a fixed-coordinate Chen-style diagram; every element carries
 * the frame number where it enters. Frame k renders all elements with
 * step <= k, gives the entering elements an amber glow, and draws that
 * frame's annotation card. The frames of one build share a viewBox and an
 * opaque background, so slides.md can stack them inside a `.build` block
 * (themes/cop5725.css): the HTML deck fades one frame over the previous on
 * each arrow key, and the PDF build shows one frame per expanded page.
 *
 * The drawing style (chalk font, ink lines, entity/attribute palette)
 * matches day6-er-modeling/images/attribute-kinds.svg.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FONT = "'Chalkboard SE','Comic Sans MS','Segoe Print',cursive";
const MONO = "ui-monospace,Menlo,Consolas,monospace";
const INK = '#4E342E';

const C = {
  entityFill: '#e3f2fd', entityStroke: '#1976d2', entityText: '#0d47a1',
  relFill: '#fff9c4', relStroke: '#f57f17', relText: '#e65100',
  weakFill: '#ffebee', weakStroke: '#c62828', weakText: '#b71c1c',
  attrFill: '#f3e5f5', attrStroke: '#7b1fa2', attrText: '#4a148c',
  keyFill: '#e8f5e9', keyStroke: '#388e3c', keyText: '#1b5e20',
  noteFill: '#fff3e0', noteStroke: '#ff6f00',
  caption: '#607D8B', body: '#37474f', title: '#263238',
};

const DEFS = `<defs>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
    <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffb300" flood-opacity="0.9"/>
  </filter>
  <marker id="lead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 1 L 9 5 L 0 9 z" fill="${C.noteStroke}"/>
  </marker>
</defs>`;

const glow = (isNew) => (isNew ? ' filter="url(#glow)"' : '');

/* ---- element factories ------------------------------------------------- */
/* Each returns { step, until, layer, draw(isNew, k) }. Layers: 0 lines,
   1 shapes, 2 labels, 3 notes. */

const el = (o, layer, draw) => ({ step: o.step ?? 1, until: o.until ?? Infinity, layer, draw });

const line = (x1, y1, x2, y2, o = {}) => el(o, 0, () => {
  if (!o.double) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = ((y2 - y1) / len) * 3;
  const ny = ((x1 - x2) / len) * 3;
  return `<line x1="${x1 + nx}" y1="${y1 + ny}" x2="${x2 + nx}" y2="${y2 + ny}" stroke="${INK}" stroke-width="2"/>`
    + `<line x1="${x1 - nx}" y1="${y1 - ny}" x2="${x2 - nx}" y2="${y2 - ny}" stroke="${INK}" stroke-width="2"/>`;
});

const entity = (cx, cy, label, o = {}) => el(o, 1, (isNew) => {
  const w = o.w ?? 140;
  const h = o.h ?? 48;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const weak = !!o.weak;
  const fill = weak ? C.weakFill : C.entityFill;
  const stroke = weak ? C.weakStroke : C.entityStroke;
  const text = weak ? C.weakText : C.entityText;
  const dash = weak ? ' stroke-dasharray="7 4"' : '';
  let s = `<g${glow(isNew)}>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${isNew ? 3.5 : 2.5}"${dash}/>`;
  // Weak entities get the Textbook's double border on top of the deck's red dash.
  if (weak) s += `<rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="5" fill="none" stroke="${stroke}" stroke-width="1.8"${dash}/>`;
  s += `<text x="${cx}" y="${cy + 7}" font-size="19" fill="${text}" text-anchor="middle">${label}</text></g>`;
  return s;
});

const diamond = (cx, cy, label, o = {}) => el(o, 1, (isNew) => {
  const w = o.w ?? 150;
  const h = o.h ?? 62;
  const pts = (dw, dh) =>
    `${cx},${cy - dh} ${cx + dw},${cy} ${cx},${cy + dh} ${cx - dw},${cy}`;
  let s = `<g${glow(isNew)}>`;
  s += `<polygon points="${pts(w / 2, h / 2)}" fill="${C.relFill}" stroke="${C.relStroke}" stroke-width="${isNew ? 3.5 : 2.5}"/>`;
  // Identifying relationships use the Textbook's double diamond.
  if (o.identifying) s += `<polygon points="${pts(w / 2 - 8, h / 2 - 5)}" fill="none" stroke="${C.relStroke}" stroke-width="1.8"/>`;
  s += `<text x="${cx}" y="${cy + 6}" font-size="16.5" fill="${C.relText}" text-anchor="middle">${label}</text></g>`;
  return s;
});

const attr = (cx, cy, label, o = {}) => el(o, 1, (isNew) => {
  const rx = o.rx ?? 56;
  const ry = o.ry ?? 23;
  const kind = o.kind ?? 'plain';
  const key = kind === 'key';
  const fill = key ? C.keyFill : C.attrFill;
  const stroke = key ? C.keyStroke : C.attrStroke;
  const text = key ? C.keyText : C.attrText;
  const dash = kind === 'derived' ? ' stroke-dasharray="6 4"' : '';
  let s = `<g${glow(isNew)}>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${isNew ? 3.2 : 2.5}"${dash}/>`;
  // Multi-valued attributes use the wider tradition's double oval.
  if (kind === 'multi') s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 6}" ry="${ry - 5}" fill="none" stroke="${stroke}" stroke-width="1.8"/>`;
  s += `<text x="${cx}" y="${cy + 6}" font-size="16.5" fill="${text}" text-anchor="middle">${label}</text>`;
  // Keys are underlined; a weak entity's partial key gets a dashed underline.
  const half = label.length * 4.1;
  if (key) s += `<line x1="${cx - half}" y1="${cy + 12}" x2="${cx + half}" y2="${cy + 12}" stroke="${C.keyStroke}" stroke-width="2.2"/>`;
  if (kind === 'partial') s += `<line x1="${cx - half}" y1="${cy + 12}" x2="${cx + half}" y2="${cy + 12}" stroke="${C.relStroke}" stroke-width="2.2" stroke-dasharray="5 4"/>`;
  return `${s}</g>`;
});

const card = (x, y, text, o = {}) => el(o, 2, (isNew) => `<text x="${x}" y="${y}" font-size="21" fill="${C.relText}" text-anchor="middle" paint-order="stroke" stroke="#ffffff" stroke-width="6"${glow(isNew)}>${text}</text>`);

const caption = (x, y, text, o = {}) => el(o, 2, () => `<text x="${x}" y="${y}" font-size="16" fill="${C.caption}" text-anchor="middle">${text}</text>`);

/*
 * Per-frame annotation card. Shown only on its own frame, chip reads
 * "Step k of K". `tx, ty` aim the dashed leader arrow at the new element.
 */
const note = (o) => el({ step: o.step, until: o.step }, 3, () => {
  const w = o.w ?? 430;
  const lineH = 24;
  const h = 46 + o.lines.length * lineH + (o.cite ? 26 : 8);
  let s = '<g>';
  if (o.tx !== undefined) {
    const sx = o.tx < o.x ? o.x : o.x + w;
    const sy = o.sy ?? Math.min(Math.max(o.ty, o.y + 18), o.y + h - 18);
    s += `<line x1="${sx}" y1="${sy}" x2="${o.tx}" y2="${o.ty}" stroke="${C.noteStroke}" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#lead)"/>`;
  }
  s += `<rect x="${o.x}" y="${o.y}" width="${w}" height="${h}" rx="10" fill="${C.noteFill}" stroke="${C.noteStroke}" stroke-width="1.5"/>`;
  s += `<rect x="${o.x}" y="${o.y}" width="6" height="${h}" rx="3" fill="${C.noteStroke}"/>`;
  s += `<rect x="${o.x + 16}" y="${o.y - 13}" width="92" height="26" rx="13" fill="${C.noteStroke}"/>`;
  s += `<text x="${o.x + 62}" y="${o.y + 5}" font-size="13.5" fill="#ffffff" text-anchor="middle">Step ${o.step} of ${o.total}</text>`;
  s += `<text x="${o.x + 20}" y="${o.y + 38}" font-size="19" fill="${C.title}">${o.title}</text>`;
  o.lines.forEach((t, i) => {
    s += `<text x="${o.x + 20}" y="${o.y + 62 + i * lineH}" font-size="15.5" fill="${C.body}">${t}</text>`;
  });
  if (o.cite) s += `<text x="${o.x + 20}" y="${o.y + h - 12}" font-size="13.5" fill="${C.caption}">${o.cite}</text>`;
  return `${s}</g>`;
});

/* ---- frame rendering ---------------------------------------------------- */

function renderFrame(build, k) {
  const shown = build.elements.filter((e) => e.step <= k && k <= e.until);
  shown.sort((a, b) => a.layer - b.layer);
  const body = shown.map((e) => e.draw(e.step === k, k)).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${build.width} ${build.height}" font-family="${FONT}">
${DEFS}
<rect width="${build.width}" height="${build.height}" fill="#ffffff"/>
  ${body}
</svg>
`;
}

function writeBuild(dir, name, build) {
  for (let k = 1; k <= build.frames; k += 1) {
    const file = join(dir, `${name}-${k}.svg`);
    writeFileSync(file, renderFrame(build, k));
    console.log(`  wrote ${file}`);
  }
}

/* ---- Day 6, build 1: the Student entity -------------------------------- */

const studentEntity = {
  width: 1120, height: 470, frames: 5,
  elements: [
    // Step 1: the entity set alone.
    entity(300, 255, 'Student', { step: 1, w: 150, h: 52 }),
    // Step 2: simple attributes.
    line(300, 255, 120, 120, { step: 2 }),
    line(300, 255, 330, 115, { step: 2 }),
    line(300, 255, 135, 340, { step: 2 }),
    line(300, 255, 270, 400, { step: 2 }),
    attr(120, 120, 'student_id', { step: 2, until: 2 }),
    attr(330, 115, 'name', { step: 2 }),
    attr(135, 340, 'major', { step: 2 }),
    attr(270, 400, 'gpa', { step: 2 }),
    // Step 3: student_id becomes the key.
    attr(120, 120, 'student_id', { step: 3, kind: 'key' }),
    // Step 4: composite name, stored dob, derived age.
    line(330, 115, 200, 45, { step: 4 }),
    line(330, 115, 460, 45, { step: 4 }),
    line(300, 255, 520, 140, { step: 4 }),
    line(300, 255, 600, 230, { step: 4 }),
    attr(200, 45, 'first', { step: 4, rx: 44, ry: 20 }),
    attr(460, 45, 'last', { step: 4, rx: 44, ry: 20 }),
    attr(520, 140, 'dob', { step: 4, rx: 46, ry: 21 }),
    attr(600, 230, 'age', { step: 4, rx: 46, ry: 21, kind: 'derived' }),
    // Step 5: multi-valued phone.
    line(300, 255, 455, 360, { step: 5 }),
    attr(455, 360, 'phone', { step: 5, kind: 'multi' }),
    // Annotations.
    note({ step: 1, total: 5, x: 660, y: 80, title: 'Name the thing', tx: 380, ty: 240,
      lines: ['A rectangle declares an entity set:', 'the set of all students, not one student.'],
      cite: 'Textbook §4.1.1, p. 126' }),
    note({ step: 2, total: 5, x: 660, y: 80, title: 'Attach what you record', tx: 390, ty: 112,
      lines: ['Ovals hold the facts we keep per student.', 'No oval is special yet.'],
      cite: 'Textbook §4.1.2, p. 126' }),
    note({ step: 3, total: 5, x: 660, y: 80, title: 'Choose the key', tx: 185, ty: 148, sy: 232,
      lines: ['Underline the attributes that tell two', 'students apart. Here one oval is enough;', 'this deck also colors it green.'],
      cite: 'Textbook §4.3.1–4.3.2, pp. 148–149' }),
    note({ step: 4, total: 5, x: 660, y: 80, title: 'Refine the shapes', tx: 610, ty: 205,
      lines: ['name splits into a composite. dob is', 'stored; age is derived, so its oval is', 'dashed. Both marks are the wider ER', 'dialect; the Textbook keeps ovals plain.'],
      cite: 'Textbook §4.1.2, pp. 126–127' }),
    note({ step: 5, total: 5, x: 660, y: 80, title: 'Allow many values', tx: 505, ty: 342,
      lines: ['A double oval stores a set of phones', 'per student. Once a phone needs', 'attributes of its own, it graduates', 'into an entity.'],
      cite: 'Textbook §4.1.2, pp. 126–127' }),
  ],
};

/* ---- Day 6, build 2: the Enrolls relationship -------------------------- */

const relationship = {
  width: 1120, height: 420, frames: 4,
  elements: [
    entity(170, 150, 'Student', { step: 1, w: 150, h: 52 }),
    entity(690, 150, 'Course', { step: 1, w: 150, h: 52 }),
    line(245, 150, 345, 150, { step: 2 }),
    line(515, 150, 615, 150, { step: 2 }),
    diamond(430, 150, 'Enrolls', { step: 2, w: 170, h: 72 }),
    card(285, 132, 'M', { step: 3 }),
    card(575, 132, 'N', { step: 3 }),
    line(400, 175, 350, 298, { step: 4 }),
    line(460, 175, 510, 298, { step: 4 }),
    attr(340, 320, 'grade', { step: 4 }),
    attr(520, 320, 'term', { step: 4 }),
    note({ step: 1, total: 4, x: 810, y: 70, w: 290, title: 'Start from the things', tx: 767, ty: 140,
      lines: ['Two entity sets.', 'Nothing connects them yet.'],
      cite: 'Textbook §4.1.1, p. 126' }),
    note({ step: 2, total: 4, x: 810, y: 70, w: 290, title: 'Verbs become diamonds', tx: 495, ty: 122,
      lines: ['"Students enroll in courses."', 'The diamond names that', 'association.'],
      cite: 'Textbook §4.1.3, p. 127' }),
    note({ step: 3, total: 4, x: 810, y: 70, w: 290, title: 'Count each side', tx: 588, ty: 120,
      lines: ['Many on both sides: M:N.', 'Textbook dialect differs: an', 'arrow into a set would mean', '"at most one" there.'],
      cite: 'Textbook §4.1.6, p. 129' }),
    note({ step: 4, total: 4, x: 810, y: 70, w: 290, title: 'Facts about the pair', tx: 390, ty: 305,
      lines: ['grade belongs to the enrollment', 'itself, not to Student and', 'not to Course.'],
      cite: 'Textbook §4.1.9, p. 134' }),
  ],
};

/* ---- Day 6, build 3: registrar diagram assembled ----------------------- */

const registrar = {
  width: 1240, height: 560, frames: 5,
  elements: [
    // Step 1: entity sets.
    entity(120, 110, 'Student', { step: 1, w: 130 }),
    entity(520, 110, 'Section', { step: 1, until: 1, w: 130 }),
    entity(920, 110, 'Course', { step: 1, w: 130 }),
    entity(480, 340, 'Faculty', { step: 1, w: 130 }),
    entity(920, 440, 'Department', { step: 1, w: 150 }),
    // Step 2: relationships; Section turns weak.
    entity(520, 110, 'Section', { step: 2, w: 130, weak: true }),
    line(185, 110, 245, 110, { step: 2 }),
    line(395, 110, 455, 110, { step: 2 }),
    diamond(320, 110, 'enrolls in', { step: 2 }),
    line(585, 110, 645, 110, { step: 2, double: true }),
    line(795, 110, 855, 110, { step: 2 }),
    diamond(720, 110, 'offered as', { step: 2, identifying: true }),
    line(520, 134, 520, 195, { step: 2 }),
    line(505, 255, 485, 316, { step: 2 }),
    diamond(520, 225, 'teaches', { step: 2, w: 130, h: 58 }),
    line(955, 134, 1065, 250, { step: 2 }),
    line(1075, 300, 975, 418, { step: 2 }),
    diamond(1080, 275, 'belongs to', { step: 2, w: 140, h: 58 }),
    line(545, 348, 630, 375, { step: 2 }),
    line(770, 385, 855, 425, { step: 2 }),
    diamond(700, 380, 'member of', { step: 2, w: 140, h: 58 }),
    line(120, 134, 120, 300, { step: 2 }),
    line(155, 350, 850, 435, { step: 2 }),
    diamond(120, 330, 'majors in', { step: 2, w: 140, h: 58 }),
    line(438, 364, 358, 446, { step: 2 }),
    line(492, 364, 396, 466, { step: 2 }),
    diamond(330, 470, 'supervises', { step: 2, w: 140, h: 58 }),
    // Step 3: keys and the partial key.
    line(100, 52, 112, 86, { step: 3 }),
    attr(80, 32, 'student_id', { step: 3, kind: 'key', rx: 62, ry: 22 }),
    line(555, 86, 620, 58, { step: 3 }),
    attr(660, 45, 'section_num', { step: 3, kind: 'partial', rx: 66, ry: 22 }),
    line(970, 88, 1040, 62, { step: 3 }),
    attr(1090, 50, 'course_id', { step: 3, kind: 'key', rx: 58, ry: 22 }),
    line(408, 320, 372, 292, { step: 3 }),
    attr(340, 278, 'fid', { step: 3, kind: 'key', rx: 36, ry: 20 }),
    line(885, 462, 800, 512, { step: 3 }),
    attr(755, 525, 'dname', { step: 3, kind: 'key', rx: 48, ry: 21 }),
    // Step 4: cardinalities (as on the Step 4 slide).
    card(215, 92, 'M', { step: 4 }),
    card(425, 92, 'N', { step: 4 }),
    card(615, 92, 'N', { step: 4 }),
    card(825, 92, '1', { step: 4 }),
    card(1000, 165, 'N', { step: 4 }),
    card(1035, 330, '1', { step: 4 }),
    card(575, 355, 'N', { step: 4 }),
    card(810, 408, '1', { step: 4 }),
    card(490, 285, '1', { step: 4 }),
    card(545, 168, 'N', { step: 4 }),
    // Step 5: grade lands on enrolls in.
    line(305, 138, 255, 205, { step: 5 }),
    attr(240, 225, 'grade', { step: 5, rx: 48, ry: 21 }),
    // Annotations (no leader; the glow marks what is new).
    note({ step: 1, total: 5, x: 1020, y: 385, w: 205, title: 'Nouns → boxes',
      lines: ['Five survive the audit.', 'grade and major do not;', 'they return in', 'other roles.'],
      cite: '§4.1.1 · §4.2, p. 140' }),
    note({ step: 2, total: 5, x: 1020, y: 385, w: 205, title: 'Verbs → diamonds',
      lines: ['Seven associations.', 'Section leans on Course:', 'double diamond,', 'weak entity.'],
      cite: '§4.1.3 · §4.4, p. 152' }),
    note({ step: 3, total: 5, x: 1020, y: 385, w: 205, title: 'Keys first',
      lines: ['Green: keys. Dashed', 'underline: the partial', 'key. Other attributes:', 'previous slide.'],
      cite: '§4.3.1–4.3.2, pp. 148–149' }),
    note({ step: 4, total: 5, x: 1020, y: 385, w: 205, title: 'Count the sides',
      lines: ['One faculty per section,', 'many sections per', 'course. M:N only', 'for enrolls in.'],
      cite: '§4.1.6, p. 129' }),
    note({ step: 5, total: 5, x: 1020, y: 385, w: 205, title: 'grade finds a home',
      lines: ['A property of one', '(student, section)', 'pairing, so it hangs', 'on the diamond.'],
      cite: '§4.1.9, p. 134' }),
  ],
};

/* ---- Day 6: notation dialect comparison (single static figure) --------- */

function notationFigure() {
  const W = 1120;
  const H = 470;
  const rowY = [150, 250, 350, 435];
  const colX = { concept: 20, textbook: 330, deck: 660, crow: 905 };
  let s = '';

  const header = (x, label) => `<text x="${x}" y="52" font-size="20" fill="${C.title}">${label}</text>`;
  s += `<text x="${colX.concept}" y="52" font-size="20" fill="${C.title}">Constraint</text>`;
  s += header(colX.textbook - 90, 'Textbook (§4.1.6, §4.3.3)');
  s += header(colX.deck - 60, 'This deck');
  s += header(colX.crow - 15, "Crow's foot");
  s += `<line x1="20" y1="66" x2="1100" y2="66" stroke="${C.caption}" stroke-width="1.5"/>`;

  const mini = (cx, y, right) => {
    let g = `<rect x="${cx - 150}" y="${y - 16}" width="52" height="32" rx="6" fill="${C.entityFill}" stroke="${C.entityStroke}" stroke-width="2"/>`;
    g += `<line x1="${cx - 98}" y1="${y}" x2="${cx - 42}" y2="${y}" stroke="${INK}" stroke-width="2.2"/>`;
    g += `<polygon points="${cx},${y - 20} ${cx + 42},${y} ${cx},${y + 20} ${cx - 42},${y}" fill="${C.relFill}" stroke="${C.relStroke}" stroke-width="2"/>`;
    g += right;
    g += `<rect x="${cx + 98}" y="${y - 16}" width="52" height="32" rx="6" fill="${C.entityFill}" stroke="${C.entityStroke}" stroke-width="2"/>`;
    return g;
  };

  // Row 1: many-to-many.
  s += `<text x="${colX.concept}" y="${rowY[0] + 6}" font-size="17" fill="${C.body}">many : many</text>`;
  s += mini(colX.textbook, rowY[0], `<line x1="${colX.textbook + 42}" y1="${rowY[0]}" x2="${colX.textbook + 98}" y2="${rowY[0]}" stroke="${INK}" stroke-width="2.2"/>`);
  s += `<text x="${colX.textbook - 120}" y="${rowY[0] + 44}" font-size="14" fill="${C.caption}">plain lines, no arrows</text>`;
  s += mini(colX.deck, rowY[0], `<line x1="${colX.deck + 42}" y1="${rowY[0]}" x2="${colX.deck + 98}" y2="${rowY[0]}" stroke="${INK}" stroke-width="2.2"/>`
    + `<text x="${colX.deck - 78}" y="${rowY[0] - 8}" font-size="16" fill="${C.relText}">M</text>`
    + `<text x="${colX.deck + 66}" y="${rowY[0] - 8}" font-size="16" fill="${C.relText}">N</text>`);
  s += `<text x="${colX.deck - 110}" y="${rowY[0] + 44}" font-size="14" fill="${C.caption}">M and N labels on the line</text>`;

  const crowLine = (y, endMark) => {
    let g = `<line x1="${colX.crow}" y1="${y}" x2="${colX.crow + 150}" y2="${y}" stroke="${INK}" stroke-width="2.2"/>`;
    // Left end: always "many" (crow's foot prongs).
    g += `<path d="M ${colX.crow + 16} ${y} L ${colX.crow} ${y - 9} M ${colX.crow + 16} ${y} L ${colX.crow} ${y} M ${colX.crow + 16} ${y} L ${colX.crow} ${y + 9}" stroke="${INK}" stroke-width="2" fill="none"/>`;
    g += endMark;
    return g;
  };
  const x2 = colX.crow + 150;
  s += crowLine(rowY[0], `<path d="M ${x2 - 16} ${rowY[0]} L ${x2} ${rowY[0] - 9} M ${x2 - 16} ${rowY[0]} L ${x2} ${rowY[0] + 9}" stroke="${INK}" stroke-width="2" fill="none"/>`);
  s += `<text x="${colX.crow}" y="${rowY[0] + 44}" font-size="14" fill="${C.caption}">prongs at both ends</text>`;

  // Row 2: at most one.
  s += `<text x="${colX.concept}" y="${rowY[1] + 6}" font-size="17" fill="${C.body}">many : at most one</text>`;
  s += mini(colX.textbook, rowY[1], `<line x1="${colX.textbook + 42}" y1="${rowY[1]}" x2="${colX.textbook + 90}" y2="${rowY[1]}" stroke="${INK}" stroke-width="2.2"/>`
    + `<path d="M ${colX.textbook + 80} ${rowY[1] - 9} L ${colX.textbook + 96} ${rowY[1]} L ${colX.textbook + 80} ${rowY[1] + 9}" fill="none" stroke="${INK}" stroke-width="2.4"/>`);
  s += `<text x="${colX.textbook - 120}" y="${rowY[1] + 44}" font-size="14" fill="${C.caption}">arrow into the "one" side</text>`;
  s += mini(colX.deck, rowY[1], `<line x1="${colX.deck + 42}" y1="${rowY[1]}" x2="${colX.deck + 98}" y2="${rowY[1]}" stroke="${INK}" stroke-width="2.2"/>`
    + `<text x="${colX.deck - 78}" y="${rowY[1] - 8}" font-size="16" fill="${C.relText}">N</text>`
    + `<text x="${colX.deck + 68}" y="${rowY[1] - 8}" font-size="16" fill="${C.relText}">1</text>`);
  s += `<text x="${colX.deck - 110}" y="${rowY[1] + 44}" font-size="14" fill="${C.caption}">N and 1 labels</text>`;
  s += crowLine(rowY[1], `<circle cx="${x2 - 22}" cy="${rowY[1]}" r="5" fill="#ffffff" stroke="${INK}" stroke-width="2"/>`
    + `<line x1="${x2 - 11}" y1="${rowY[1] - 8}" x2="${x2 - 11}" y2="${rowY[1] + 8}" stroke="${INK}" stroke-width="2"/>`);
  s += `<text x="${colX.crow}" y="${rowY[1] + 44}" font-size="14" fill="${C.caption}">ring + bar: zero or one</text>`;

  // Row 3: exactly one.
  s += `<text x="${colX.concept}" y="${rowY[2] + 6}" font-size="17" fill="${C.body}">many : exactly one</text>`;
  s += mini(colX.textbook, rowY[2], `<line x1="${colX.textbook + 42}" y1="${rowY[2]}" x2="${colX.textbook + 84}" y2="${rowY[2]}" stroke="${INK}" stroke-width="2.2"/>`
    + `<path d="M ${colX.textbook + 76} ${rowY[2] - 12} Q ${colX.textbook + 102} ${rowY[2]} ${colX.textbook + 76} ${rowY[2] + 12}" fill="none" stroke="${INK}" stroke-width="2.6"/>`);
  s += `<text x="${colX.textbook - 120}" y="${rowY[2] + 44}" font-size="14" fill="${C.caption}">rounded arrow: referential integrity</text>`;
  s += mini(colX.deck, rowY[2], `<line x1="${colX.deck + 42}" y1="${rowY[2] - 2}" x2="${colX.deck + 98}" y2="${rowY[2] - 2}" stroke="${INK}" stroke-width="2"/>`
    + `<line x1="${colX.deck + 42}" y1="${rowY[2] + 3}" x2="${colX.deck + 98}" y2="${rowY[2] + 3}" stroke="${INK}" stroke-width="2"/>`
    + `<text x="${colX.deck + 68}" y="${rowY[2] - 10}" font-size="16" fill="${C.relText}">1</text>`);
  s += `<text x="${colX.deck - 110}" y="${rowY[2] + 44}" font-size="14" fill="${C.caption}">double line: total participation</text>`;
  s += crowLine(rowY[2], `<line x1="${x2 - 22}" y1="${rowY[2] - 8}" x2="${x2 - 22}" y2="${rowY[2] + 8}" stroke="${INK}" stroke-width="2"/>`
    + `<line x1="${x2 - 12}" y1="${rowY[2] - 8}" x2="${x2 - 12}" y2="${rowY[2] + 8}" stroke="${INK}" stroke-width="2"/>`);
  s += `<text x="${colX.crow}" y="${rowY[2] + 44}" font-size="14" fill="${C.caption}">two bars: exactly one</text>`;

  // Row 4: weak entity.
  s += `<text x="${colX.concept}" y="${rowY[3] + 6}" font-size="17" fill="${C.body}">weak entity</text>`;
  s += `<rect x="${colX.textbook - 60}" y="${rowY[3] - 18}" width="120" height="36" rx="6" fill="${C.entityFill}" stroke="${C.entityStroke}" stroke-width="2"/>`;
  s += `<rect x="${colX.textbook - 55}" y="${rowY[3] - 13}" width="110" height="26" rx="4" fill="none" stroke="${C.entityStroke}" stroke-width="1.6"/>`;
  s += `<text x="${colX.textbook + 90}" y="${rowY[3] + 6}" font-size="14" fill="${C.caption}">double border (§4.4.3)</text>`;
  s += `<rect x="${colX.deck - 60}" y="${rowY[3] - 18}" width="120" height="36" rx="6" fill="${C.weakFill}" stroke="${C.weakStroke}" stroke-width="2" stroke-dasharray="7 4"/>`;
  s += `<text x="${colX.deck + 80}" y="${rowY[3] + 6}" font-size="14" fill="${C.caption}">red dashed color code</text>`;
  s += `<text x="${colX.crow}" y="${rowY[3] + 6}" font-size="14" fill="${C.caption}">solid vs. dashed line marks</text>`;
  s += `<text x="${colX.crow}" y="${rowY[3] + 26}" font-size="14" fill="${C.caption}">identifying relationships</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="#ffffff"/>
${s}
</svg>
`;
}

/* ---- Day 7: diagram-to-DDL translation --------------------------------- */

/* The SQL panel accumulates lines; the current frame's lines render bright,
   earlier ones dim. Comment lines carry the rule and the Textbook section. */
const SQL_FRAMES = [
  [
    '-- Rule 1 · strong entity → table   (§4.5.1, p. 157)',
    'CREATE TABLE department (dname text PRIMARY KEY, …);',
    'CREATE TABLE student (student_id bigint PRIMARY KEY, …);',
    'CREATE TABLE faculty (fid bigint PRIMARY KEY, …);',
    'CREATE TABLE course (course_id text PRIMARY KEY, …);',
  ],
  [
    '-- Rule 4 · 1:N → FK on the N side  (§4.5.2, p. 158)',
    'ALTER TABLE course ADD dname text REFERENCES department;',
    'ALTER TABLE faculty ADD dname text REFERENCES department;',
  ],
  [
    '-- Rule 2 · weak entity → composite key  (§4.5.4, p. 161)',
    'CREATE TABLE section (',
    '  course_id text REFERENCES course(course_id),',
    '  section_num int, term text, room text,',
    '  fid bigint REFERENCES faculty(fid),  -- teaches, 1:N',
    '  PRIMARY KEY (course_id, section_num, term));',
  ],
  [
    '-- Rule 5 · M:N → junction table  (§4.5.2, p. 158)',
    'CREATE TABLE enrollment (',
    '  student_id bigint REFERENCES student(student_id),',
    '  course_id text, section_num int, term text,',
    '  grade char(2),  -- the relationship’s attribute',
    '  PRIMARY KEY (student_id, course_id, section_num, term));',
  ],
  [
    '-- "exactly one" → NOT NULL  (§4.3.3, p. 150)',
    'ALTER TABLE course ALTER dname SET NOT NULL;  -- 6 tables ✓',
  ],
];

const sqlPanel = (x, y, w, h) => el({ step: 1 }, 3, (isNew, k) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#1e293b"/>`;
  let row = 0;
  const lineH = 18;
  for (let f = 0; f < k; f += 1) {
    for (const text of SQL_FRAMES[f]) {
      const current = f === k - 1;
      const comment = text.startsWith('--');
      const fill = current ? (comment ? '#fbbf24' : '#e2e8f0') : (comment ? '#a78b4a' : '#64748b');
      const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/^ +/, (sp) => '\u00a0'.repeat(sp.length)); // SVG collapses leading spaces
      s += `<text x="${x + 18}" y="${y + 30 + row * lineH}" font-size="13.5" font-family="${MONO}" fill="${fill}">${safe}</text>`;
      row += 1;
    }
    row += 1; // blank line between rule groups
  }
  return s;
});

const stepChip = (x, y, total) => el({ step: 1 }, 3, (isNew, k) =>
  `<g><rect x="${x}" y="${y}" width="100" height="28" rx="14" fill="${C.noteStroke}"/>`
  + `<text x="${x + 50}" y="${y + 19}" font-size="14" fill="#ffffff" text-anchor="middle">Step ${k} of ${total}</text></g>`);

/* A translucent amber halo behind a diagram region, marking what the
   current frame's DDL covers. */
const halo = (x, y, w, h, o) => el(o, 0, () =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#ffb300" opacity="0.22"/>`);

const translation = {
  width: 1240, height: 560, frames: 5,
  elements: [
    // The registrar diagram, complete from frame 1 (drawn Wednesday).
    entity(110, 80, 'Student', { step: 1, w: 120, h: 44 }),
    line(170, 80, 205, 80, { step: 1 }),
    line(335, 80, 370, 80, { step: 1 }),
    diamond(270, 80, 'enrolls in', { step: 1, w: 130, h: 56 }),
    entity(430, 80, 'Section', { step: 1, w: 120, h: 44, weak: true }),
    line(430, 102, 430, 177, { step: 1, double: true }),
    diamond(430, 205, 'offered as', { step: 1, w: 130, h: 56, identifying: true }),
    line(430, 233, 430, 308, { step: 1 }),
    entity(430, 330, 'Course', { step: 1, w: 120, h: 44 }),
    line(430, 352, 430, 422, { step: 1 }),
    diamond(430, 450, 'belongs to', { step: 1, w: 130, h: 56 }),
    line(495, 450, 550, 450, { step: 1 }),
    entity(610, 450, 'Department', { step: 1, w: 130, h: 44 }),
    entity(110, 330, 'Faculty', { step: 1, w: 120, h: 44 }),
    line(150, 312, 218, 228, { step: 1 }),
    line(310, 185, 393, 105, { step: 1 }),
    diamond(270, 205, 'teaches', { step: 1, w: 120, h: 54 }),
    line(135, 352, 212, 496, { step: 1 }),
    line(335, 520, 565, 474, { step: 1 }),
    diamond(270, 520, 'member of', { step: 1, w: 130, h: 56 }),
    line(228, 105, 148, 172, { step: 1 }),
    attr(120, 190, 'grade', { step: 1, rx: 46, ry: 20 }),
    // Frame highlights.
    halo(40, 48, 140, 64, { step: 1, until: 1 }),   // Student
    halo(360, 298, 140, 64, { step: 1, until: 1 }), // Course
    halo(40, 298, 140, 64, { step: 1, until: 1 }),  // Faculty
    halo(535, 418, 150, 64, { step: 1, until: 1 }), // Department
    halo(355, 412, 150, 76, { step: 2, until: 2 }), // belongs to
    halo(195, 482, 150, 76, { step: 2, until: 2 }), // member of
    halo(360, 48, 140, 64, { step: 3, until: 3 }),  // Section
    halo(355, 167, 150, 76, { step: 3, until: 3 }), // offered as
    halo(200, 168, 140, 74, { step: 3, until: 3 }), // teaches
    halo(195, 42, 150, 76, { step: 4, until: 4 }),  // enrolls in
    halo(64, 160, 112, 60, { step: 4, until: 4 }),  // grade
    // SQL panel and chip.
    sqlPanel(680, 40, 540, 490),
    stepChip(30, 510, 5),
  ],
};

/* ---- emit --------------------------------------------------------------- */

const day6 = 'day6-er-modeling/images';
const day7 = 'day7-er-to-relations/images';
mkdirSync(day6, { recursive: true });
mkdirSync(day7, { recursive: true });

writeBuild(day6, 'student-entity-build', studentEntity);
writeBuild(day6, 'relationship-build', relationship);
writeBuild(day6, 'registrar-build', registrar);
writeFileSync(join(day6, 'notation-dialects.svg'), notationFigure());
console.log(`  wrote ${join(day6, 'notation-dialects.svg')}`);
writeBuild(day7, 'translation-build', translation);
