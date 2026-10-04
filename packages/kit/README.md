# @untheme/kit

The generator. One authored `untheme.config.ts` points at DTCG JSON — a
resolver document and the token files it references — and becomes modules the
runtime service consumes:

- **Keys:** the `Token` union, the modifier and context types, the token and
  modifier lists, and `isToken` / `isModifier` guards.
- **Contract:** the base theme and the boot selection, ready for
  `makeUntheme`.

The documents are read with [`@terrazzo/parser`](https://terrazzo.app) — only
the parser; no Terrazzo CLI or plugins. The kit converts them to an untheme
theme, validates it with untheme's schema, and proves the conversion against
Terrazzo's own resolution. The runtime packages never import Terrazzo.

## Config

`untheme.config.ts` at the project root:

```ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({
  // Required. The resolver document: a path, a URL, or an npm:/ reference.
  source: "npm:/@untheme/aurora/themes/aurora/resolver.json",

  // Optional. They replace the identity from the resolver document.
  id: "app",
  name: "App",

  // Optional. Output directory, relative to the project root. The default.
  outDir: "untheme",
});
```

- **Identity.** The resolver document's `name` is the default name, and its
  slug is the default id. A plain token document (no resolver) has no name, so
  there `name` is required.
- **Boot selection.** Not authored: each modifier boots at the `default`
  context the resolver document declares. Every modifier needs one.
- **Themes.** Not part of the config. The kit builds the base theme only;
  serving alternative themes is the app's concern.

The config is checked before any document is read, and every problem is
reported together:

```
@untheme/kit: the config is invalid —
  source must be a path, a URL, or an npm:/ reference
  outDir "../out" must be a subdirectory of the project root
```

## Sources

A `source` — and every `$ref` inside the documents — is one of:

- **A path**, resolved against the project root (`./tokens/app.resolver.json`).
- **A URL** (`https://tokens.example.com/app.resolver.json`). Remote documents
  are fetched without credentials; pass a `req` loader to authenticate.
- **An `npm:/` reference** into an installed package:
  `npm:/@untheme/aurora/themes/aurora/resolver.json`. It resolves with Node package
  resolution from the project root, so the package must export the file. The
  slash after the colon is required: it makes relative `$ref`s inside the
  package resolve (`../../tokens/space.json` →
  `npm:/@untheme/aurora/tokens/space.json`).

## Composition

Layering is the DTCG resolver format itself; the kit adds no API for it. To
extend a theme, write a resolver of your own that lists its files as sets —
by `npm:/` reference for a package — adds yours, and declares each modifier
again with the files of each context:

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

The position of a set in `resolutionOrder` decides which value wins. A
resolver document cannot pull a modifier, a context, or a set out of another
resolver document by `$ref`, and a `$ref` in `resolutionOrder` to a modifier in
another file is accepted and then ignored — so list files, not resolvers. A
`$ref` may carry a JSON pointer to part of a file (`color.json#/dark`). The
[shiki example](../../examples/shiki) extends aurora this way.

## Rules

The build fails, naming the token and its document, when:

- a modifier has no `default` context;
- a context binds a token the base does not define — contexts only rebind;
- two token names become the same CSS custom property (`a.b` and `a-b`);
- a token uses one of Terrazzo's beta types (`boolean`, `string`, `link`);
- a value is outside untheme's schema (an `em` dimension, an inset shadow);
- an alias points at a token that was not loaded.

Modifiers may be declared in the top-level `modifiers` map or inline in
`resolutionOrder`; both become axes, in resolution order.

## Build

```sh
untheme build [--config <file>] [--root <dir>]
```

Reads the documents and writes the modules to `outDir`. A build of
[aurora](../../presets/aurora), proof included, takes about a second.

The proof resolves every token with Terrazzo and with untheme and compares
them, at every selection Terrazzo can enumerate. Above Terrazzo's permutation
limit (1,000; aurora has 2,916) it proves the defaults and each single-context
change instead.

The output directory is never cleared, so it can sit beside authored source.
Each build records the files it wrote in `.untheme.json` there; the next build
overwrites its own files and removes only the ones that manifest lists and it
no longer produces. A file the kit did not write is never touched.

In an app, import the modules by relative path (`./untheme/config.mjs`) and run
`untheme build` before typechecking and before the app starts.

## What it emits

| File            | Contents                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `index.mjs`     | `type Token`, `type Modifier`, `type Mod`, `type Context`, `tokens`, `modifiers`, `isToken`, `isModifier` |
| `config.mjs`    | `theme`, `input`, and `{ theme, input }` as the default — what `useUnthemeConfig` takes                   |
| `.untheme.json` | the manifest of written files                                                                             |

Each module ships with a `.d.mts` beside it, typed by explicit unions rather
than inference from a literal: `config.d.mts` exports `type Contract` —
untheme's `Contract<Token, Mod>`. The root entry carries no token data, so
importing a guard never pulls the theme into a bundle. The declarations import
types from `untheme`, which the app depends on.

The kit emits no CSS and no theme layers: the runtime renders CSS from the
active theme with [`@untheme/css`](../css).

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineRenderer } from "untheme/css";

import config, { type Contract } from "./untheme/config.mjs";
import { isToken } from "./untheme/index.mjs";

const untheme = makeUntheme<Contract>(useUnthemeConfig(config));
const renderer = defineRenderer(untheme);
```

## With Nuxt

[`@untheme/nuxt`](../../integrations/nuxt) finds `untheme.config.ts` and builds
it itself, in memory — no `untheme build` step. For a theme built elsewhere,
pass the generated `config` module's `theme` and `input` as the `untheme`
option.

## Programmatic

`generate(config, { cwd, req, logger })` reads and converts the documents and
returns `{ outDir, files }` without writing anything; `writeOutput` writes
them, and `build()` runs the whole CLI pipeline. `resolveKit(config, options)`
stops one step earlier and returns the documents themselves —
`{ theme, input, outDir, documents }`, where `documents` lists every local file
the build read — for a consumer that wants them in memory rather than as files.
`emit({ theme, input })` turns a built theme and selection into the same
modules, for a consumer that registers them itself — the Nuxt module does.

`cwd` is the project root that paths and `npm:/` references resolve from. `req`
loads every `file:` and remote document (`npm:` references always resolve from
the project's packages), so authenticated sources work.

A config that breaks the kit's rules throws `InvalidConfigError` before any
document is read, carrying every problem as `issues`. `build()` throws
`MissingConfigError` when there is no config file and `MalformedConfigError`
when the file does not default-export a config; both carry the file's `path`.
