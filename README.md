# untheme

A type-safe design token system for building themeable applications.

untheme separates the **token contract** (what tokens exist and how they relate) from **theme variants** (the concrete color values that fill the contract). Define a theme once, then create unlimited variants by swapping reference values.

## Packages

| Package                           | Description                                   |
| --------------------------------- | --------------------------------------------- |
| [`untheme`](./packages/core)      | Core types, theme factory, and CSS generation |
| [`@untheme/m3`](./packages/m3)    | Material Design 3 theme with full token set   |
| [`nuxt-untheme`](./packages/nuxt) | Nuxt module for runtime theming               |

## Token Architecture

untheme uses a two-tier token system:

- **Reference tokens** — Raw values with no semantic meaning (colors, sizes, shadows, etc.)
- **System tokens** — Semantic names mapped to reference tokens per color mode (light/dark)

```
reference: { "violet-40": "#3c5ba9", "violet-80": "#b3c5ff", ... }
     ↓
modes:
  light: { "primary": "violet-40", ... }
  dark:  { "primary": "violet-80", ... }
```

## Quick Start

```ts
import { defineUnthemeConfig } from "untheme";

const defineMyTheme = defineUnthemeConfig({
  label: "My Theme",
  reference: {
    "blue-light": "#93c5fd",
    "blue-dark": "#1e3a5f",
    white: "#ffffff",
    black: "#000000",
  },
  modes: {
    light: { primary: "blue-dark", surface: "white" },
    dark: { primary: "blue-light", surface: "black" },
  },
});

// Create a variant with overrides
const brand = defineMyTheme({
  label: "Brand",
  reference: { "blue-dark": "#1e40af" },
});
```

## Using Material Design 3

```ts
import { defineM3Theme } from "@untheme/m3";

const theme = defineM3Theme({ label: "My App" });
// 670 reference tokens (color, typography, shape, elevation, motion)
// 49 system tokens mapped per light/dark mode
```

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm lint --fix  # runs ESLint + Prettier
```

## License

MIT
