/*
 * markdown-it plugin: Mermaid diagrams.
 *
 * A fenced ```mermaid block becomes a `<div class="mermaid">` holding the
 * (HTML-escaped) diagram source. runtime/mermaid.js turns each such div into
 * SVG. Without this plugin a `mermaid` fence falls through to a plain code
 * block, which is why diagrams never rendered before.
 *
 * Escaping matters: diagram source often contains `<br/>` in node labels.
 * Escaped in the HTML, the browser hands Mermaid back the literal `<br/>` via
 * textContent.
 */
export function mermaidPlugin(md) {
  const defaultFence =
    md.renderer.rules.fence ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim().split(/\s+/)[0] !== 'mermaid') {
      return defaultFence(tokens, idx, options, env, self);
    }
    return `<div class="mermaid">\n${md.utils.escapeHtml(token.content)}</div>\n`;
  };
}
