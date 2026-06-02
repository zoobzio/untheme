# nuxt-untheme

Nuxt module for runtime theming with untheme.

Provides build-time token extraction, auto-generated types, a theme composable, and a server handler for dynamic theme switching.

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-untheme"],
  untheme: {
    default: "baseline",
    themes: {
      baseline: {
        label: "Baseline",
        reference: {
          /* ... */
        },
        modes: {
          light: {
            /* ... */
          },
          dark: {
            /* ... */
          },
        },
        roles: {
          /* component-level token mappings */
        },
      },
    },
  },
});
```

## Features

### Auto-generated Types

The module extracts token keys at build time and generates typed unions:

- `ReferenceToken` — union of all reference token keys
- `SystemToken` — union of all system token keys
- `RoleToken` — union of all role token keys
- `Theme` — union of registered theme names

### `useTheme()`

Composable for managing the active theme, color mode, and available themes.

```vue
<script setup>
const { theme, mode, tokens, toggle, set, update, initialize } = useTheme();
</script>
```

| Property          | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `theme`           | Readonly ref of the active theme data                                          |
| `mode`            | Readonly ref of the current color mode                                         |
| `tokens`          | Computed flat record of all resolved tokens (reference + current mode + roles) |
| `themes`          | Array of available theme keys and labels                                       |
| `toggle()`        | Toggle between light and dark mode                                             |
| `set(key)`        | Switch to a different registered theme                                         |
| `update(partial)` | Deep-merge partial token overrides into the active theme                       |
| `initialize()`    | Sync theme state from cookies on hydration                                     |

### Server Handler

Serves theme JSON at `/api/theme/:theme` from the `.untheme` directory.

### Typed Nuxt Config

```ts
import { defineUnthemeConfig } from "nuxt-untheme/config";

export default defineUnthemeConfig({
  default: "baseline",
  themes: {
    baseline: {
      label: "Baseline",
      reference: { blue: "#3b82f6" },
      modes: {
        light: { primary: "blue" },
        dark: { primary: "blue" },
      },
      roles: { "button-bg": "primary" },
    },
  },
});
```
