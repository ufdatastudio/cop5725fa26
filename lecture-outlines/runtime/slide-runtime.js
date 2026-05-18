/*
 * COP 5725 slide runtime — HTML (presentation) builds only.
 *
 * Hydrates every `.sql-runner` block emitted by the sql-run plugin into a live
 * DuckDB-WASM widget: editable query, Run button, result table. DuckDB loads
 * lazily from jsDelivr on the first Run and is shared across the whole deck,
 * so a CREATE on one slide is queryable on a later one.
 *
 * Plain IIFE (no module) so the build can inline it as a single <script>.
 */
(() => {
  'use strict';

  const DUCKDB_VERSION = '1.32.0';
  const MAX_ROWS = 200;

  // The modal lives outside any <section>, so Marp's slide-scoped theme CSS
  // does not reach it. Inject its styles globally instead.
  const MODAL_CSS = `
.sql-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.sql-modal[hidden]{display:none}
.sql-modal__panel{position:relative;background:#fff;border-radius:8px;padding:26px 22px 22px;max-width:86vw;max-height:84vh;overflow:auto;box-shadow:0 12px 48px rgba(0,0,0,.35)}
.sql-modal__close{position:absolute;top:4px;right:8px;border:0;background:transparent;font-size:22px;line-height:1;cursor:pointer;color:#64748b}
.sql-modal__ok{color:#15803d;margin:0;font-size:16px}
.sql-modal__body table{border-collapse:collapse;font-size:15px}
.sql-modal__body th,.sql-modal__body td{border:1px solid #e2e8f0;padding:5px 13px;text-align:left}
.sql-modal__body th{background:#f8fafc}
.sql-modal__error{color:#b91c1c;font-family:ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;margin:0;font-size:14px}`;

  // ---- DuckDB-WASM: lazy, single shared connection ----------------------
  let connectionPromise = null;
  let sharedDb = null;
  function duckdbConnection() {
    if (connectionPromise) return connectionPromise;
    connectionPromise = (async () => {
      const duckdb = await import(
        `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_VERSION}/+esm`
      );
      const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
      const workerUrl = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' }),
      );
      const worker = new Worker(workerUrl);
      const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(workerUrl);
      sharedDb = db;
      return db.connect();
    })();
    return connectionPromise;
  }

  // Discard the shared database so the next Run starts from an empty one.
  async function resetDatabase() {
    const pending = connectionPromise;
    connectionPromise = null;
    if (!pending) return;
    try {
      await pending;
    } catch {
      /* init failed — nothing to tear down */
    }
    const db = sharedDb;
    sharedDb = null;
    if (db) {
      try {
        await db.terminate();
      } catch {
        /* already gone */
      }
    }
  }

  // ---- result rendering -------------------------------------------------
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  // Arrow column kinds that need special formatting: DECIMAL arrives as an
  // unscaled integer, DATE (Arrow typeId 8) as epoch milliseconds.
  function columnKind(type) {
    if (!type) return null;
    if (typeof type.scale === 'number') return { decimal: type.scale };
    if (type.typeId === 8) return { date: true };
    return null;
  }

  function renderCell(value, kind) {
    if (value === null || value === undefined) {
      return '<td><em style="color:#94a3b8">NULL</em></td>';
    }
    if (kind && kind.decimal != null) {
      return `<td>${(Number(value) / 10 ** kind.decimal).toFixed(kind.decimal)}</td>`;
    }
    if (kind && kind.date) {
      return `<td>${new Date(Number(value)).toISOString().slice(0, 10)}</td>`;
    }
    if (value instanceof Date) return `<td>${value.toISOString().slice(0, 10)}</td>`;
    if (typeof value === 'bigint') return `<td>${value.toString()}</td>`;
    return `<td>${escapeHtml(value)}</td>`;
  }

  // Build the result table HTML; returns it together with the row count.
  function resultHtml(table) {
    const fields = table.schema.fields;
    const columns = fields.map((f) => f.name);
    const kinds = fields.map((f) => columnKind(f.type));
    // Access columns by position, not name: a self-join can return two columns
    // with the same name, and name lookup would render one of them twice.
    const vectors = fields.map((_, i) => table.getChildAt(i));
    const rowCount = table.numRows;
    if (columns.length === 0) {
      return { html: '<p class="sql-modal__ok">Statement executed.</p>', rowCount };
    }
    const head = columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
    let body = '';
    for (let r = 0; r < Math.min(rowCount, MAX_ROWS); r += 1) {
      body += '<tr>' + vectors.map((v, i) => renderCell(v.get(r), kinds[i])).join('') + '</tr>';
    }
    return { html: `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`, rowCount };
  }

  // ---- result modal -----------------------------------------------------
  // Results appear in a centered overlay so they are readable regardless of
  // how little room the slide leaves below the editor.
  let modal = null;
  function showModal(html) {
    if (!modal) {
      const style = document.createElement('style');
      style.textContent = MODAL_CSS;
      document.head.appendChild(style);
      const overlay = document.createElement('div');
      overlay.className = 'sql-modal';
      overlay.hidden = true;
      const panel = document.createElement('div');
      panel.className = 'sql-modal__panel';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'sql-modal__close';
      close.textContent = '✕';
      const body = document.createElement('div');
      body.className = 'sql-modal__body';
      panel.append(close, body);
      overlay.append(panel);
      document.body.appendChild(overlay);
      const hide = () => { overlay.hidden = true; };
      close.addEventListener('click', hide);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) hide();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !overlay.hidden) {
          event.stopPropagation();
          hide();
        }
      });
      modal = { overlay, body };
    }
    modal.body.innerHTML = html;
    modal.overlay.hidden = false;
  }

  // ---- run a widget's query --------------------------------------------
  async function runQuery(widget) {
    const query = widget.textarea.value.trim();
    if (!query) return;
    // Prepend the hidden setup so the slide's tables exist for the query.
    const sql = widget.setup ? `${widget.setup}\n${query}` : query;
    widget.runButton.disabled = true;
    widget.status.textContent = 'loading DuckDB…';
    try {
      const conn = await duckdbConnection();
      widget.status.textContent = 'running…';
      const started = performance.now();
      const table = await conn.query(sql);
      const elapsed = Math.round(performance.now() - started);
      const { html, rowCount } = resultHtml(table);
      showModal(html);
      const shown = Math.min(rowCount, MAX_ROWS);
      widget.status.textContent =
        `${rowCount} row${rowCount === 1 ? '' : 's'} · ${elapsed} ms` +
        (rowCount > shown ? ` (first ${shown})` : '');
    } catch (error) {
      const message = String(error && error.message ? error.message : error);
      showModal(`<div class="sql-modal__error">${escapeHtml(message)}</div>`);
      widget.status.textContent = 'error';
    } finally {
      widget.runButton.disabled = false;
    }
  }

  // ---- hydrate one `.sql-runner` ---------------------------------------
  function hydrate(root) {
    // Hidden setup (CREATE/INSERT) runs before the query but is never shown.
    const setupCode = root.querySelector('.sql-runner__setup code');
    const setup = setupCode ? setupCode.textContent.replace(/\n+$/, '') : '';
    // The shown query is the last code block (setup, if any, comes first).
    const codes = root.querySelectorAll('code');
    const code = codes[codes.length - 1];
    if (!code) return;
    const sql = code.textContent.replace(/\n+$/, '');

    const textarea = document.createElement('textarea');
    textarea.value = sql;
    textarea.spellcheck = false;
    textarea.rows = Math.min(Math.max(sql.split('\n').length, 2), 12);

    const editor = document.createElement('div');
    editor.className = 'sql-runner__editor';
    editor.appendChild(textarea);

    const runButton = document.createElement('button');
    runButton.type = 'button';
    runButton.className = 'sql-runner__run';
    runButton.textContent = 'Run ▶';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'sql-runner__reset';
    resetButton.textContent = 'Reset DB';

    const status = document.createElement('span');
    status.className = 'sql-runner__status';

    const toolbar = document.createElement('div');
    toolbar.className = 'sql-runner__toolbar';
    toolbar.append(runButton, resetButton, status);

    root.textContent = '';
    root.append(editor, toolbar);
    root.classList.add('is-hydrated');

    const widget = { textarea, runButton, status, setup };
    runButton.addEventListener('click', () => runQuery(widget));
    resetButton.addEventListener('click', async () => {
      resetButton.disabled = true;
      widget.status.textContent = 'resetting database…';
      await resetDatabase();
      widget.status.textContent = 'database reset — Run to rebuild';
      resetButton.disabled = false;
    });

    // Marp's bespoke template advances slides on arrow/space/page keys.
    // Keep every keystroke inside the editor from reaching that handler.
    textarea.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        runQuery(widget);
      }
    });

    if (root.hasAttribute('data-autorun')) runQuery(widget);
  }

  function init() {
    document.querySelectorAll('.sql-runner:not(.is-hydrated)').forEach(hydrate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
