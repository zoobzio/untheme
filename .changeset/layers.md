---
"@untheme/aurora": minor
"@untheme/kit": minor
"@untheme/core": minor
"@untheme/css": minor
"@untheme/testing": minor
"@untheme/nuxt": minor
"untheme": minor
---

Themes are layers. The kit builds them, the service applies them, and the
contract does not carry them.

**Kit.** A config can declare `layers`. Each layer is a DTCG token document
or a list of them, in the same source forms as `add`. The build normalizes
each document with Terrazzo, converts it to a `Layer`, and checks it against
the built contract with the schema. The build fails with the file and the
token when a layer is not applicable. The build writes `layers/<id>.json` for
each layer and a `layers.mjs` module with the id, the name, and the
description of each one. A server returns the JSON as it is. `apply` takes it
as it is.

**Aurora.** The `theme` modifier is gone. The ramps of the aurora palette are
a base set of the resolver. The thirty-one palettes are layers under
`src/themes/`, built to `.dist/layers/`. The package exports
`@untheme/aurora/layers` and `@untheme/aurora/layers/<id>.json`. The built
config shrinks from 725 KB to 55 KB of JSON. The preset has eight modifiers.

**Core.** `makeUntheme(theme, config, options?)` takes the base theme and
the state container as separate arguments. The container holds what changed:
the applied `layer`, the `input`, and the `override`. The base theme is not
in the container. The service derives the active theme from the base and the
layer and exposes it as `theme()`. With no layer, `theme()` is the base
theme. `apply` stores a copy of the layer. `update` folds a patch into the
applied layer, or makes a layer with the identity of the base theme. The
middleware slots are `layer`, `input`, and `override`. `useUnthemeConfig`
returns `{ input, override }`.

**CSS.** A renderer `Source` has `theme()` in place of `config.theme`. The
core service is still a `Source`.

**Testing.** `bootUntheme` passes the theme as the base of the service.

**Nuxt.** The state in `useState` is the container: the selection, the
override, and the applied layer. The theme travels in the module only. The
module writes `#build/untheme.css` and no longer links it into the app CSS;
the runtime `<style>` block is the CSS of the active state. The `css` option
is gone. The `untheme:theme` hook is now `untheme:layer` and receives the
applied layer. The example serves the aurora layers from a server route and
applies them from a picker.
