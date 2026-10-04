# @untheme/kit

The generator. One authored `untheme.config.ts` points at DTCG JSON — a
resolver document and the token files it references — and becomes modules the
runtime service consumes:

- **Keys:** the `Token` union, the modifier and context types, the token and
  modifier lists, and `isToken` / `isModifier` guards.
- **Contract:** the base theme and the boot selection, ready for
  `makeUntheme`.
- **Manifest:** every modifier and context with a name and a description,
  for the interface that lets someone choose.

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
  source: "npm:/@untheme/aurora/src/resolver.json",

  // Optional. They replace the identity from the resolver document.
  id: "app",
  name: "App",

  // Optional. What to take of the document's modifiers — see Modifiers.
  modifiers: {
    theme: { contexts: ["nord", "dracula"] },
    depth: false,
  },

  // Optional. Output directory, relative to the project root. The default.
  outDir: "untheme",
});
```

- **Identity.** The resolver document's `name` is the default name, and its
  slug is the default id. A plain token document (no resolver) has no name, so
  there `name` is required.
- **Boot selection.** Each modifier boots at the `default` context the
  resolver document declares, unless `modifiers` names another. Every
  modifier needs one.
- **Themes.** A palette is a modifier like any other — aurora's `theme` — so
  the alternatives are contexts of the one base theme the kit builds.

The config is checked before any document is read, and every problem is
reported together:

```
@untheme/kit: the config is invalid —
  source must be a path, a URL, or an npm:/ reference
  outDir "../out" must be a subdirectory of the project root
```

## Modifiers

`modifiers` changes what the build takes of the resolver document's
modifiers, by name. A modifier the config does not name is built as the
document declares it.

```ts
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
  modifiers: {
    theme: {
      add: { brand: "./tokens/brand.json" },
      contexts: ["brand", "nord", "dracula"],
      default: "brand",
    },
    motion: { contexts: ["default", "reduced"] },
    depth: false,
  },
});
```

- **`contexts`** keeps only the listed contexts, in the listed order. A
  context left out is not built — it is in neither the theme nor the types —
  and its files are never read. Without it, every declared context is kept,
  then the added ones.
- **`default`** names the context the modifier boots at. Its tokens become
  the base, and every other kept context is a set of overrides against it.
  Without it, the document's default boots when it is kept, else the first
  kept context.
- **`add`** gives the modifier contexts of your own, by name: each a token
  file, or a list of them with later files winning — a path, a URL, or an
  `npm:/` reference, like `source`. An added context follows the same rule
  as a declared one: it may only rebind tokens the base defines.
- **`false`** turns the modifier off. Its default context stays in the base;
  the modifier is in neither the theme's order, its types, nor the boot
  selection.

The config is applied to the resolver document before it is parsed, so the
build — and its proof — sees a document that declares exactly what was kept.
A modifier or a context the document does not declare, a context added under
a name already taken, and a default that is not kept fail the build as config
errors, all reported together:

```
@untheme/kit: the config is invalid —
  modifiers.theme.contexts: "nrod" is not a context of "theme" (abyss, aurora, …)
  modifiers.shadow: the source declares no modifier "shadow" (theme, color, …)
```

`modifiers` narrows, extends and turns off axes; it does not add tokens. For
those, write a resolver of your own — see Composition.

## Sources

A `source` — and every `$ref` inside the documents — is one of:

- **A path**, resolved against the project root (`./tokens/app.resolver.json`).
- **A URL** (`https://tokens.example.com/app.resolver.json`). Remote documents
  are fetched without credentials; pass a `req` loader to authenticate.
- **An `npm:/` reference** into an installed package:
  `npm:/@untheme/aurora/src/resolver.json`. It resolves with Node package
  resolution from the project root, so the package must export the file. The
  slash after the colon is required: it makes relative `$ref`s inside the
  package resolve (`./tokens/space.json` →
  `npm:/@untheme/aurora/src/tokens/space.json`).

## Composition

Adding tokens is the DTCG resolver format itself; the kit adds no API for it.
To extend a theme, write a resolver of your own that lists its files as sets —
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
[aurora](../../presets/aurora) with all thirty-one themes, proof included,
takes about three seconds; narrowed to a few themes, under one.

The proof resolves every token with Terrazzo and with untheme and compares
them, at every selection Terrazzo can enumerate. Above Terrazzo's permutation
limit (1,000; aurora has 90,396) it proves the defaults and each
single-context change instead.

The output directory is never cleared, so it can sit beside authored source.
Each build records the files it wrote in `.untheme.json` there; the next build
overwrites its own files and removes only the ones that record lists and it
no longer produces. A file the kit did not write is never touched.

In an app, import the modules by relative path (`./untheme/config.mjs`) and run
`untheme build` before typechecking and before the app starts.

## What it emits

| File            | Contents                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `index.mjs`     | `type Token`, `type Modifier`, `type Mod`, `type Context`, `tokens`, `modifiers`, `isToken`, `isModifier` |
| `config.mjs`    | `theme`, `input`, and `{ theme, input }` as the default — what `useUnthemeConfig` takes                   |
| `manifest.mjs`  | `manifest` — each modifier and its contexts with an id, a name and a description — see Manifest           |
| `.untheme.json` | the record of written files                                                                               |

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

## Manifest

`manifest.mjs` is what a settings panel lists: one entry per modifier, in the
theme's order, each with an entry per context the build kept.

```ts
import { manifest } from "./untheme/manifest.mjs";

// [
//   {
//     id: "theme",
//     name: "Theme",
//     description: "The palette: each context is one theme's eight tonal ramps.",
//     contexts: [
//       { id: "nord", name: "Nord", description: "Arctic blues on polar grays, from Nord" },
//       { id: "night_owl", name: "Night Owl", description: "…" },
//     ],
//   },
//   …
// ]

for (const modifier of manifest) {
  // <select> named modifier.name, one <option> per modifier.contexts,
  // untheme.swap(modifier.id, context.id) on change
}
```

The names and descriptions travel with the documents:

- **A modifier's description** is its `description` in the resolver document.
- **A context's description** is the `$description` at the root of the token
  file it applies — the last file that has one, when it applies several.
- **A name** is `name` under the `io.zoobz.untheme` key of `$extensions`, on the
  modifier or at the root of the context's file:
  `"$extensions": { "io.zoobz.untheme": { "name": "Night Owl" } }`. Without one, the
  name is the id, titled: `night_owl` is `Night Owl`.

`description` is left off an entry that has none. The manifest follows the
config: a context left out is not listed, an added one is described by its own
file, and a modifier turned off is gone. `manifest.d.mts` types each entry's
`id` against the `Modifier` and `Context` unions.

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
`{ theme, input, manifest, outDir, documents }`, where `documents` lists every local file
the build read — for a consumer that wants them in memory rather than as files.
`emit({ theme, input, manifest })` turns a built theme and selection into the
same modules, for a consumer that registers them itself — the Nuxt module
does; without a `manifest` it emits one from the theme alone, every name a
titled id. `describe(theme)` returns that manifest.

`cwd` is the project root that paths and `npm:/` references resolve from. `req`
loads every `file:` and remote document (`npm:` references always resolve from
the project's packages), so authenticated sources work.

A config that breaks the kit's rules throws `InvalidConfigError`, carrying
every problem as `issues` — before any document is read, except for what
`modifiers` says about the source, which is checked once the resolver
document is. `build()` throws
`MissingConfigError` when there is no config file and `MalformedConfigError`
when the file does not default-export a config; both carry the file's `path`.
