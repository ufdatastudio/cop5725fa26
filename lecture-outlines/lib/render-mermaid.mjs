/*
 * PDF build step: pre-render Mermaid diagrams to PNG images.
 *
 * Mermaid flowcharts place label text inside SVG <foreignObject> elements.
 * Chromium clips foreignObject content when it prints a deck to PDF, so the
 * labels come out truncated. Rendering each diagram to a raster image in a
 * real browser and embedding it as a data-URI <img> sidesteps that entirely.
 *
 * build.mjs uses this for both the HTML and PDF builds, so neither output
 * depends on a CDN at view time. Repeated diagrams are cached.
 */
import { chromium } from 'playwright';

const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.esm.min.mjs';

/** True when the markdown has at least one ```mermaid fenced block. */
export function hasMermaid(source) {
  return source.split('\n').some((line) => /^```mermaid\s*$/.test(line));
}

async function launchBrowser() {
  // Prefer the system Chrome (already required for marp's PDF export); fall
  // back to Playwright's bundled Chromium.
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return await chromium.launch();
  }
}

/**
 * Start a reusable Mermaid renderer backed by one headless browser page.
 * @returns {Promise<{render: (src: string) => Promise<{dataUri: string, width: number}>, close: () => Promise<void>}>}
 */
export async function createMermaidRenderer() {
  const browser = await launchBrowser();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.evaluate(async (cdn) => {
    const mod = await import(cdn);
    window.__mermaid = mod.default;
    window.__mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      // Tighter layout so diagrams stay proportionate to slide text. Only the
      // gaps between nodes shrink; node label text keeps its size.
      flowchart: { nodeSpacing: 30, rankSpacing: 36 },
    });
  }, MERMAID_CDN);

  let counter = 0;
  const cache = new Map();

  return {
    async render(source) {
      const cached = cache.get(source);
      if (cached) return cached;

      const id = `m${counter++}`;
      const size = await page.evaluate(async ({ id, src }) => {
        const { svg } = await window.__mermaid.render(`render-${id}`, src);
        const host = document.createElement('div');
        host.id = `host-${id}`;
        host.style.cssText = 'display:inline-block;padding:4px';
        host.innerHTML = svg;
        document.body.appendChild(host);
        const el = host.querySelector('svg');
        const box = el.viewBox.baseVal;
        // Pin to natural size so the raster capture is sharp and correctly sized.
        el.setAttribute('width', box.width);
        el.setAttribute('height', box.height);
        el.style.maxWidth = 'none';
        await document.fonts.ready;
        return { width: box.width, height: box.height };
      }, { id, src: source });

      const png = await page.locator(`#host-${id}`).screenshot({ omitBackground: true });
      await page.evaluate((id) => document.getElementById(`host-${id}`)?.remove(), id);
      const result = { dataUri: `data:image/png;base64,${png.toString('base64')}`, ...size };
      cache.set(source, result);
      return result;
    },
    async close() {
      await browser.close();
    },
  };
}

/**
 * Replace every ```mermaid block in `source` with a rendered <img>.
 * A diagram that fails to render is left as its original code block.
 */
export async function replaceMermaid(source, renderer) {
  const lines = source.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^```mermaid\s*$/.test(lines[i])) {
      out.push(lines[i]);
      continue;
    }
    const body = [];
    let j = i + 1;
    while (j < lines.length && !/^```\s*$/.test(lines[j])) body.push(lines[j++]);
    try {
      const { dataUri, width, height } = await renderer.render(body.join('\n'));
      out.push(
        `<img class="mermaid" src="${dataUri}" width="${Math.round(width)}" height="${Math.round(height)}" />`,
      );
    } catch {
      out.push('```mermaid', ...body, '```');
    }
    i = j; // skip past the closing ```
  }
  return out.join('\n');
}
