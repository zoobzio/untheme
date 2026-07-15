---
"@untheme/codemirror": minor
---

Add the CodeMirror 6 integration. `defineCodeMirrorTheme(schema, map, options?)`
returns the editor extensions — a `syntaxHighlighting` over the language's tags
plus an `EditorView.theme` for the chrome — whose colors are `var()`
indirections to contract tokens, so the editor re-themes through the
custom-property cascade on a context or theme swap without reconfiguring.

The role vocabulary is `@lezer/highlight`'s tags (CodeMirror's domain standard);
the caller owns the interchange, a `map` binding tag names to tokens in their
contract (re-proved against `schema` at build time). Editor chrome binds from
`options`, and `options.tags` layers raw-Lezer-tag rules on top for anything the
shipped vocabulary omits.
