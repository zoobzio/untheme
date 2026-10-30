# @untheme/css

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.6.1

## 0.6.0

### Minor Changes

- [#5](https://github.com/zoobzio/untheme/pull/5) [`d2a265e`](https://github.com/zoobzio/untheme/commit/d2a265e6408bc509cd340b01a871e0fd5cbe80f2) Thanks [@zoobzio](https://github.com/zoobzio)! - `patch(patch)` renders the cascade of one patch: its tokens under `:root`,
  then its context overrides as attribute blocks. It returns an empty string
  for an empty patch.

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

- [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e) Thanks [@zoobzio](https://github.com/zoobzio)! - Documentation and source comments are rewritten in Simplified Technical
  English. READMEs, JSDoc, and inline comments across every package use short
  declarative sentences, one idea per sentence, with a consistent vocabulary.
  No code, types, or emitted output change.
- Updated dependencies [[`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e)]:
  - @untheme/schema@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.1

## 0.2.0

### Minor Changes

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Tighten the public surface. `@untheme/css` now exports only `defineRenderer`,
  `property`, and its types — the serializer internals (`serialize`, `emit`,
  `dashed`, `indirection`, and the serializer tables) are no longer part of the
  package surface. The `@untheme/utils` template guard is renamed from `guard`
  to `isTemplate`, matching the naming of every other guard in the workspace.

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

- Updated dependencies []:
  - @untheme/schema@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - @untheme/common@0.1.0
  - @untheme/schema@0.1.0
