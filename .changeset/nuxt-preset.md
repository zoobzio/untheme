---
"@untheme/nuxt": minor
---

The module takes a preset. `untheme: { preset: "@untheme/aurora" }` names a
package that exports a kit build. The module takes the base theme, the boot
selection, the manifest, and the layers from the package. When the build has
layers, from a preset or from the kit config of the app, the module writes
`#build/untheme/layers.mjs`, `#build/untheme/layers.json`, and one JSON file
for each layer, and serves the JSON under `route` and the build id with the
catalog wire protocol. Each build has a path of its own, and Nitro caches
each response for the build. `useUnthemeCatalog()` returns a catalog client
over the served path. The default route is `/api/theme`, and `route: false`
serves nothing. An app
that serves aurora no longer mounts a server route, lists server assets, or
writes a kit config of its own.
