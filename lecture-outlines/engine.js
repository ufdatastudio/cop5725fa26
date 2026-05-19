// Custom Marp engine for the COP 5725 decks.
//
// marp-cli calls this functional engine with the constructed Marp instance.
// It registers the markdown-it plugins that add course-specific syntax and
// inlines the slide runtime as a single <script>.
//
// MARP_TARGET selects behavior: 'html' (interactive presenting) or 'pdf'
// (static student handout).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { appearPlugin } from './lib/plugin-appear.mjs';
import { mermaidPlugin } from './lib/plugin-mermaid.mjs';
import { sqlRunPlugin } from './lib/plugin-sql-run.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const runtimeFile = (name) => readFileSync(join(here, 'runtime', name), 'utf8');

export default ({ marp }) => {
  const target = process.env.MARP_TARGET === 'pdf' ? 'pdf' : 'html';

  marp.use(sqlRunPlugin, { target });
  marp.use(mermaidPlugin);
  marp.use(appearPlugin);

  // The SQL runner and client-side Mermaid are HTML-only. The PDF build has no
  // widgets and pre-renders Mermaid to images (lib/render-mermaid.mjs), because
  // foreignObject SVG labels do not survive Chromium's print path.
  if (target === 'html') {
    const runtime = [runtimeFile('mermaid.js'), runtimeFile('slide-runtime.js')].join('\n');
    // Inject the runtime as one <script>, so every HTML deck is self-contained.
    //
    // The rule skips inline-mode passes: Marpit renders the footer/header
    // directive with md.parseInline, and a token pushed during that pass is
    // stamped into every slide's footer — that was the "runtime inlined once
    // per slide" bug. It runs before marpit_collect and inserts before the
    // last `marpit_slide_close` (the `</section>`), so the script sits inside a
    // slide: it executes as ordinary HTML rather than as an SVG-namespaced
    // script, and marpit_collect keeps it with that slide for per-slide render.
    marp.use((md) => {
      md.core.ruler.before('marpit_collect', 'cop5725-runtime', (state) => {
        if (state.inlineMode) return;
        let closeAt = -1;
        for (let i = state.tokens.length - 1; i >= 0; i -= 1) {
          if (state.tokens[i].type === 'marpit_slide_close') {
            closeAt = i;
            break;
          }
        }
        if (closeAt === -1) return;
        const token = new state.Token('html_block', '', 0);
        token.block = true;
        token.content = `<script>\n${runtime}\n</script>\n`;
        state.tokens.splice(closeAt, 0, token);
      });
    });
  }

  return marp;
};
