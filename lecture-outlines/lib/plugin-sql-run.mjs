/*
 * markdown-it plugin: runnable SQL blocks.
 *
 * A fenced block whose info string is `sql run` becomes:
 *   - HTML target: a `.sql-runner` wrapper that slide-runtime.js hydrates
 *     into a live DuckDB-WASM widget.
 *   - PDF target:  a plain highlighted `sql` code block (the query only).
 *
 * Authoring:
 *   ```sql run            runnable block
 *   ```sql run autorun    runs once on slide load
 *
 * Hidden setup: a line `-- @query` splits the block. Everything above it is
 * setup (CREATE/INSERT) — run before the query but never shown on the slide or
 * in the editor. Everything below is the query the student sees and edits.
 * With no marker, the whole block is shown (e.g. a CREATE TABLE lesson).
 *
 * Non-runnable ```sql blocks and every other language are left untouched.
 */
const QUERY_MARKER = /^\s*--\s*@query\s*$/;

export function sqlRunPlugin(md, { target = 'html' } = {}) {
  const defaultFence =
    md.renderer.rules.fence ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  // Render arbitrary SQL `content` as a plain highlighted ```sql block.
  function renderSql(content, token, tokens, idx, options, env, self) {
    const saved = { content: token.content, info: token.info };
    token.content = content.endsWith('\n') ? content : `${content}\n`;
    token.info = 'sql';
    const html = defaultFence(tokens, idx, options, env, self);
    token.content = saved.content;
    token.info = saved.info;
    return html;
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const words = token.info.trim().split(/\s+/);
    const isRunnable = words[0] === 'sql' && words.slice(1).includes('run');
    if (!isRunnable) return defaultFence(tokens, idx, options, env, self);

    const lines = token.content.split('\n');
    const marker = lines.findIndex((line) => QUERY_MARKER.test(line));
    const setup = marker === -1 ? '' : lines.slice(0, marker).join('\n').trim();
    const query = marker === -1 ? token.content : lines.slice(marker + 1).join('\n').trim();

    const queryHtml = renderSql(query, token, tokens, idx, options, env, self);

    // PDF and any static view: only the query, no runner, no setup.
    if (target === 'pdf') return queryHtml;

    const attrs = words.includes('autorun') ? ' data-autorun' : '';
    const setupHtml = setup
      ? `<div class="sql-runner__setup" hidden>${renderSql(setup, token, tokens, idx, options, env, self)}</div>\n`
      : '';
    return `<div class="sql-runner"${attrs}>\n${setupHtml}${queryHtml}</div>\n`;
  };
}
