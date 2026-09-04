# @untheme/nuxt

## 0.3.0

### Minor Changes

- [`6c8a59d`](https://github.com/zoobzio/untheme/commit/6c8a59dc2d0d2334ad3598d70fe52af3537c4d29) Thanks [@zoobzio](https://github.com/zoobzio)! - Write the static cascade to a `#build/untheme.css` build template and link
  it into the app's global CSS. The file renders `sheet()` over the resolved
  base theme — the base bindings under `:root`, then each modifier context as
  a `[data-<modifier>="<context>"]` block — so the token custom properties
  exist as plain CSS: editors index the file and autocomplete `var(--token)`
  in authored stylesheets, and the tokens resolve before hydration and
  without JavaScript. The cascade sits in an `@layer untheme` block, so the
  unlayered style the runtime plugin injects — carrying live overrides and
  switched catalog themes — wins every equal-specificity conflict regardless
  of head order. Set `css: false` to keep the file out of the bundle; it is
  still written to the build directory for indexing and manual
  `@import "#build/untheme.css"`. The flag resolves across Nuxt layers as a
  scalar, the closest authored value winning.

### Patch Changes

- Updated dependencies []:
  - untheme@0.3.0

## 0.2.3

### Patch Changes

- [`a665a3c`](https://github.com/zoobzio/untheme/commit/a665a3c26199b18a03ab30c6563297f3e064e315) Thanks [@zoobzio](https://github.com/zoobzio)! - Resolve the untheme config across Nuxt layers instead of trusting Nuxt's
  defu-merged options, whose array concatenation corrupts array-valued
  bindings (shadow lists, gradient stops, `cubicBezier` tuples, color
  components, font stacks) and duplicates `order`. When more than one layer
  authors an `untheme` key, the module now resolves the chain from
  `nuxt.options._layers` per member, the closest layer winning: `theme`
  replaces whole, `input` resolves per modifier, and `themes` per catalog
  key. A single author keeps the merged options, inline module options
  included.
- Updated dependencies []:
  - untheme@0.2.3

## 0.2.2

### Patch Changes

- [`b8b4d47`](https://github.com/zoobzio/untheme/commit/b8b4d47702f8ff2e6150b2cdba95617ed35a0a39) Thanks [@zoobzio](https://github.com/zoobzio)! - Rename the generated app-level types from `App*` to `AppUntheme*`
  (`AppUnthemeContract`, `AppUnthemeTheme`, `AppUnthemeThemeLayer`,
  `AppUnthemeInput`, `AppUnthemeConfig`) so the auto-imported names don't
  collide with app code. `AppUntheme` is unchanged.
- Updated dependencies []:
  - untheme@0.2.2

## 0.2.1

### Patch Changes

- [`122322f`](https://github.com/zoobzio/untheme/commit/122322f17567b1330ccef0fe9c341f1472c808e4) Thanks [@zoobzio](https://github.com/zoobzio)! - Register `useUnthemeRenderer` as a module auto-import, so it resolves through
  `#imports` like `useUntheme`. The composable shipped in the previous release but
  was only reachable via an explicit path import.
- Updated dependencies []:
  - untheme@0.2.1

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
