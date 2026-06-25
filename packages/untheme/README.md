# untheme

The umbrella package for the untheme design token system.

Re-exports the core runtime, the token-contract schema, and the structural utils, and exposes CSS generation and preset-authoring helpers through subpath entry points. Install this single package to get everything most apps need.

```sh
pnpm add untheme
```

## Entry points

| Import        | Re-exports                                                                               | Provides                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `untheme`     | [`@untheme/core`](../core), [`@untheme/schema`](../schema), [`@untheme/utils`](../utils) | `defineUntheme`, `Untheme`, `Config`, `defineSchema`, `Theme`, `Layer`, `Patch`, `Mode`, `clone`/`merge`/`extend`/`diff`, … |
| `untheme/css` | [`@untheme/css`](../css)                                                                 | `generateCSS`                                                                                                               |
| `untheme/kit` | [`@untheme/kit`](../kit)                                                                 | `defineUnthemePreset`, `Preset`                                                                                             |

## Usage

```ts
import { defineUntheme } from "untheme";
import { generateCSS } from "untheme/css";

// A Config is { mode, theme } — the caller-owned state the service operates on.
const ut = defineUntheme({ mode: "dark", theme });

const css = generateCSS(ut.tokens());
// :root { --primary: var(--violet); --violet: #b3c5ff; ... }
```

`ut.tokens()` builds the flat token map for the active mode; `generateCSS` emits a single `:root` block of custom properties, wrapping any value that points at another token key in `var()` automatically.

To boot from a ready-made preset and register switchable variants:

```ts
import { defineUntheme } from "untheme";
import preset from "@untheme/carbon";
import g10g90 from "@untheme/carbon/themes/g10-g90";

const ut = defineUntheme(preset.use("dark"), { "g10-g90": g10g90 });
ut.select("g10-g90"); // switch to a registered variant
```

## Related

- [`@untheme/carbon`](../../presets/carbon) / [`@untheme/material-2`](../../presets/material-2) / [`@untheme/material-3`](../../presets/material-3) / [`@untheme/radix-ui`](../../presets/radix-ui) — ready-made token presets.
- [`@untheme/nuxt`](../nuxt) — Nuxt module for runtime theming.
