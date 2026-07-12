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

Then open the printed URL. The libraries are aliased to their TypeScript source
in `nuxt.config.ts`, so the example runs whether the workspace is stubbed
(`pnpm dev`) or fully built — no separate build step needed.

Other scripts: `build`, `preview`, `generate`, `typecheck`.

## How the theming is wired

Everything untheme-specific lives in two places.

**`untheme.config.ts`** hands the Nuxt module three things:

- `base` — the theme the app boots with (`aurora`, via `preset.define(...)`).
- `themes` — the catalog the switcher chooses from (all 31 aurora variants).
- `input` — the initial selection, one context per modifier axis (`color`,
  `vibrancy`, `contrast`, `text`, `density`, `radius`, `depth`, `motion`).

The [`@untheme/nuxt`](../../integrations/nuxt) module validates that config at
build time and, on every render, flattens the active selection's tokens into
`--token` CSS variables on the document root and mirrors the selection as
`data-<modifier>` attributes. The CSS in `app/assets/css` styles the page
entirely against those variables, so a selection change restyles everything.

## What to read first

| File                                                           | What it shows                                               |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| [`untheme.config.ts`](./untheme.config.ts)                     | The base theme, catalog, and default selection              |
| [`app/composables/demo.ts`](./app/composables/demo.ts)         | `useDemo` — theme list, active-theme binding, and `shuffle` |
| [`app/composables/controls.ts`](./app/composables/controls.ts) | `useControls` — two-way binding for one modifier axis       |
| [`app/components/Demo.vue`](./app/components/Demo.vue)         | The demo bar that consumes both composables                 |

Both composables call `useUntheme()` — the runtime service the module provides —
and never touch CSS directly. `demo.ts` reads the theme catalog and drives
`select`/`swap`; `controls.ts` binds a single axis to its allowed contexts. That
service, plus the generated variables, is the entire integration surface.
