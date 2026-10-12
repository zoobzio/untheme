# @untheme/testing

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

- [#1](https://github.com/zoobzio/untheme/pull/1) [`e02d777`](https://github.com/zoobzio/untheme/commit/e02d77757a055558ce5f2fa53a81c8457a73270e) Thanks [@zoobzio](https://github.com/zoobzio)! - A new package, `@untheme/testing`, has test helpers and mocks for code that
  uses untheme. `mockTheme` builds a complete theme from a terse spec. `"#fff"`
  is a color, `"8px"` is a dimension, and `"{blue}"` has the type of `blue`. The
  theme is typed as a `Contract` over its own names, and the schema checks it.
  `bootUntheme` boots a service over the theme. `mockModules`, `mockKit`, and
  `stubKit` stand in for the output of `untheme build` and the result of
  `resolveKit`. `mockCatalog` serves layers from memory. `proveTheme` resolves
  every token at every selection. A test suite runs without DTCG JSON, a kit
  build, or Terrazzo.
- Updated dependencies [[`1092b20`](https://github.com/zoobzio/untheme/commit/1092b20b4cb2a2c16c275a4ccac0967e8aa8c724), [`ac6cc5f`](https://github.com/zoobzio/untheme/commit/ac6cc5f247a5d6650430058b8c8ab4895fa6a78f), [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2), [`3c88cf6`](https://github.com/zoobzio/untheme/commit/3c88cf61e4015aedc0bae4d5e1eecb811c2f9cd3), [`afbf821`](https://github.com/zoobzio/untheme/commit/afbf82171cb07d5986b4af5386d3eddca63aff6d), [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2), [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e)]:
  - @untheme/kit@0.6.0
  - untheme@0.6.0
