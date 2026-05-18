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

  function renderResult(table, outEl) {
    const fields = table.schema.fields;
    const columns = fields.map((f) => f.name);
    const kinds = fields.map((f) => columnKind(f.type));
    const rows = table.toArray();
    if (columns.length === 0) {
      outEl.innerHTML = '<p style="color:#15803d;margin:.4em 0">Statement executed.</p>';
      return rows.length;
    }
    const head = columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
    const body = rows
      .slice(0, MAX_ROWS)
      .map((row) => '<tr>' + columns.map((c, i) => renderCell(row[c], kinds[i])).join('') + '</tr>')
      .join('');
    outEl.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    return rows.length;
  }

  // ---- run a widget's query --------------------------------------------
  async function runQuery(widget) {
    const query = widget.textarea.value.trim();
    if (!query) return;
    // Prepend the hidden setup so the slide's tables exist for the query.
    const sql = widget.setup ? `${widget.setup}\n${query}` : query;
    widget.runButton.disabled = true;
    widget.status.textContent = 'loading DuckDB…';
    widget.output.innerHTML = '';
    try {
      const conn = await duckdbConnection();
      widget.status.textContent = 'running…';
      const started = performance.now();
      const table = await conn.query(sql);
      const elapsed = Math.round(performance.now() - started);
      const total = renderResult(table, widget.output);
      const shown = Math.min(total, MAX_ROWS);
      widget.status.textContent =
        `${total} row${total === 1 ? '' : 's'} · ${elapsed} ms` +
        (total > shown ? ` (showing first ${shown})` : '');
    } catch (error) {
      const box = document.createElement('div');
      box.className = 'sql-runner__error';
      box.textContent = String(error && error.message ? error.message : error);
      widget.output.appendChild(box);
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

    const output = document.createElement('div');
    output.className = 'sql-runner__output';

    root.textContent = '';
    root.append(editor, toolbar, output);
    root.classList.add('is-hydrated');

    const widget = { textarea, runButton, status, output, setup };
    runButton.addEventListener('click', () => runQuery(widget));
    resetButton.addEventListener('click', async () => {
      resetButton.disabled = true;
      widget.output.innerHTML = '';
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
