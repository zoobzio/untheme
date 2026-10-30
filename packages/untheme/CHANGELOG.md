# untheme

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - @untheme/catalog@0.6.1
  - @untheme/core@0.6.1
  - @untheme/css@0.6.1
  - @untheme/schema@0.6.1
  - @untheme/utils@0.6.1

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
- Updated dependencies [[`155d4b1`](https://github.com/zoobzio/untheme/commit/155d4b1825112e0da16277fd4977d59272546be0), [`d2a265e`](https://github.com/zoobzio/untheme/commit/d2a265e6408bc509cd340b01a871e0fd5cbe80f2), [`afbf821`](https://github.com/zoobzio/untheme/commit/afbf82171cb07d5986b4af5386d3eddca63aff6d), [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2), [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e)]:
  - @untheme/core@0.6.0
  - @untheme/css@0.6.0
  - @untheme/utils@0.6.0
  - @untheme/catalog@0.6.0
  - @untheme/schema@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - @untheme/catalog@0.5.0
  - @untheme/core@0.5.0
  - @untheme/css@0.5.0
  - @untheme/schema@0.5.0
  - @untheme/utils@0.5.0

## 0.4.0

### Minor Changes

- [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** the TypeScript authoring path is removed; themes are built from
  DTCG JSON by `@untheme/kit`.

  - `defineUntheme` is gone from `@untheme/core` and `untheme`. Boot the service
    with `makeUntheme`, typed by the `Contract` the kit's `config` module
    declares: `makeUntheme<Contract>(useUnthemeConfig(config))`.
  - `extend` and the `Extension` type are gone from `@untheme/utils` and
    `untheme`.
  - The `untheme/kit` subpath is gone, and `untheme` no longer depends on
    `@untheme/kit`: the kit is a build-time tool.

  `untheme/config` keeps `UnthemeConfig`, `defineUnthemeConfig` and
  `useUnthemeConfig`, which describe the built shape — `theme` and `input` —
  the kit emits.

### Patch Changes

- [`f939c78`](https://github.com/zoobzio/untheme/commit/f939c78633ba251e126206b3b981bfeab84304a2) Thanks [@zoobzio](https://github.com/zoobzio)! - Tooling: replace ESLint and Prettier with oxlint and oxfmt, and upgrade Vitest
  to v5. No runtime or API changes.
- Updated dependencies [[`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329), [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329)]:
  - @untheme/catalog@0.4.0
  - @untheme/core@0.4.0
  - @untheme/utils@0.4.0
  - @untheme/css@0.4.0
  - @untheme/schema@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - @untheme/catalog@0.3.0
  - @untheme/core@0.3.0
  - @untheme/css@0.3.0
  - @untheme/kit@0.3.0
  - @untheme/schema@0.3.0
  - @untheme/utils@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @untheme/catalog@0.2.3
  - @untheme/core@0.2.3
  - @untheme/css@0.2.3
  - @untheme/kit@0.2.3
  - @untheme/schema@0.2.3
  - @untheme/utils@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @untheme/catalog@0.2.2
  - @untheme/core@0.2.2
  - @untheme/css@0.2.2
  - @untheme/kit@0.2.2
  - @untheme/schema@0.2.2
  - @untheme/utils@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @untheme/catalog@0.2.1
  - @untheme/core@0.2.1
  - @untheme/css@0.2.1
  - @untheme/kit@0.2.1
  - @untheme/schema@0.2.1
  - @untheme/utils@0.2.1

## 0.2.0

### Minor Changes

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Extract the theme catalog into the standalone `@untheme/catalog` package,
  re-exported as `untheme/catalog`. `defineCatalog` builds a provider over
  storage callbacks; `defineClient` builds the same surface over a remote
  transport, so themes can be sourced from a server as easily as from a local
  registry. The Nuxt module serves its catalog layers over the catalog wire
  protocol as nitro server assets, keeping theme JSON off the app bundle.

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Tighten the public surface. `@untheme/css` now exports only `defineRenderer`,
  `property`, and its types — the serializer internals (`serialize`, `emit`,
  `dashed`, `indirection`, and the serializer tables) are no longer part of the
  package surface. The `@untheme/utils` template guard is renamed from `guard`
  to `isTemplate`, matching the naming of every other guard in the workspace.

### Patch Changes

- Updated dependencies [[`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`d24eb9c`](https://github.com/zoobzio/untheme/commit/d24eb9cd9698445455588dbe3ce1b12d691f6ef5), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6)]:
  - @untheme/catalog@0.2.0
  - @untheme/css@0.2.0
  - @untheme/utils@0.2.0
  - @untheme/core@0.2.0
  - @untheme/kit@0.2.0
  - @untheme/schema@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - @untheme/common@0.1.0
  - @untheme/core@0.1.0
  - @untheme/css@0.1.0
  - @untheme/kit@0.1.0
  - @untheme/schema@0.1.0
  - @untheme/utils@0.1.0
