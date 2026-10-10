# @untheme/example-nuxt

A Nuxt landing page that restyles live. It renders **Borealis**, a fictional
observability product, as a marketing page with a hero, features, pricing,
testimonials, and an FAQ.

A floating demo bar sets the eight modifier axes of the theme and picks the
palette: mantis, the base of the [theme example](../theme), or one of the 31
themes of [aurora](../../presets/aurora) that it carries as layers. A change
restyles the page with no reload. The page cross-fades where the browser
supports view transitions.

## Run

From the repo root:

```sh
pnpm install
pnpm build
pnpm --filter @untheme/example-nuxt dev
```

Open the printed URL. The module takes the build of the theme example from
the installed package, so build the workspace first. `nuxt.config.ts` aliases the runtime
libraries that the app bundles to their TypeScript source.

Other scripts: `build`, `preview`, `generate`, `typecheck`, `test`.

## Theme wiring

**`nuxt.config.ts`** sets `untheme: { preset: "@untheme/example-theme" }`.
That is the whole wiring. The [`@untheme/nuxt`](../../integrations/nuxt)
module takes the build of the theme example from the installed package: the
base theme, the boot selection, the manifest, and the layers. The base is
mantis, a palette over aurora. The layers are mantis itself and the
thirty-one themes of aurora. The module boots the eight axes of aurora at
their default contexts. The axes are `color`, `vibrancy`,
`contrast`, `text`, `density`, `radius`, `depth`, and `motion`. The app has no
`untheme.config.ts` and no server route of its own.

The demo bar reads `#build/untheme/manifest.mjs`. The bar shows one selector for
each modifier and one option for each context. Each option has the name and the
description from the aurora documents.

The palette is not an axis. The base and each aurora theme are layers.
`#build/untheme/layers.mjs` lists them and imports one by id.

- The theme picker lists `layers` of `useUntheme()`. A pick calls `select`,
  which loads the layer and applies it. The key cookie restores it on the next
  request. The base theme stays in the build module.

On every render, the module flattens the tokens of the active selection into
`--token` CSS variables on the document root. The block is the base theme with
the applied layer and the selection. The module also sets the selection as
`data-<modifier>` attributes. The CSS in `app/assets/css` reads
those variables, so a change restyles the page.

## What to read first

| File                                                           | What it shows                                        |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| [`nuxt.config.ts`](./nuxt.config.ts)                           | The preset: the theme example, served by the module  |
| [`app/composables/demo.ts`](./app/composables/demo.ts)         | `useDemo`: the manifest and `shuffle`                |
| [`app/composables/controls.ts`](./app/composables/controls.ts) | `useControls`: two-way binding for one modifier axis |
| [`app/components/Demo.vue`](./app/components/Demo.vue)         | The demo bar that consumes the composables           |

The composables call `useUntheme()`, the runtime service of the module.
`demo.ts` lists the axes and shuffles the selection and the theme. `controls.ts` binds one axis
to its allowed contexts. `themes.ts` lists the themes and applies one.

## Test

```sh
pnpm --filter @untheme/example-nuxt test
```

[`test/nuxt/composables.test.ts`](./test/nuxt/composables.test.ts) runs the
composables in vitest. The tests use no Nuxt environment and no build of the preset.
A mock theme from [`@untheme/testing`](../../packages/testing) stands in for the
build. The theme is in [`test/nuxt/fixtures.ts`](./test/nuxt/fixtures.ts). It
has two axes over a few tokens. `mockModules` supplies the
`#build/untheme/manifest.mjs` module that the demo imports. A stub of
`useUntheme` returns a service over the theme and a reactive container.

The tests check four things:

- The contexts that an axis offers.
- The two-way binding of an axis.
- The prose of the manifest.
- `shuffle` picks a selection that the contract accepts, and a theme.
