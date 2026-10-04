# untheme

A type-safe design token system with runtime theming, built on the
[DTCG](https://www.designtokens.org/) 2025.10 token format.

untheme separates the **contract** — which tokens exist, their types, and how
they reference each other — from the **values that fill it**. Modifier axes
rebind tokens per context (light/dark, density, contrast, motion, …), theme
layers rebind them wholesale, and references stay live all the way into CSS:
a role points at a ramp as a `var()` indirection, so swapping a context or
theme cascades through the custom-property graph instead of recompiling
styles. The contract is carried in the types — token names, axes, and
contexts autocomplete and misuse fails to compile — and re-proved at runtime
by a schema derived from the theme itself.

## Anatomy

A theme is a flat map of DTCG token definitions, modifier axes whose contexts
rebind subsets of them, and an order fixing composition precedence. Themes are
authored as standard DTCG JSON — token files, and a
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

One `untheme.config.ts` points at it, and [`@untheme/kit`](./packages/kit)
builds it:

```ts
// untheme.config.ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({ source: "./tokens/app.resolver.json" });
```

```sh
untheme build
```

The build reads the documents with `@terrazzo/parser`, converts them to an
untheme theme, validates it, proves it against Terrazzo's own resolution, and
writes two modules with declarations into `untheme/`: `index.mjs` (the `Token`
union, modifier and context types, guards) and `config.mjs` (the base theme
and the boot selection — each modifier's `default` context). The runtime
packages never touch Terrazzo; they consume the built config:

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";

import config, { type Contract } from "./untheme/config.mjs";

const untheme = makeUntheme<Contract>(useUnthemeConfig(config));

untheme.resolve("primary"); // the blue-600 color object
untheme.swap("color", "dark"); // primary now follows {blue-200}
```

Rendering to CSS keeps the reference graph intact:

```ts
import { defineRenderer } from "untheme/css";

const renderer = defineRenderer(untheme);

renderer.var("primary"); // "var(--primary)"
renderer.root(); // :root block over the active bindings
renderer.sheet(); // static cascade: base + per-context attribute blocks
```

The [aurora](./presets/aurora) preset is the reference theme: nine modifier
axes over eight tonal ramps, shipped as DTCG JSON — the palette is one of the
axes, with 31 themes as its contexts. Point a config at its resolver with an
`npm:/` reference — `source: "npm:/@untheme/aurora/src/resolver.json"` — and
use the config's `modifiers` to keep only the themes you want, add your own,
or turn an axis off; or list its files in a resolver of your own to add
tokens on top.

## Workspace

| Directory                        | Contents                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [`packages`](./packages)         | The library: the public [`untheme`](./packages/untheme) package, the internals behind it, and the build kit |
| [`presets`](./presets)           | Reusable presets as DTCG JSON — [`@untheme/aurora`](./presets/aurora) is the reference                      |
| [`integrations`](./integrations) | Framework bridges — the Nuxt module, and Shiki and CodeMirror highlighting                                  |
| [`examples`](./examples)         | A themeable Nuxt app, and Shiki and CodeMirror highlighting demos                                           |

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
