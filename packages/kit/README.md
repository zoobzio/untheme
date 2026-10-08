# @untheme/kit

The kit reads DTCG JSON documents and writes modules for the untheme runtime.
The input is a resolver document and the token files that it references. An
`untheme.config.ts` file points at the resolver document.

The kit writes four kinds of output:

- **Keys:** the `Token` union, the modifier and context types, the token and
  modifier lists, and the `isToken` and `isModifier` guards.
- **Contract:** the base theme and the boot selection for `makeUntheme`.
- **Manifest:** the name and description of each modifier and context.
- **Layers:** one JSON file for each layer of the config, ready for `apply`,
  and a list of the layers.

The kit converts the documents to an untheme theme and validates the theme with
the untheme schema. Then the kit compares the theme with the resolution of
[`@terrazzo/parser`](https://terrazzo.app). Then the kit checks each layer
against the contract of the theme.

## Install

```sh
pnpm add -D @untheme/kit
```

## Config

Put `untheme.config.ts` in the project root.

```ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({
  // Required. A path, a URL, or an npm:/ reference to the resolver document.
  source: "npm:/@untheme/aurora/src/resolver.json",

  // Optional. These values replace the identity in the resolver document.
  id: "app",
  name: "App",

  // Optional. Selects the modifiers and contexts to build. See Modifiers.
  modifiers: {
    depth: false,
  },

  // Optional. Token documents to build as layers, by id. See Layers.
  layers: {
    nord: "npm:/@untheme/aurora/src/themes/nord.json",
    brand: "./tokens/brand.json",
  },

  // Optional. The output directory, relative to the project root.
  outDir: "untheme",
});
```

- **Identity.** The default `name` is the `name` of the resolver document. The
  default `id` is the slug of that name. A token document that has no resolver
  has no name, so `name` is required for it.
- **Boot selection.** Each modifier boots at the `default` context that the
  resolver document declares. The `modifiers` option can name another context.
  Each modifier needs a default context.
- **Layers.** A layer is a token document that rebinds tokens of the base
  theme. A palette is a layer, for example each theme of aurora. The runtime
  applies a layer with `apply`. See Layers.

The kit checks the config before it reads a document. The kit reports all
problems together.

```
@untheme/kit: the config is invalid —
  source must be a path, a URL, or an npm:/ reference
  outDir "../out" must be a subdirectory of the project root
```

## Modifiers

The `modifiers` option selects what the build takes from each modifier of the
resolver document. The key is the name of the modifier. The build uses each other modifier as the
document declares it.

```ts
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
  modifiers: {
    color: {
      add: { dim: "./tokens/dim.json" },
      contexts: ["light", "dim", "dark"],
      default: "dim",
    },
    motion: { contexts: ["default", "reduced"] },
    depth: false,
  },
});
```

- **`contexts`** lists the contexts to keep, in order. The build drops each
  other context, and its files, from the theme and the types. If `contexts` is absent, the build keeps all declared contexts and
  then the added contexts.
- **`default`** names the context where the modifier boots. The tokens of this
  context become the base. Each other kept context is a set of overrides of the
  base. If `default` is absent, the build uses the default of the document when
  the build keeps it, or else the first kept context.
- **`add`** adds contexts to the modifier. Each key is a context name. Each
  value is a token file or a list of token files. In a list, a later file wins.
  A file is a path, a URL, or an `npm:/` reference, as for `source`. An added
  context can rebind only the tokens that the base defines.
- **`false`** turns the modifier off. The default context stays in the base.
  The theme order, the types, and the boot selection omit the modifier.

The kit applies the config to the resolver document before the parser reads the
document. The build and the proof use the document that the config describes.
The build fails with a config error in these cases:

- The config names a modifier that is absent from the document.
- The config names a context that is absent from the document.
- An added context has a name that is in use.
- The default names a context that the build drops.

The kit reports all config errors together.

```
@untheme/kit: the config is invalid —
  modifiers.theme.contexts: "nrod" is not a context of "theme" (abyss, aurora, ...)
  modifiers.shadow: the source declares no modifier "shadow" (theme, color, ...)
```

To add tokens, write a resolver document. See Composition.

## Layers

The `layers` option names token documents to build as layers. The key is the
id of the layer. The value is a token file or a list of token files. In a list,
a later file wins. A file is a path, a URL, or an `npm:/` reference, as for
`source`.

```ts
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
  layers: {
    nord: "npm:/@untheme/aurora/src/themes/nord.json",
    brand: ["./tokens/brand.json", "./tokens/brand-accents.json"],
  },
});
```

A layer is a partial theme with an identity. It rebinds tokens that the base
theme defines. It does not add tokens. The runtime takes a layer with `apply`
and makes the active theme from the base theme and the layer.

The kit builds a layer in four steps:

1. Terrazzo parses the documents of the layer with aliases unresolved. It
   flattens the groups and normalizes the values. A reference stays a `{name}`
   string. The parse reads no document of the base theme.
2. The kit converts each token to its binding.
3. The kit checks the layer against the contract of the base theme. Every
   token must be a token of the base. The `$type` of a token must be the type
   of the token in the contract. A reference must name a token of the base. A
   value must have the shape of its type.
4. The kit writes the layer as `layers/<id>.json`.

The build fails with an `InvalidLayerError` when a layer breaks a rule. The
error names the layer and the token for each issue, and reports all issues of
all layers together.

```
@untheme/kit: the layers violate the contract —
  layers.brand: tokens.primary-50 declares type "dimension", the contract has "color"
  layers.brand: tokens.accent: Overrides contains an unknown key 'accent'.
```

The name of a layer is the `name` under the `io.zoobz.untheme` key of
`$extensions` at the root of the last document that has one, or the titled id.
The description is the `$description` at the root of the last document that
has one. The `layers` module lists each layer with its id, name, and
description, in the order of the config.

A layer rebinds the base. A selected context rebinds on top of the base. When
a layer and a context both bind a token, the context wins while it is
selected. A user override wins over both.

```ts
import nord from "./untheme/layers/nord.json" with { type: "json" };
import { layers } from "./untheme/layers.mjs";

untheme.apply(nord); // the active theme is the base with nord merged in
layers; // [{ id: "nord", name: "Nord", description: "..." }, ...]
```

A server can send a layer file as it is. `defineClient` from `untheme/catalog`
reads it and checks it again against the contract of the app.

## Sources

A `source` and each `$ref` in the documents is one of these:

- **A path.** The kit resolves it from the project root, for example
  `./tokens/app.resolver.json`.
- **A URL**, for example `https://tokens.example.com/app.resolver.json`. The
  kit fetches a remote document with no credentials. Pass a `req` loader to
  send credentials.
- **An `npm:/` reference** to an installed package, for example
  `npm:/@untheme/aurora/src/resolver.json`. The kit resolves the reference with
  Node package resolution from the project root. The package must export the
  file. The slash after the colon is required. It makes the relative `$ref`
  values in the package resolve. For example, `./tokens/space.json` becomes
  `npm:/@untheme/aurora/src/tokens/space.json`.

## Composition

To add tokens, write a resolver document in the DTCG resolver format. List the
files as sets. Use an `npm:/` reference for a package. Add your own set. Then
declare each modifier again with the files of each context.

```json
{
  "name": "App",
  "version": "2025.10",
  "sets": {
    "acme": { "sources": [{ "$ref": "npm:/@acme/tokens/base.json" }] },
    "app": { "sources": [{ "$ref": "./app.json" }] }
  },
  "modifiers": {
    "color": {
      "contexts": {
        "light": [],
        "dark": [
          { "$ref": "npm:/@acme/tokens/dark.json" },
          { "$ref": "./app-dark.json" }
        ]
      },
      "default": "light"
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/acme" },
    { "$ref": "#/sets/app" },
    { "$ref": "#/modifiers/color" }
  ]
}
```

- The position of a set in `resolutionOrder` decides which value wins.
- A `$ref` references a file. The kit ignores a `$ref` in `resolutionOrder`
  that points to a modifier in another file.
- A `$ref` can include a JSON pointer to a part of a file, for example
  `color.json#/dark`.

The [shiki example](../../examples/shiki) extends aurora in this way.

## Rules

The build fails and names the token and its document in these cases:

- A modifier has no `default` context.
- A context binds a token that is absent from the base. A context can only
  rebind tokens.
- Two token names become the same CSS custom property, for example `a.b` and
  `a-b`.
- A token uses a Terrazzo beta type: `boolean`, `string`, or `link`.
- A value is outside the untheme schema, for example an `em` dimension or an
  inset shadow.
- An alias points to a token outside the loaded documents.

A document can declare a modifier in the top-level `modifiers` map or inline in
`resolutionOrder`. Both forms become axes, in resolution order.

## Build

```sh
untheme build [--config <file>] [--root <dir>]
```

The command reads the documents and writes the modules to `outDir`.

The build ends with a proof. The proof resolves each token with Terrazzo and
with untheme and compares the results. The proof checks each selection that
Terrazzo can enumerate. Terrazzo enumerates up to 1,000 permutations. Above
that limit, the proof checks the defaults and each single-context change.

The build keeps the other files in the output directory. Each build records
the files that it wrote in `.untheme.json` in that directory. The next build overwrites
those files. It removes each recorded file that is absent from the new build.

In an app, import the modules by relative path, for example
`./untheme/config.mjs`. Run `untheme build` before typecheck and before the app
starts.

## What it emits

| File               | Contents                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| `index.mjs`        | `type Token`, `type Modifier`, `type Mod`, `type Context`, `tokens`, `modifiers`, `isToken`, `isModifier` |
| `config.mjs`       | `theme`, `input`, and `{ theme, input }` as the default export. `useUnthemeConfig` takes this value.      |
| `manifest.mjs`     | `manifest`, a list of the modifiers and their contexts. Each entry has an id, a name, and a description.  |
| `layers.mjs`       | `layers`, a list of the layers. Each entry has an id, a name, and a description. `type LayerId`.          |
| `layers/<id>.json` | One layer, as `apply` takes it: `id`, `name`, and `tokens`.                                               |
| `.untheme.json`    | The record of the written files.                                                                          |

Each module has a `.d.mts` file beside it. The declarations use explicit
unions. `config.d.mts` exports `type Contract`, which is the untheme type
`Contract<Token, Mod>`. The root entry contains no token data. The declarations
import types from `untheme`, which the app depends on.

At runtime, [`@untheme/css`](../css) renders CSS from the active theme.

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineRenderer } from "untheme/css";

import config, { type Contract } from "./untheme/config.mjs";
import { isToken } from "./untheme/index.mjs";

const untheme = makeUntheme<Contract>(config.theme, useUnthemeConfig(config));
const renderer = defineRenderer(untheme);
```

## Manifest

The `manifest.mjs` module lists the modifiers for a settings panel. It has one
entry for each modifier, in the order of the theme. Each entry has one entry
for each context that the build kept.

```ts
import { manifest } from "./untheme/manifest.mjs";

// [
//   {
//     id: "theme",
//     name: "Theme",
//     description: "The palette: each context is one theme's eight tonal ramps.",
//     contexts: [
//       { id: "nord", name: "Nord", description: "Arctic blues on polar grays, from Nord" },
//       { id: "night_owl", name: "Night Owl", description: "..." },
//     ],
//   },
//   ...
// ]

for (const modifier of manifest) {
  // Render a <select> with the label modifier.name.
  // Render one <option> for each item of modifier.contexts.
  // On change, call untheme.swap(modifier.id, context.id).
}
```

The names and descriptions come from the documents:

- **The description of a modifier** is the `description` of the modifier in the
  resolver document.
- **The description of a context** is the `$description` at the root of the
  token file that the context applies. If the context applies several files,
  the last file that has a `$description` supplies it.
- **A name** is the `name` under the `io.zoobz.untheme` key of `$extensions`.
  Put it on the modifier or at the root of the file of the context:
  `"$extensions": { "io.zoobz.untheme": { "name": "Night Owl" } }`. If no name
  is set, the name is the id in title case. The id `night_owl` becomes
  `Night Owl`.

An entry that has no description omits the `description` key. The manifest
follows the config. It omits a context that the config drops. It describes an
added context with the file of that context. It omits a modifier that the
config turns off. `manifest.d.mts` types the `id` of each entry with the
`Modifier` and `Context` unions.

## With Nuxt

[`@untheme/nuxt`](../../integrations/nuxt) finds `untheme.config.ts` and builds
it in memory. Use it with no `untheme build` step. For a theme that you
build elsewhere, pass the `theme` and `input` of the generated `config` module
as the `untheme` option.

## Programmatic

- `generate(config, { cwd, req, logger })` reads and converts the documents. It
  returns `{ outDir, files }` and writes no files.
- `writeOutput` writes the files that `generate` returns.
- `build()` runs the pipeline of the CLI.
- `resolveKit(config, options)` returns `{ theme, input, manifest, layers,
outDir, documents }`. The `documents` value lists each local file that the
  build read, the documents of the layers among them. Each item of `layers`
  has the `layer` and its `entry`.
- `emit({ theme, input, manifest, layers })` turns a built theme and selection
  into the modules. The Nuxt module uses `emit`. If `manifest` is absent,
  `emit` makes one from the theme, and each name is the id in title case. If
  `layers` is absent, the layer list is empty.
- `describe(theme)` returns that manifest.

The `cwd` option is the project root. The kit resolves paths and `npm:/`
references from it. The `req` option loads each `file:` document and each
remote document. The kit always resolves `npm:` references from the packages of
the project. Use `req` to load authenticated sources.

The kit throws these errors:

- `InvalidConfigError` when the config breaks a rule. The error has the
  problems in `issues`. The kit checks the config before it reads a document.
  The kit checks what `modifiers` says about the source after it reads the
  resolver document.
- `MissingConfigError` when `build()` finds no config file.
- `MalformedConfigError` when the default export of the file is a value other than
  a config object.

- `InvalidLayerError` when a layer violates the contract of the base theme.
  The error has the problems in `issues`. The kit checks the layers after it
  builds the base theme.

`MissingConfigError` and `MalformedConfigError` have the `path` of the file.
