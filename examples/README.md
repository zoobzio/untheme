# Examples

Runnable Nuxt apps, one per untheme preset. Each wires a preset's themes into
the `@untheme/nuxt` module and demos `useUntheme()` — a theme switcher, a
light/dark toggle, and a showcase built in that design system's own idiom.

| Example                                | Preset                | Showcases                                 |
| -------------------------------------- | --------------------- | ----------------------------------------- |
| [`nuxt-material-3`](./nuxt-material-3) | `@untheme/material-3` | M3 tonal roles, surface containers, FAB   |
| [`nuxt-material-2`](./nuxt-material-2) | `@untheme/material-2` | M2 elevation, app bar, contained buttons  |
| [`nuxt-carbon`](./nuxt-carbon)         | `@untheme/carbon`     | Carbon UI shell, data table, layer tokens |
| [`nuxt-radix-ui`](./nuxt-radix-ui)     | `@untheme/radix-ui`   | The 12-step accent + gray scales          |

## How it works

Each app's `nuxt.config.ts` imports complete themes from a preset and hands them
to the module:

```ts
import dracula from "@untheme/material-3/themes/dracula";
import nord from "@untheme/material-3/themes/nord";

export default defineNuxtConfig({
  modules: ["@untheme/nuxt"],
  untheme: {
    base: dracula, // boots with this theme
    themes: { dracula, nord }, // switchable catalog
  },
});
```

The module flattens the active theme into `--token` CSS variables on every
render and toggles the `dark` class on `<html>`. The `app.vue` consumes those
variables directly (`var(--primary)`, `var(--surface)`, …) and drives the
selection through the auto-imported `useUntheme()` composable, whose `apply()`
and `setMode()` persist to cookies so the choice survives SSR and reloads.

## Stub vs. full build

Each example works whether the workspace is **stubbed** (`pnpm dev` →
`unbuild --stub`) or **fully built** (`pnpm build`):

- **Presets** are imported in `nuxt.config.ts`, which Nuxt loads with jiti. They
  build one rollup entry per theme, so even a stub produces a real `.mjs` jiti
  shim that resolves through the package's `./themes/*` exports.
- **`untheme` / `@untheme/*`** are pulled into the app bundle by the runtime
  plugin, where Vite needs real ESM — a jiti stub can't be bundled for the
  browser. Each `nuxt.config.ts` therefore aliases those libs to their
  TypeScript `src`, so Vite compiles the source directly in either mode.

## Running

```sh
pnpm install
pnpm --filter @untheme/example-nuxt-material-3 dev
```

Swap the filter for `-material-2`, `-carbon`, or `-radix-ui`. For a production
build, use `build` instead of `dev`.
