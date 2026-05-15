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
 * Non-runnable ```sql blocks and every other language are left untouched.
 */
export function sqlRunPlugin(md, { target = 'html' } = {}) {
  const defaultFence =
    md.renderer.rules.fence ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const words = token.info.trim().split(/\s+/);
    const isRunnable = words[0] === 'sql' && words.slice(1).includes('run');
    if (!isRunnable) return defaultFence(tokens, idx, options, env, self);

    const autorun = words.includes('autorun');
    // Render the body as an ordinary highlighted SQL block.
    token.info = 'sql';
    const codeHtml = defaultFence(tokens, idx, options, env, self);

    // Student PDF handout: the query is enough, no runner.
    if (target === 'pdf') return codeHtml;

    const attrs = autorun ? ' data-autorun' : '';
    return `<div class="sql-runner"${attrs}>\n${codeHtml}</div>\n`;
  };
}
