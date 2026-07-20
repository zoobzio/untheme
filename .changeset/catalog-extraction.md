---
"@untheme/catalog": minor
"@untheme/nuxt": minor
"untheme": minor
---

Extract the theme catalog into the standalone `@untheme/catalog` package,
re-exported as `untheme/catalog`. `defineCatalog` builds a provider over
storage callbacks; `defineClient` builds the same surface over a remote
transport, so themes can be sourced from a server as easily as from a local
registry. The Nuxt module serves its catalog layers over the catalog wire
protocol as nitro server assets, keeping theme JSON off the app bundle.
