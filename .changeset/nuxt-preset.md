---
"@untheme/nuxt": minor
---

The module takes a preset. `untheme: { preset: "@untheme/aurora" }` names a
package that exports a kit build. The module takes the base theme, the boot
selection, the manifest, and the layers from the package. When the build has
layers, from a preset or from the kit config of the app, the module serves
them under `route` with the catalog wire protocol, writes
`#build/untheme/layers.mjs` and one file for each layer, and
`useUnthemeCatalog()` returns a catalog client over the route. The default
route is `/api/untheme`, and `route: false` serves nothing. An app that
serves aurora no longer mounts a server route, lists server assets, or
writes a kit config of its own.
