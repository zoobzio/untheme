# @untheme/example-nuxt

A Nuxt landing page that restyles live. It renders **Borealis**, a fictional
observability product, as a marketing page with a hero, features, pricing,
testimonials, and an FAQ.

A floating demo bar sets the nine modifier axes of [aurora](../../presets/aurora).
One of the axes is the theme, which has 31 contexts. A change restyles the page
with no reload. The page cross-fades where the browser supports view
transitions.

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

Other scripts: `build`, `preview`, `generate`, `typecheck`.

## Theme wiring

**`untheme.config.ts`** sets `source: "npm:/@untheme/aurora/src/resolver.json"`.
That is the whole config. The [`@untheme/nuxt`](../../integrations/nuxt) module
finds the file and builds it through [`@untheme/kit`](../../packages/kit). The
module boots the nine axes of aurora at their default contexts. The axes are
`theme`, `color`, `vibrancy`, `contrast`, `text`, `density`, `radius`, `depth`,
and `motion`. `nuxt.config.ts` sets no `untheme` options.

The demo bar reads `#build/untheme/manifest.mjs`. The bar shows one selector for
each modifier and one option for each context. Each option has the name and the
description from the aurora documents.

The palette is the `theme` axis. The 31 aurora themes are contexts of the built
theme, and a selection switches them like any other axis. To offer fewer
themes, list them in the config. The rest are not built.

```ts
modifiers: {
  theme: {
    contexts: ["nord", "dracula"];
  }
}
```

On every render, the module flattens the tokens of the active selection into
`--token` CSS variables on the document root. The module also sets the selection
as `data-<modifier>` attributes. The CSS in `app/assets/css` reads those
variables, so a selection change restyles the page.

## What to read first

| File                                                           | What it shows                                        |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| [`untheme.config.ts`](./untheme.config.ts)                     | The theme source: aurora's resolver document         |
| [`app/composables/demo.ts`](./app/composables/demo.ts)         | `useDemo`: the manifest and `shuffle`                |
| [`app/composables/controls.ts`](./app/composables/controls.ts) | `useControls`: two-way binding for one modifier axis |
| [`app/components/Demo.vue`](./app/components/Demo.vue)         | The demo bar that consumes both composables          |

Both composables call `useUntheme()`, the runtime service of the module.
`demo.ts` lists the axes and shuffles the selection. `controls.ts` binds one axis
to its allowed contexts.
