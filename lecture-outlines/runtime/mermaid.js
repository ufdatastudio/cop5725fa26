/*
 * Mermaid rendering — inlined into both HTML and PDF builds.
 *
 * Turns every <div class="mermaid"> (emitted by plugin-mermaid.mjs) into an
 * SVG diagram. Mermaid loads from a CDN. The `data-mermaid` attribute on
 * <html> reports progress so the PDF build can wait for rendering to finish.
 *
 * Plain script (no module) so the build can inline it as one <script>.
 */
(async () => {
  const root = document.documentElement;
  const blocks = document.querySelectorAll('div.mermaid');
  if (blocks.length === 0) {
    root.setAttribute('data-mermaid', 'none');
    return;
  }
  root.setAttribute('data-mermaid', 'pending');
  try {
    const { default: mermaid } = await import(
      'https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.esm.min.mjs'
    );
    // securityLevel 'loose' keeps <br/> in node labels working.
    mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
    // Wait for the theme fonts so label widths are measured against the real
    // font rather than a fallback.
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await mermaid.run({ nodes: blocks });
    // Sizing is left to the theme (.mermaid svg in cop5725.css), which caps the
    // diagram to the slide. The PDF build uses pre-rendered images instead.
    root.setAttribute('data-mermaid', 'done');
  } catch (error) {
    console.error('mermaid: render failed', error);
    root.setAttribute('data-mermaid', 'error');
  }
})();
