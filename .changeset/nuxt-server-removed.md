---
"@untheme/nuxt": minor
---

**Breaking:** the `@untheme/nuxt/server` entry is removed, along with
`createThemeHandler`, and `h3` is no longer a dependency. The module serves
the layers of the build through `useUnthemeCatalog()` and `select(id)` of
`useUntheme()`; a theme served from elsewhere takes a catalog client of the
app's own.
