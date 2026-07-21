# @untheme/nuxt

## 0.2.0

### Minor Changes

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Extract the theme catalog into the standalone `@untheme/catalog` package,
  re-exported as `untheme/catalog`. `defineCatalog` builds a provider over
  storage callbacks; `defineClient` builds the same surface over a remote
  transport, so themes can be sourced from a server as easily as from a local
  registry. The Nuxt module serves its catalog layers over the catalog wire
  protocol as nitro server assets, keeping theme JSON off the app bundle.

- [`d24eb9c`](https://github.com/zoobzio/untheme/commit/d24eb9cd9698445455588dbe3ce1b12d691f6ef5) Thanks [@zoobzio](https://github.com/zoobzio)! - Render a static set of bindings instead of the source's live tokens.
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

### Patch Changes

- Updated dependencies [[`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6)]:
  - untheme@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - untheme@0.1.0
