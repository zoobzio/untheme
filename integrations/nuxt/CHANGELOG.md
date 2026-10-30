# @untheme/nuxt

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - untheme@0.6.1
  - @untheme/kit@0.6.1

## 0.6.0

### Minor Changes

- [#3](https://github.com/zoobzio/untheme/pull/3) [`afbf821`](https://github.com/zoobzio/untheme/commit/afbf82171cb07d5986b4af5386d3eddca63aff6d) Thanks [@zoobzio](https://github.com/zoobzio)! - Themes are layers. The kit builds them, the service applies them, and the
  contract does not carry them.

  **Kit.** A config can declare `layers`. Each layer is a DTCG token document
  or a list of them, in the same source forms as `add`. `layers` can instead
  name a local directory: each `.json` file in it is one layer, and the file
  name is the id. The directory joins the watched documents. The build normalizes
  each document with Terrazzo, converts it to a `Layer`, and checks it against
  the built contract with the schema. The build fails with the file and the
  token when a layer is not applicable. The build writes `layers/<id>.json` for
  each layer and a `layers.mjs` module with the id, the name, and the
  description of each one. A server returns the JSON as it is. `apply` takes it
  as it is.

  **Aurora.** The `theme` modifier is gone. The ramps of the aurora palette are
  a base set of the resolver. The thirty-one palettes are layers under
  `src/themes/`, built to `.dist/layers/`. The config points `layers` at that
  directory and reads no other file. The package exports
  `@untheme/aurora/layers` and `@untheme/aurora/layers/<id>.json`. The built
  config shrinks from 725 KB to 55 KB of JSON. The preset has eight modifiers.

  **Core.** `makeUntheme(theme, config, options?)` takes the base theme and
  the state container as separate arguments. The container holds what changed:
  the `patch` and the `input`. The base theme is not in the container. The
  service derives the active theme from the base and the patch and exposes it
  as `theme()`. An empty patch gives the base theme. `apply` stores a copy of
  the layer as the patch. `update` merges a patch into the stored patch. The
  middleware slots are `patch` and `input`.

  **Schema.** A `Patch` can carry an optional `id`, `name`, and `order`. A
  `Layer` is a `Patch` with a required identity. `merge` in `@untheme/utils`
  takes patches and returns a theme of the type it received; the `Overlay`
  type is gone.

  **CSS.** A renderer `Source` has `theme()` in place of `config.theme`. The
  core service is still a `Source`.

  **Testing.** `bootUntheme` passes the theme as the base of the service.

  **Nuxt.** The state in `useState` is the container: the selection and the
  patch. The theme travels in the module only. The
  module writes `#build/untheme.css` and no longer links it into the app CSS;
  the runtime `<style>` block is the CSS of the active state. The `css` option
  is gone. The `untheme:theme` hook is now `untheme:patch` and receives the
  stored patch. The example serves the aurora layers from a server route and
  applies them from a picker.

- [#8](https://github.com/zoobzio/untheme/pull/8) [`155d4b1`](https://github.com/zoobzio/untheme/commit/155d4b1825112e0da16277fd4977d59272546be0) Thanks [@zoobzio](https://github.com/zoobzio)! - The `untheme:input` and `untheme:patch` hooks forward the `input` and `patch`
  events of the core service, and the new `untheme:change` hook forwards
  `change`. Each hook receives the change object of the service: the `field` the
  write replaced, the stored values `before` and `after` the write, and for the
  patch the `diff` of the active theme. The plugin calls each hook after the
  write lands in the state.

- [#5](https://github.com/zoobzio/untheme/pull/5) [`5e7880f`](https://github.com/zoobzio/untheme/commit/5e7880fc383085f6657033f17afb60e08f21f228) Thanks [@zoobzio](https://github.com/zoobzio)! - The module takes a preset. `untheme: { preset: "@untheme/aurora" }` names a
  package that exports a kit build. The module takes the base theme, the boot
  selection, the manifest, and the layers from the package. When the build has
  layers, from a preset or from the kit config of the app, the module adds
  `load` to `#build/untheme/layers.mjs`: one lazy import for each layer. The
  list and the layers of a preset are the package's own. `useUnthemeCatalog()`
  returns a catalog over the module: `list` pages the entries and `get` imports
  one layer on demand. The service of `useUntheme()` gains `layers`, the
  entries of the build, and `select(id)`, which loads a layer and applies it.
  On the server, the key cookie restores the applied layer before the first
  render, as the input cookie restores the selection. The module links the base
  cascade, `#build/untheme.css`, into the CSS of the app, and the runtime
  plugin renders only the patch: a page with no applied layer carries no
  runtime CSS, and a context switch renders none. An app that serves
  aurora no longer mounts a server route, lists server assets, writes a kit
  config, or binds a theme picker of its own.

- [`ca23fed`](https://github.com/zoobzio/untheme/commit/ca23fedad853c4c06b1fee7f134a51e1a2c69f5e) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** the `@untheme/nuxt/server` entry is removed, along with
  `createThemeHandler`, and `h3` is no longer a dependency. The module serves
  the layers of the build through `useUnthemeCatalog()` and `select(id)` of
  `useUntheme()`; a theme served from elsewhere takes a catalog client of the
  app's own.

### Patch Changes

- [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2) Thanks [@zoobzio](https://github.com/zoobzio)! - `copy` is no longer exported from `@untheme/utils` or `untheme`; every copy is
  objectively's `copy`, a deep structural copy in a single walk. `clone` rebuilds
  a theme through `remap` onto its own type. Neither re-reads the source to
  prove the rebuild, so snapshotting a theme out of a reactive container — what
  `makeUntheme` does at construction, and the Nuxt plugin on every request and
  client boot — reads each member once instead of three times, about 60% less
  construction time on a large theme.

- [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e) Thanks [@zoobzio](https://github.com/zoobzio)! - Documentation and source comments are rewritten in Simplified Technical
  English. READMEs, JSDoc, and inline comments across every package use short
  declarative sentences, one idea per sentence, with a consistent vocabulary.
  No code, types, or emitted output change.
- Updated dependencies [[`1092b20`](https://github.com/zoobzio/untheme/commit/1092b20b4cb2a2c16c275a4ccac0967e8aa8c724), [`ac6cc5f`](https://github.com/zoobzio/untheme/commit/ac6cc5f247a5d6650430058b8c8ab4895fa6a78f), [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2), [`3c88cf6`](https://github.com/zoobzio/untheme/commit/3c88cf61e4015aedc0bae4d5e1eecb811c2f9cd3), [`afbf821`](https://github.com/zoobzio/untheme/commit/afbf82171cb07d5986b4af5386d3eddca63aff6d), [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2), [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e)]:
  - @untheme/kit@0.6.0
  - untheme@0.6.0

## 0.5.0

### Minor Changes

- [`0a1d799`](https://github.com/zoobzio/untheme/commit/0a1d79977c917251d31baf869b69315bdeac1f0e) Thanks [@zoobzio](https://github.com/zoobzio)! - The module registers `#build/untheme/manifest.mjs` beside the other theme
  modules: each modifier and its contexts with an id, a name and a description,
  as `@untheme/kit` emits it.

### Patch Changes

- Updated dependencies [[`0a1d799`](https://github.com/zoobzio/untheme/commit/0a1d79977c917251d31baf869b69315bdeac1f0e)]:
  - @untheme/kit@0.5.0
  - untheme@0.5.0

## 0.4.0

### Minor Changes

- [`d7d6cd2`](https://github.com/zoobzio/untheme/commit/d7d6cd2fa677f410b0cb9f1ff9a44cf98df7d1d6) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** the `@untheme/nuxt/aurora` entry is removed, along with
  `createAuroraThemeHandler`, `loadAuroraTheme` and `auroraThemes`, and
  `@untheme/aurora` is no longer a peer dependency. Serve aurora's themes with
  `createThemeHandler` from `@untheme/nuxt/server`; the Nuxt example's
  `server/aurora` folder shows how.

- [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** the module's theme is now an `@untheme/kit` build, taken one of
  two ways.

  - **A local config.** With no `theme` in the options, the module finds
    `untheme.config.ts` in the project root, builds it through the kit in
    memory, and rebuilds when the config or any JSON document it read changes
    in dev. `untheme.config` names another file.
  - **A built theme.** Pass the output of a kit build elsewhere —
    `untheme: { ...config }`, imported from its `config` module. `theme` and
    `input` are passed together or not at all.

  The `themes` option is gone, and the module registers no server routes: the
  `/api/untheme/themes` endpoints, their server assets and the `MOUNT`,
  `ASSETS`, `ENTRIES` and `THEMES` constants are removed. To serve a catalog,
  create one catch-all route file, whose folder is the base the catalog client
  points at, with `createThemeHandler(provider)` from `@untheme/nuxt/server`
  (`listEntries` windows entries held in memory), or with
  `createAuroraThemeHandler()` from `@untheme/nuxt/aurora` to serve all 31
  aurora themes. `@untheme/aurora` is an optional peer dependency.

  When more than one Nuxt layer sets `untheme`, the closest layer's value is now
  used whole; the per-member merge across layers is gone.

  The build templates are now the modules `@untheme/kit` emits, under
  `untheme/`: `#build/untheme.mjs` is `#build/untheme/config.mjs`, and
  `#build/types/untheme.d.ts` is the declarations of `#build/untheme/index.mjs`.

### Patch Changes

- Updated dependencies [[`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329), [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329), [`f939c78`](https://github.com/zoobzio/untheme/commit/f939c78633ba251e126206b3b981bfeab84304a2)]:
  - untheme@0.4.0
  - @untheme/kit@0.4.0

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
