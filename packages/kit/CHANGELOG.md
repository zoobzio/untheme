# @untheme/kit

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
