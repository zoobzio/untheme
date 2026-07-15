# @untheme/codemirror

Builds a [CodeMirror 6](https://codemirror.net) theme from an untheme contract,
so an editor rides the same live-reference cascade as the rest of your tokens.

`defineCodeMirrorTheme(schema, map, options?)` returns the extensions to drop
into an editor — a `syntaxHighlighting` extension over the language's tags plus
an `EditorView.theme` for the chrome. Every color is the `var()` indirection to
a token, so the editor re-themes when a modifier context or theme layer rebinds
those tokens — no reconfigure, no re-parse.

## The vocabulary is `@lezer/highlight`

CodeMirror highlights via Lezer, whose `tags` are its standard vocabulary for
what a highlighter distinguishes (`keyword`, `typeName`, `variableName`,
`function`, `string`, …). We adopt it rather than invent one, and — unlike a
TextMate integration — there's no scope layer to collapse: Lezer tags *are* the
semantic vocabulary, so you map tags to tokens directly.

**You** own the interchange: a `map` from tag names to tokens in your contract.
Names autocomplete and are optional; an unmapped tag renders at the editor
foreground.

```ts
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { defineUntheme } from "untheme";
import { defineCodeMirrorTheme } from "@untheme/codemirror";

const untheme = defineUntheme(config, themes);

const theme = defineCodeMirrorTheme(
  untheme.schema,
  {
    keyword: "code-keyword",
    string: "code-string",
    comment: "code-comment",
    function: "code-fn",
    typeName: "code-type",
    propertyName: "code-property",
  },
  {
    background: "surface",
    foreground: "code-fg",
    caret: "code-fg",
    selection: "surface-container",
  },
);

new EditorView({
  parent: document.body,
  doc: "const x = 1;",
  extensions: [javascript(), ...theme],
});
```

`schema` is `untheme.schema`; it anchors the token type and re-proves the map
at build time — every bound token (map, chrome, and escape-hatch) must exist in
the contract and be a `color`, or a `SyntaxMappingError` reports every fault at
once. The editor's spans and chrome carry `var(--code-keyword)` etc.; emit the
matching custom properties with `defineRenderer(untheme).sheet()`, and a
`data-*` context flip re-colors the editor.

## Options

`defineCodeMirrorTheme(schema, map, options)` accepts:

- Chrome bindings — `background`, `foreground`, `caret`, `selection`,
  `gutterBackground`, `gutterForeground`, `activeLine` — each colors a piece of
  the editor UI from a token; omit one to leave that surface transparent.
- `dark` — flags the theme for CodeMirror's own light/dark handling (default
  `true`); cosmetic, since colors come from custom properties.
- `tags` — extra rules keyed by a raw Lezer `Tag`, for anything the shipped
  `TAGS` vocabulary doesn't name: `[{ tag: tags.docComment, token: "…" }]`.

## Types

- `TagName` — one shipped Lezer tag name; the role vocabulary, derived from the
  exported `TAGS` registry.
- `TagMap<T>` — the interchange: `tag name → Token<T>`, optional per name.
- `TagRule<T>` — an escape-hatch rule over a raw Lezer `Tag`.
- `CodeMirrorOptions<T>` / `SyntaxMappingError` — the options above, and the
  error thrown when the runtime re-proof finds a missing or non-color token.

## Related

- [`untheme`](../../packages/untheme) — the umbrella package this depends on.
- [`@untheme/css`](../../packages/css) — the renderer whose `var()` naming this
  reuses.
- [`@untheme/shiki`](../shiki) — the parallel integration for static
  highlighting; both target your tokens, on their own domain's standard.
