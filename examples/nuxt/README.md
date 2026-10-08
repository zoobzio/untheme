# @untheme/example-nuxt

A Nuxt landing page that restyles live. It renders **Borealis**, a fictional
observability product, as a marketing page with a hero, features, pricing,
testimonials, and an FAQ.

A floating demo bar sets the eight modifier axes of [aurora](../../presets/aurora)
and picks one of its 31 themes. A change restyles the page with no reload. The
page cross-fades where the browser supports view transitions.

## Run

From the repo root:

```sh
pnpm install
pnpm build
pnpm --filter @untheme/example-nuxt dev
```

Open the printed URL. The module builds the theme with `@untheme/kit` at
startup, so build the workspace first. `nuxt.config.ts` aliases the runtime
libraries that the app bundles to their TypeScript source.

Other scripts: `build`, `preview`, `generate`, `typecheck`, `test`.

## Theme wiring

**`untheme.config.ts`** sets `source: "npm:/@untheme/aurora/src/resolver.json"`.
That is the whole config. The [`@untheme/nuxt`](../../integrations/nuxt) module
finds the file and builds it through [`@untheme/kit`](../../packages/kit). The
module boots the eight axes of aurora at their default contexts. The axes are
`color`, `vibrancy`, `contrast`, `text`, `density`, `radius`, `depth`, and
`motion`. `nuxt.config.ts` sets no `untheme` options.

The demo bar reads `#build/untheme/manifest.mjs`. The bar shows one selector for
each modifier and one option for each context. Each option has the name and the
description from the aurora documents.

The palette is not an axis. Each aurora theme is a layer. The build of aurora
writes one file for each theme, and `@untheme/aurora/layers` lists them. The
app serves the files with the catalog wire protocol:

- `nuxt.config.ts` puts the `layers/` directory of the aurora build into the
  server assets of Nitro, so the output of `nuxt build` holds the files.
- [`server/api/untheme/[...].get.ts`](./server/api/untheme/%5B...%5D.get.ts)
  answers `GET /api/untheme/themes` with the entries of the manifest and
  `GET /api/untheme/themes/{id}` with one layer file.
- `useThemes` makes a catalog client over `/api/untheme`. The theme picker
  lists the entries. A pick fetches the layer and calls `apply`. The state of
  the app holds the layer. The base theme stays in the build module.

On every render, the module flattens the tokens of the active selection into
`--token` CSS variables on the document root. The block is the base theme with
the applied layer and the selection. The module also sets the selection as
`data-<modifier>` attributes. The CSS in `app/assets/css` reads
those variables, so a change restyles the page.

## What to read first

| File                                                                       | What it shows                                        |
| -------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`untheme.config.ts`](./untheme.config.ts)                                 | The theme source: aurora's resolver document         |
| [`app/composables/demo.ts`](./app/composables/demo.ts)                     | `useDemo`: the manifest and `shuffle`                |
| [`app/composables/controls.ts`](./app/composables/controls.ts)             | `useControls`: two-way binding for one modifier axis |
| [`app/composables/themes.ts`](./app/composables/themes.ts)                 | `useThemes`: the catalog client and `apply`          |
| [`app/components/Demo.vue`](./app/components/Demo.vue)                     | The demo bar that consumes the composables           |
| [`server/api/untheme/[...].get.ts`](./server/api/untheme/%5B...%5D.get.ts) | The theme catalog over the layers of aurora          |

The composables call `useUntheme()`, the runtime service of the module.
`demo.ts` lists the axes and shuffles the selection. `controls.ts` binds one axis
to its allowed contexts. `themes.ts` lists the themes and applies one.

## Test

```sh
pnpm --filter @untheme/example-nuxt test
```

[`test/nuxt/composables.test.ts`](./test/nuxt/composables.test.ts) runs the
composables in vitest. The tests use no Nuxt environment and no build of aurora.
A mock theme from [`@untheme/testing`](../../packages/testing) stands in for the
build. The theme is in [`test/nuxt/fixtures.ts`](./test/nuxt/fixtures.ts). It
has two axes over a few tokens. `mockModules` supplies the
`#build/untheme/manifest.mjs` module that the demo imports. A stub of
`useUntheme` returns a service over the theme and a reactive container.
[`test/nuxt/layers.ts`](./test/nuxt/layers.ts) holds three layers. The vitest
config aliases `@untheme/aurora/layers` to it, and a mock of `untheme/catalog`
serves the same layers.

The tests check five things:

- The contexts that an axis offers.
- The two-way binding of an axis.
- The prose of the manifest.
- The theme picker: the entries, a pick that applies a layer, and a miss.
- `shuffle` picks a selection that the contract accepts.
