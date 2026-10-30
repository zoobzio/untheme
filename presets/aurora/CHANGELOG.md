# @untheme/aurora

## 0.6.1

## 0.6.0

### Minor Changes

- [#7](https://github.com/zoobzio/untheme/pull/7) [`dac15f7`](https://github.com/zoobzio/untheme/commit/dac15f75b6f677e215eac0d93b395386a0efdcb6) Thanks [@zoobzio](https://github.com/zoobzio)! - Aurora exports its ramp generator as `@untheme/aurora/ramp`. `ramp(name, seed)`
  makes one tonal ramp and `palette({ name, description, seeds })` makes a whole
  theme document, as the theme example does.

- [#6](https://github.com/zoobzio/untheme/pull/6) [`ac6cc5f`](https://github.com/zoobzio/untheme/commit/ac6cc5f247a5d6650430058b8c8ab4895fa6a78f) Thanks [@zoobzio](https://github.com/zoobzio)! - A config can extend its source, and a build is a preset.

  **Extend.** `extend` is a fragment of the source document, merged onto it
  before the parse. Objects merge key by key. Arrays concatenate, the items of
  the document first. Any other value replaces the one of the document. A
  relative `$ref` in the fragment resolves from the project root. The merged
  document is plain DTCG, and the proof covers it. The fragment names the node
  that it changes, and the node sets the precedence: a file added to a set
  rebinds the sources before it and loses to every modifier context. A consumer
  of a preset writes token files and no resolver of its own.

  **Presets.** A source that names a package with no path, such as
  `npm:/@untheme/aurora`, is a preset. The kit reads the `preset.json` of the
  package, takes its resolver document as the source, and inherits its layers,
  each checked against the new contract. Every build in a named package writes
  `resolver.json`, the document it parsed with every reference to a file of the
  project rewritten as an `npm:/` reference into the package, and
  `preset.json`, which names it and lists the layers. A package that exports
  both is a source for the next build.

  **The base is a layer.** The first layer of every build has the id and the
  name of the theme. Its tokens are what the config changed about the base of
  its source, or none. A configured layer with the id of the base takes its
  place. Aurora exports `./preset.json` and `./resolver.json`.

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

- [#2](https://github.com/zoobzio/untheme/pull/2) [`1092b20`](https://github.com/zoobzio/untheme/commit/1092b20b4cb2a2c16c275a4ccac0967e8aa8c724) Thanks [@zoobzio](https://github.com/zoobzio)! - Aurora has a kit build of itself beside its DTCG JSON. The package exports the
  modules that `untheme build` writes from `src/resolver.json`. `@untheme/aurora`
  has the `Token`, `Modifier`, `Mod`, and `Context` types and the guards.
  `@untheme/aurora/config` has the base theme, the boot selection, and the
  `Contract` type. `@untheme/aurora/manifest` has the name and the description of
  each modifier and each context. An app imports the config and boots
  `makeUntheme` with no kit of its own. The build has the whole preset and all
  thirty-one themes. The `./src/*` exports are the same as before, so a kit
  config that points at the resolver, keeps some themes, or lists the files in a
  resolver of its own builds as before.

  Aurora has its own test suite. The suite of the kit no longer builds aurora,
  and the kit no longer depends on it. The loader tests of the kit resolve
  `npm:/` references through a fixture package.

- [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e) Thanks [@zoobzio](https://github.com/zoobzio)! - Documentation and source comments are rewritten in Simplified Technical
  English. READMEs, JSDoc, and inline comments across every package use short
  declarative sentences, one idea per sentence, with a consistent vocabulary.
  No code, types, or emitted output change.

## 0.5.0

### Minor Changes

- [`da20c3c`](https://github.com/zoobzio/untheme/commit/da20c3c45625fead95d004711ea692812440c763) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** the palette is a modifier. Aurora is one resolver document,
  `src/resolver.json`, whose `theme` modifier has the 31 themes as its contexts
  — `aurora` the default — beside the eight axes it already had.

  Everything ships under `src/`: `resolver.json`, the base token files in
  `tokens/`, and a folder per modifier in `modifiers/` with one file per context
  (`modifiers/theme/nord.json`, `modifiers/color/dark.json`). The per-theme
  resolver documents, the `tokens/colors/` files, the one-file-per-modifier
  documents read by JSON pointer, and the `index.json` manifest are gone. Each
  theme file carries its own name and description, and every modifier a
  description, which an `@untheme/kit` build emits as its manifest.

  Point an `@untheme/kit` config at `npm:/@untheme/aurora/src/resolver.json`
  and switch palettes with `swap("theme", "nord")`; use the config's
  `modifiers` to keep only some themes. A resolver that lists aurora's files
  refers to them as `npm:/@untheme/aurora/src/tokens/…` and
  `npm:/@untheme/aurora/src/modifiers/<modifier>/<context>.json`.

## 0.4.0

### Minor Changes

- [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** aurora ships only DTCG JSON and has no dependencies. The
  `preset` export, the `AuroraTheme`, `AuroraLayer` and `AuroraInput` types,
  and the `./themes/*` TypeScript modules are gone.

  `aurora.resolver.json` is the entry point: point an `@untheme/kit` config at
  `npm:/@untheme/aurora/aurora.resolver.json`. The tokens are one file per
  thing — `tokens/colors/<color>.json` (the ramps), `tokens/roles/<color>.json`
  (the semantic tokens and their channels), one file per remaining group, and
  `modifiers/<modifier>.json` with one key per context. Token names are
  unchanged, so every CSS custom property keeps its name.

  All 31 themes ship as JSON: `themes/index.json` lists their id, name and
  description, and `themes/<id>/colors/` holds the eight ramp files each one
  rebinds. Every file is exported for Node package resolution.

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - @untheme/kit@0.3.0
  - @untheme/schema@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @untheme/kit@0.2.3
  - @untheme/schema@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @untheme/kit@0.2.2
  - @untheme/schema@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @untheme/kit@0.2.1
  - @untheme/schema@0.2.1

## 0.2.0

### Patch Changes

- Updated dependencies []:
  - @untheme/kit@0.2.0
  - @untheme/schema@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - @untheme/kit@0.1.0
  - @untheme/schema@0.1.0
