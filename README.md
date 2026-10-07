# untheme

untheme is a type-safe design token system with runtime theming. It uses the
[DTCG](https://www.designtokens.org/) 2025.10 token format.

This repo contains the untheme library, a build kit, a reference preset,
framework integrations, and examples.

A theme has a contract and values. The contract lists the tokens, their types,
and their references. The values fill the contract.

Modifier axes rebind tokens for a context, such as light or dark. A theme layer
rebinds tokens for a whole theme. A role refers to a ramp with a `var()`
reference. A change of context or theme updates the custom properties in CSS.

The types contain the contract. Token names, axes, and contexts autocomplete in
the editor. A wrong name fails to compile. A schema that the build derives from
the theme checks the contract at runtime.

## Anatomy

A theme has a flat map of DTCG token definitions, modifier axes, and an order
for composition. Each context of a modifier axis rebinds a subset of the
tokens. You write a theme as DTCG JSON. The files are token files and a
[resolver document](https://www.designtokens.org/tr/2025.10/resolver/) that
declares the modifiers:

```json
{
  "name": "App",
  "version": "2025.10",
  "sets": {
    "base": { "sources": [{ "$ref": "./tokens.json" }] }
  },
  "modifiers": {
    "color": {
      "contexts": {
        "light": [],
        "dark": [{ "primary": { "$type": "color", "$value": "{blue-200}" } }]
      },
      "default": "light"
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/base" },
    { "$ref": "#/modifiers/color" }
  ]
}
```

An `untheme.config.ts` file points at the resolver document. The
[`@untheme/kit`](./packages/kit) package builds the theme:

```ts
// untheme.config.ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({ source: "./tokens/app.resolver.json" });
```

```sh
untheme build
```

The build reads the documents with `@terrazzo/parser`. It converts them to an
untheme theme and validates the theme. It checks the theme against the
resolution of Terrazzo. It writes two modules with declarations into
`untheme/`. `index.mjs` exports the `Token` union, the modifier and context
types, and the guards. `config.mjs` exports the base theme and the boot
selection, which is the `default` context of each modifier. The runtime
packages read the built config:

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";

import config, { type Contract } from "./untheme/config.mjs";

const untheme = makeUntheme<Contract>(useUnthemeConfig(config));

untheme.resolve("primary"); // the blue-600 color object
untheme.swap("color", "dark"); // primary now follows {blue-200}
```

The CSS renderer keeps the reference graph:

```ts
import { defineRenderer } from "untheme/css";

const renderer = defineRenderer(untheme);

renderer.var("primary"); // "var(--primary)"
renderer.root(); // :root block over the active bindings
renderer.sheet(); // static cascade: base + per-context attribute blocks
```

The [aurora](./presets/aurora) preset is the reference theme. It has nine
modifier axes and eight tonal ramps, as DTCG JSON. The `theme` axis has 31
contexts, one for each theme.

The package also has a kit build of the JSON. Import the config module to boot
the whole preset with no kit of your own:

```ts
import config, { type Contract } from "@untheme/aurora/config";
```

To take part of the preset, point a config at the resolver of the preset with
an `npm:/` reference:

```ts
source: "npm:/@untheme/aurora/src/resolver.json";
```

The config `modifiers` field keeps the themes you want, adds your own themes,
or turns an axis off. You can also list the files of the preset in your own
resolver and add tokens.

## Workspace

| Directory                        | Contents                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| [`packages`](./packages)         | The library, the `untheme` package, and the build kit                                   |
| [`presets`](./presets)           | The presets as DTCG JSON. [`@untheme/aurora`](./presets/aurora) is the reference preset |
| [`integrations`](./integrations) | The Nuxt module and the Shiki and CodeMirror theme packages                             |
| [`examples`](./examples)         | A Nuxt app, a Shiki demo, and a CodeMirror demo                                         |

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## License

MIT
