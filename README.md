# untheme

A type-safe design token system for building themeable applications.

untheme separates the **token contract** (what tokens exist and how they relate) from **theme variants** (the concrete values that fill the contract). Define a contract once, then create unlimited variants by swapping reference values.

## Packages

| Package                                              | Description                                          |
| ---------------------------------------------------- | --------------------------------------------------- |
| [`untheme`](./packages/untheme)                      | Umbrella package — core API, CSS gen, kit subpaths  |
| [`@untheme/core`](./packages/core)                   | Token contract types and the runtime instance       |
| [`@untheme/kit`](./packages/kit)                     | Toolkit for authoring reusable presets              |
| [`@untheme/material-2`](./packages/preset/material-2) | Material Design 2 token preset + themes             |
| [`@untheme/material-3`](./packages/preset/material-3) | Material Design 3 token preset + themes             |
| [`@untheme/nuxt`](./packages/nuxt)                   | Nuxt module for runtime theming                     |

## Token Architecture

untheme uses a three-tier token system:

- **Reference tokens** — raw values with no semantic meaning (colors, sizes, shadows).
- **System tokens** — semantic names mapped to reference tokens per color mode (light/dark).
- **Role tokens** — component-level aliases pointing at a reference or system token.

```
reference: { "violet-40": "#3c5ba9", "violet-80": "#b3c5ff", ... }
     ↓
modes:
  light: { primary: "violet-40", ... }
  dark:  { primary: "violet-80", ... }
     ↓
roles: { "button-bg": "primary", ... }
```

## Quick Start

Use a preset and the runtime instance directly:

```ts
import { defineUntheme } from "untheme";
import { generateCSS } from "untheme/css";
import { defineM3Theme } from "@untheme/material-3";

const theme = defineM3Theme({ key: "app", label: "My App" });

const ut = defineUntheme({ ...theme, roles: {} }, "dark");
const css = generateCSS(ut.tokens);
```

Or author your own preset with the kit:

```ts
import { defineUnthemePreset } from "untheme/kit";

const defineMyPreset = defineUnthemePreset({
  preset: "my",
  key: "my",
  label: "My Preset",
  reference: { blue: "#3b82f6", white: "#fff", black: "#000" },
  modes: {
    light: { primary: "blue", surface: "white" },
    dark: { primary: "blue", surface: "black" },
  },
});

const brand = defineMyPreset({
  key: "brand",
  label: "Brand",
  reference: { blue: "#1e40af" },
});
```

For Nuxt apps, see [`@untheme/nuxt`](./packages/nuxt).

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## License

MIT
