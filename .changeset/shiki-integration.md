---
"@untheme/shiki": minor
---

Add the Shiki integration. `defineShikiTheme(schema, map, options?)` builds a
Shiki theme whose scope colors are `var()` indirections to contract tokens, so
highlighted code re-themes through the custom-property cascade on a context or
theme swap without re-highlighting.

The role vocabulary is the LSP `SemanticTokenTypes` standard; the caller owns
the interchange, a `map` binding those roles to tokens in their contract
(re-proved against `schema` at build time). A universal, strict-LSP scope set
is always applied, and `options.scopes` layers extra rules on top — with an open
`role`, so any TextMate scope the standard omits is reachable.
