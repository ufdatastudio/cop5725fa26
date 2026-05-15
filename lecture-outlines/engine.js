// Custom Marp engine for the COP 5725 decks.
//
// marp-cli calls this functional engine with the constructed Marp instance.
// It registers the markdown-it plugins that add course-specific syntax and,
// for HTML builds, inlines the slide runtime as a single <script>.
//
// MARP_TARGET selects behavior: 'html' (interactive presenting) or 'pdf'
// (static student handout).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { appearPlugin } from './lib/plugin-appear.mjs';
import { sqlRunPlugin } from './lib/plugin-sql-run.mjs';

const here = dirname(fileURLToPath(import.meta.url));

export default ({ marp }) => {
  const target = process.env.MARP_TARGET === 'pdf' ? 'pdf' : 'html';

  marp.use(sqlRunPlugin, { target });
  marp.use(appearPlugin);

  if (target === 'html') {
    const runtime = readFileSync(join(here, 'runtime', 'slide-runtime.js'), 'utf8');
    // Append the runtime as a trailing <script> so every HTML deck is
    // self-contained — no per-deck <script> line, nothing to host.
    marp.use((md) => {
      md.core.ruler.push('cop5725-runtime', (state) => {
        if (state.env.__cop5725Runtime) return;
        state.env.__cop5725Runtime = true;
        const token = new state.Token('html_block', '', 0);
        token.block = true;
        token.content = `<script>\n${runtime}\n</script>\n`;
        state.tokens.push(token);
      });
    });
  }

  return marp;
};
