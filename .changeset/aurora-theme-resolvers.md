---
"@untheme/aurora": minor
---

**Breaking:** the palette is a modifier. Aurora is one resolver document,
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
