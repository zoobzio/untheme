---
"@untheme/css": minor
"@untheme/nuxt": minor
---

Render a static set of bindings instead of the source's live tokens.
`root(set)` and `variables(set)` now take an optional `Bindings<T>` snapshot,
keyed by token; each value is either a token name — emitted as a `var()` alias
to that token's custom property, the bare form of a `{token}` reference — or a
binding of the token's own type. The set is partial, so a snapshot may cover
any subset of the contract, and the contract still supplies each token's
`$type`. Omit the argument for the existing live behavior.

The Nuxt integration exposes the renderer it builds over the service as
`$unthemeRenderer`, with a `useUnthemeRenderer()` composable to reach it, so
components can name tokens, read values, and emit static sets without rebuilding
a renderer.
