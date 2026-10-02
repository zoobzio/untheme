---
"untheme": minor
"@untheme/core": minor
"@untheme/utils": minor
---

**Breaking:** the TypeScript authoring path is removed; themes are built from
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
