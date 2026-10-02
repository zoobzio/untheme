---
"@untheme/nuxt": minor
---

**Breaking:** the module's theme is now an `@untheme/kit` build, taken one of
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
