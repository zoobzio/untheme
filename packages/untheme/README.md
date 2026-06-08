# untheme

The umbrella package for the untheme design token system.

Re-exports the core API and exposes CSS generation and preset-authoring helpers through subpath entry points. Install this single package to get everything most apps need.

```sh
pnpm add untheme
```

## Entry points

| Import           | Re-exports                          | Provides                                              |
| ---------------- | ----------------------------------- | ---------------------------------------------------- |
| `untheme`        | [`@untheme/core`](../core)          | `Theme`, `ColorMode`, `Untheme`, `defineUntheme`, …  |
| `untheme/css`    | —                                   | `generateCSS`                                         |
| `untheme/kit`    | [`@untheme/kit`](../kit)            | `defineUnthemePreset`, `Preset`, `DeepPartial`, …    |

## Usage

```ts
import { defineUntheme } from "untheme";
import { generateCSS } from "untheme/css";

const ut = defineUntheme(theme, "dark");
const css = generateCSS(ut.tokens);
// :root { --primary: var(--violet); --violet: #b3c5ff; ... }
```

`generateCSS` emits a single `:root` block of custom properties; values that point at another token key are wrapped in `var()` automatically.

## Related

- [`@untheme/material-2`](../preset/material-2) / [`@untheme/material-3`](../preset/material-3) — ready-made token presets.
- [`@untheme/nuxt`](../nuxt) — Nuxt module for runtime theming.
