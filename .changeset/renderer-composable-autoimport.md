---
"@untheme/nuxt": patch
---

Register `useUnthemeRenderer` as a module auto-import, so it resolves through
`#imports` like `useUntheme`. The composable shipped in the previous release but
was only reachable via an explicit path import.
