/*
 * markdown-it plugin: incremental reveal.
 *
 *   ::: appear
 *   This block appears on the next click.
 *   :::
 *
 *   ::: appear fade-up
 *   Optional variant: fade-up | fade-down | slide-left | slide-right | scale-in
 *   :::
 *
 * The container is marked with `meta.marpitFragment`, so Marpit's own
 * `marpit_apply_fragment` rule numbers it alongside any `*`-list fragments and
 * sets `data-marpit-fragment`. Marp's bespoke template then steps through it
 * with the arrow keys; themes/cop5725.css animates the reveal.
 *
 * For PDF builds the `:::` blocks are expanded into separate slides upstream
 * (lib/expand-fragments.mjs), so this plugin only shapes the HTML output.
 */
import container from 'markdown-it-container';

const VARIANTS = new Set(['fade-up', 'fade-down', 'slide-left', 'slide-right', 'scale-in']);

export function appearPlugin(md) {
  md.use(container, 'appear', {
    validate: (params) => params.trim().split(/\s+/)[0] === 'appear',
    render(tokens, idx, options, env, self) {
      const token = tokens[idx];
      if (token.nesting === 1) {
        const variants = token.info.trim().split(/\s+/).slice(1).filter((v) => VARIANTS.has(v));
        token.attrSet('class', ['appear', ...variants.map((v) => `appear--${v}`)].join(' '));
      }
      return self.renderToken(tokens, idx, options);
    },
  });

  // Flag the opening token before Marpit assigns fragment numbers.
  md.core.ruler.after('marpit_fragment', 'cop5725_appear_fragment', (state) => {
    if (state.inlineMode) return;
    for (const token of state.tokens) {
      if (token.type === 'container_appear_open') {
        token.meta = { ...token.meta, marpitFragment: true };
      }
    }
  });
}
