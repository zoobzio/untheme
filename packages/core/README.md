# untheme

Core package for the untheme design token system.

## Exports

### `Config<Ref, Sys>`

Type-safe token configuration with two tiers:

- `reference` — Raw values keyed by `Ref` (e.g. color hex codes, sizes, shadows)
- `modes` — Light/dark mappings from `Sys` keys to `Ref` keys

```ts
import type { Config } from "untheme";

type MyConfig = Config<"blue" | "white" | "black", "primary" | "surface">;
```

### `defineUnthemeConfig(base)`

Creates a theme factory from a base config. Returns a function that accepts deep-partial overrides to produce variants.

```ts
import { defineUnthemeConfig } from "untheme";

const defineMyTheme = defineUnthemeConfig({
  label: "Base",
  reference: { blue: "#3b82f6", white: "#fff", black: "#000" },
  modes: {
    light: { primary: "blue", surface: "white" },
    dark: { primary: "blue", surface: "black" },
  },
});

const variant = defineMyTheme({
  label: "Brand",
  reference: { blue: "#1e40af" },
});
```

### `generateCSS(tokens)`

Generates a `:root` block of CSS custom properties from a flat token record. Values that reference other token keys are automatically wrapped in `var()`.

```ts
import { generateCSS } from "untheme";

const css = generateCSS({
  blue: "#3b82f6",
  primary: "blue", // → var(--blue)
});
// :root {
//   --blue: #3b82f6;
//   --primary: var(--blue);
// }
```

### `ColorMode`

Union type: `"light" | "dark"`.
