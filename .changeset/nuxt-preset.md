---
"@untheme/nuxt": minor
---

The module takes a preset. `untheme: { preset: "@untheme/aurora" }` names a
package that exports a kit build. The module takes the base theme, the boot
selection, the manifest, and the layers from the package. When the build has
layers, from a preset or from the kit config of the app, the module adds
`load` to `#build/untheme/layers.mjs`: one lazy import for each layer. The
list and the layers of a preset are the package's own. `useUnthemeCatalog()`
returns a catalog over the module: `list` pages the entries and `get` imports
one layer on demand. The service of `useUntheme()` gains `layers`, the
entries of the build, and `select(id)`, which loads a layer and applies it.
On the server, the key cookie restores the applied layer before the first
render, as the input cookie restores the selection. An app that serves
aurora no longer mounts a server route, lists server assets, writes a kit
config, or binds a theme picker of its own.
