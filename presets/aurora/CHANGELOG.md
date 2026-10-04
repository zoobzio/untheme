# @untheme/aurora

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
