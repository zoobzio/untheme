---
"@untheme/utils": patch
"@untheme/core": patch
"untheme": patch
"@untheme/nuxt": patch
---

`copy` is no longer exported from `@untheme/utils` or `untheme`; every copy is
objectively's `copy`, a deep structural copy in a single walk. `clone` rebuilds
a theme through `remap` onto its own type. Neither re-reads the source to
prove the rebuild, so snapshotting a theme out of a reactive container — what
`makeUntheme` does at construction, and the Nuxt plugin on every request and
client boot — reads each member once instead of three times, about 60% less
construction time on a large theme.
