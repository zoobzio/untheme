# @untheme/codemirror

## 0.2.0

### Minor Changes

- [`978585b`](https://github.com/zoobzio/untheme/commit/978585bba1ef11fa29062bdb1aaf448b97bc0c63) Thanks [@zoobzio](https://github.com/zoobzio)! - Add the CodeMirror 6 integration. `defineCodeMirrorTheme(schema, map, options?)`
  returns the editor extensions — a `syntaxHighlighting` over the language's tags
  plus an `EditorView.theme` for the chrome — whose colors are `var()`
  indirections to contract tokens, so the editor re-themes through the
  custom-property cascade on a context or theme swap without reconfiguring.

  The role vocabulary is `@lezer/highlight`'s tags (CodeMirror's domain standard);
  the caller owns the interchange, a `map` binding tag names to tokens in their
  contract (re-proved against `schema` at build time). Editor chrome binds from
  `options`, and `options.tags` layers raw-Lezer-tag rules on top for anything the
  shipped vocabulary omits.

### Patch Changes

- Updated dependencies [[`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6)]:
  - untheme@0.2.0
