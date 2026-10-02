---
"@untheme/nuxt": minor
---

**Breaking:** the `@untheme/nuxt/aurora` entry is removed, along with
`createAuroraThemeHandler`, `loadAuroraTheme` and `auroraThemes`, and
`@untheme/aurora` is no longer a peer dependency. Serve aurora's themes with
`createThemeHandler` from `@untheme/nuxt/server`; the Nuxt example's
`server/aurora` folder shows how.
