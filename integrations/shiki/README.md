# @untheme/shiki

Builds a [Shiki](https://shiki.style) theme from an untheme contract, so syntax
highlighting rides the same live-reference cascade as the rest of your tokens.

`defineShikiTheme(schema, map)` returns a static Shiki theme whose every scope
color is the `var()` indirection to a token — `var(--code-keyword)`, not a baked
hex. Register it with Shiki once and never regenerate it: when a modifier
context or theme layer rebinds those tokens, the highlighted output re-themes
through the custom-property graph, with no re-highlight.

## The vocabulary is LSP

The scope packs this integration ships route TextMate scopes to the **LSP
`SemanticTokenTypes`** — the standard semantic-highlighting vocabulary
(`namespace`, `type`, `function`, `macro`, `decorator`, `keyword`, `string`, …).
We adopt the standard rather than invent one. **You** own the interchange: a
`map` from those roles to tokens in your contract. There's no fixed set of
tokens you must define — bind the roles to whatever tokens you have, adding
carrier tokens if you like.

```ts
import { defineUntheme } from "untheme";
import { defineShikiTheme } from "@untheme/shiki";
import { codeToHtml } from "shiki";

const untheme = defineUntheme(config, themes);

// Bind LSP roles to tokens in your contract. Roles autocomplete; unmapped ones
// render at the default foreground. Many-to-one is fine — reuse a token to
// collapse distinctions you don't want to surface.
const theme = defineShikiTheme(untheme.schema, {
  keyword: "code-keyword",
  string: "code-string",
  comment: "code-comment",
  function: "code-fn",
  macro: "code-fn",
  type: "code-type",
  namespace: "code-type",
});

const html = await codeToHtml(source, { lang: "ts", theme });
```

`schema` is `untheme.schema`; it anchors the token type and re-proves the map
at call time — every bound token must exist in the contract and be a `color`,
or a `SyntaxMappingError` reports every fault at once. The rendered spans carry
`style="color:var(--code-keyword)"`; emit the matching custom properties with
`defineRenderer(untheme).sheet()`, and a `data-*` context flip re-colors every
block for free.

## Scopes

A universal set (`BASIC_SCOPES`) is **always applied** — the scopes every
grammar emits by convention, routed to LSP roles. Because TextMate matches by
prefix, those base rules already reach a language's `.rust`/`.go`/… scopes, so
most languages classify off the base with no extra work. You don't compose it in;
you add only what you want beyond it via `options.scopes`, which layers on top:

```ts
// add rules; a rule that names a base scope overrides it
defineShikiTheme(untheme.schema, map, {
  scopes: [{ scope: "storage.type", role: "type" }],
});
```

### Strict LSP, open roles

The base is always strict LSP: a scope with no semantic token type — punctuation,
brackets, Markdown headings — is left out and renders at the default foreground.
That keeps it standard and lean. It does not limit you: a `ScopeRule`'s `role` is
an **open** string, so you reach anything TextMate distinguishes that LSP doesn't
by adding your own rule —

```ts
defineShikiTheme(untheme.schema, { ...map, punctuation: "code-punct" }, {
  scopes: [{ scope: "punctuation", role: "punctuation" }],
});
```

— giving TextMate's full granularity at no cost to the base. A hand-authored
rule's `role` just has to be a key in your map (or it renders default).

## Options

`defineShikiTheme(schema, map, options)` accepts:

- `scopes` — extra `ScopeRule[]` layered over the always-applied universal set.
  Add only what you want beyond it; a rule naming a base scope overrides it.
- `fg` / `bg` — the theme's top-level foreground and background, the
  `<pre>`/`<code>` colors Shiki stamps on a whole block. Set `fg` for the
  unclassified text; `bg` for the block behind it.
- `name` — the registration name (default `"untheme"`).
- `type` — `"light"` or `"dark"` (default `"dark"`); cosmetic, since colors are
  driven by custom properties.

## Types

- `SemanticType` — one LSP semantic token type; the shipped role vocabulary,
  derived from the exported `SEMANTIC_TYPES`.
- `SyntaxMap<T>` — the interchange: `role → Token<T>`. LSP roles autocomplete
  and are optional; the map stays open for custom roles.
- `SyntaxMappingError` — thrown when the runtime re-proof finds a bound token
  that is missing or not a color; `problems` lists every fault.
- `ScopeRule` / `FontStyle` — one scope-map entry; the exported `BASIC_SCOPES`
  (the always-applied universal set) is `ScopeRule[]`.
- `ShikiOptions<T>` — the options above.

## Related

- [`untheme`](../../packages/untheme) — the umbrella package this depends on.
- [`@untheme/css`](../../packages/css) — the renderer whose `var()` naming this
  reuses.
