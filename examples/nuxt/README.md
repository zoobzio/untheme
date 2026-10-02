# @untheme/example-nuxt

The aurora showcase — a Nuxt landing page you can restyle live.

It renders **Borealis**, a fictional observability product, as a full marketing
page (hero, features, pricing, testimonials, FAQ). None of that matters; the
theming does. A floating demo bar lets you swap between 31 [aurora](../../presets/aurora)
themes and dial eight modifier axes, and the whole page re-styles instantly —
no reload, no flash, cross-fading where the browser supports view transitions.

## Running it

From the repo root:

```sh
pnpm install
pnpm --filter @untheme/example-nuxt dev
```

Then open the printed URL. The module builds the theme with `@untheme/kit` at
startup, so build the workspace first (`pnpm build` from the root). The runtime
libraries the app bundles are aliased to their TypeScript source in
`nuxt.config.ts`.

Other scripts: `build`, `preview`, `generate`, `typecheck`.

## How the theming is wired

Everything untheme-specific lives in three small files.

**`untheme.config.ts`** points at aurora's DTCG JSON with an `npm:/` reference —
`source: "npm:/@untheme/aurora/aurora.resolver.json"` — and nothing else. The
[`@untheme/nuxt`](../../integrations/nuxt) module finds it, builds it through
[`@untheme/kit`](../../packages/kit), and boots each of aurora's eight modifier
axes (`color`, `vibrancy`, `contrast`, `text`, `density`, `radius`, `depth`,
`motion`) at its default context. `nuxt.config.ts` sets no `untheme` options.

**`server/api/untheme/[...path].get.ts`** serves the catalog the switcher
chooses from — all 31 aurora themes — with `createAuroraThemeHandler()`.
The file's folder, `/api/untheme`, is the base the catalog client in
`app/composables/catalog.ts` points at.

**`server/aurora/`** defines that handler: `createThemeHandler` from
`@untheme/nuxt/server` over aurora's theme manifest, with one lazy JSON import
per theme file so the server bundle loads a theme only when it is requested.
`files.ts` is generated from aurora's theme folders — rerun
`pnpm generate:themes` after aurora's themes change.

On every render the module flattens the active selection's tokens into
`--token` CSS variables on the document root and mirrors the selection as
`data-<modifier>` attributes. The CSS in `app/assets/css` styles the page
entirely against those variables, so a selection change restyles everything.

## What to read first

| File                                                                               | What it shows                                               |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`untheme.config.ts`](./untheme.config.ts)                                         | The theme source: aurora's resolver document                |
| [`server/api/untheme/[...path].get.ts`](./server/api/untheme/%5B...path%5D.get.ts) | The theme catalog route                                     |
| [`app/composables/demo.ts`](./app/composables/demo.ts)                             | `useDemo` — theme list, active-theme binding, and `shuffle` |
| [`app/composables/controls.ts`](./app/composables/controls.ts)                     | `useControls` — two-way binding for one modifier axis       |
| [`app/components/Demo.vue`](./app/components/Demo.vue)                             | The demo bar that consumes both composables                 |

Both composables call `useUntheme()` — the runtime service the module provides —
and never touch CSS directly. `demo.ts` reads the theme catalog and drives
`apply`/`swap`; `controls.ts` binds a single axis to its allowed contexts. That
service, plus the generated variables, is the entire integration surface.
