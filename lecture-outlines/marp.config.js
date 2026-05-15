// Marp CLI configuration for the COP 5725 lecture decks.
// Picked up automatically when marp-cli runs inside lecture-outlines/.
export default {
  // Register the shared theme directory so decks can use `theme: cop5725`.
  themeSet: './themes',
  // Decks rely on raw HTML for multi-column layouts and widgets.
  html: true,
  // Custom engine adds the `sql run` and `::: appear` syntax. Wired in once
  // the plugins exist; harmless to keep referenced.
  engine: './engine.js',
};
