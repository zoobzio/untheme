# @untheme/kit

## 0.6.0

### Minor Changes

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

- [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2) Thanks [@zoobzio](https://github.com/zoobzio)! - Builds run about a third faster. Terrazzo is parsed with `alphabetize` off —
  its sort built a collator per comparison and re-sorted every group index on
  every context resolution, the single largest cost of a build — and the kit
  orders each token set once with the same natural, numeric-aware collation.
  The emitted modules are byte for byte what they were.

- [`3c88cf6`](https://github.com/zoobzio/untheme/commit/3c88cf61e4015aedc0bae4d5e1eecb811c2f9cd3) Thanks [@zoobzio](https://github.com/zoobzio)! - The kit test suite runs about a third faster. The narrowed aurora builds have
  their own test file, so they no longer wait on the full 31-theme build in the
  same worker, and they compare against a two-theme reference instead of the
  full build. Vitest reuses workers across files. No source or emitted output
  changes.

- [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e) Thanks [@zoobzio](https://github.com/zoobzio)! - Documentation and source comments are rewritten in Simplified Technical
  English. READMEs, JSDoc, and inline comments across every package use short
  declarative sentences, one idea per sentence, with a consistent vocabulary.
  No code, types, or emitted output change.
- Updated dependencies [[`155d4b1`](https://github.com/zoobzio/untheme/commit/155d4b1825112e0da16277fd4977d59272546be0), [`afbf821`](https://github.com/zoobzio/untheme/commit/afbf82171cb07d5986b4af5386d3eddca63aff6d), [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2), [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e)]:
  - @untheme/core@0.6.0
  - @untheme/utils@0.6.0
  - @untheme/schema@0.6.0

## 0.5.0

### Minor Changes

- [`0a1d799`](https://github.com/zoobzio/untheme/commit/0a1d79977c917251d31baf869b69315bdeac1f0e) Thanks [@zoobzio](https://github.com/zoobzio)! - The config takes `modifiers`: what a build keeps of the resolver document's
  modifiers, by name.

  - `contexts` keeps only the listed contexts, in the listed order; a context
    left out is not built and its files are not read.
  - `default` names the context a modifier boots at.
  - `add` gives a modifier contexts of your own, each a token file the config
    points at.
  - `false` turns a modifier off, leaving its default context in the base.

  ```ts
  export default defineConfig({
    source: "npm:/@untheme/aurora/src/resolver.json",
    modifiers: {
      theme: {
        add: { brand: "./tokens/brand.json" },
        contexts: ["brand", "nord"],
      },
      depth: false,
    },
  });
  ```

  Every build also emits `manifest.mjs`: each modifier and each context it kept,
  with an id, a display name and a description, for the interface that lets
  someone choose. Descriptions are read off the documents — a modifier's
  `description`, the root `$description` of a context's token file — and a name
  off `$extensions["io.zoobz.untheme"].name`, falling back to the id, titled. `resolveKit`
  returns the same `manifest`, and `describe(theme)` builds one from a theme
  alone.

### Patch Changes

- Updated dependencies []:
  - @untheme/core@0.5.0
  - @untheme/schema@0.5.0
  - @untheme/utils@0.5.0

## 0.4.0

### Minor Changes

- [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** `@untheme/kit` is now a generator, and DTCG JSON is the only
  way to define tokens. `defineUnthemePreset`, `makePreset`, `configure`,
  `define`, `use` and their types are gone.

  One authored `untheme.config.ts` points at a DTCG resolver document —
  `defineConfig({ source, id?, name?, outDir? })` — and
  `untheme build [--config <file>] [--root <dir>]` writes two modules with
  declarations to `outDir` (default `untheme/`): `index.mjs` (the `Token`
  union, modifier and context types, the token and modifier lists, `isToken`
  and `isModifier`) and `config.mjs` (the base `theme`, the boot `input` — each
  modifier's `default` context — and the `Contract` type). A `.untheme.json`
  manifest lets the next build remove only the files it wrote. The kit emits no
  CSS and no theme layers.

  `source` is a path, a URL, or an `npm:/` reference into an installed package
  (`npm:/@untheme/aurora/aurora.resolver.json`), resolved with Node package
  resolution from the project root. Composition and layering use the resolver
  format itself: to extend a theme, write a resolver that lists its files.

  The code of `@untheme/terrazzo` moved into the kit, which reads documents
  with `@terrazzo/parser` only, converts them, validates them with untheme's
  schema, and proves the result against Terrazzo's own resolution.
  `@untheme/terrazzo` and its `plugin` for `tz build` are no longer developed;
  use the kit instead. A modifier declared inline in `resolutionOrder` is now
  built — it used to be dropped without an error.

  `generate()`, `writeOutput()` and `build()` are the programmatic pipeline;
  `resolveKit()` returns `{ theme, input, outDir, documents }` without writing
  files.

  `emit({ theme, input })` is exported: it returns the `index` and `config`
  modules for a built theme without reading or writing anything.

### Patch Changes

- Updated dependencies [[`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329)]:
  - @untheme/core@0.4.0
  - @untheme/utils@0.4.0
  - @untheme/schema@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - @untheme/core@0.3.0
  - @untheme/schema@0.3.0
  - @untheme/utils@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @untheme/core@0.2.3
  - @untheme/schema@0.2.3
  - @untheme/utils@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @untheme/core@0.2.2
  - @untheme/schema@0.2.2
  - @untheme/utils@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @untheme/core@0.2.1
  - @untheme/schema@0.2.1
  - @untheme/utils@0.2.1

## 0.2.0

### Patch Changes

- Updated dependencies [[`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6)]:
  - @untheme/utils@0.2.0
  - @untheme/core@0.2.0
  - @untheme/schema@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - @untheme/core@0.1.0
  - @untheme/schema@0.1.0
  - @untheme/utils@0.1.0
