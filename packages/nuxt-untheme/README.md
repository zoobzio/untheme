# nuxt-untheme

🎨 Build dynamic & type-safe design systems with Nuxt & Untheme.

[✨ &nbsp;Release Notes](/CHANGELOG.md)

## Getting started

1. Install the module

```bash
pnpm add nuxt-untheme untheme
```

2. Create a config

```ts
// ~/untheme.config.ts
import { defineUnthemeNuxtConfig } from "nuxt-untheme/config";

export default defineUnthemeNuxtConfig(
  {
    tokens: {
      blue: "#0096ff",
      green: "#00a36c",
      orange: "#ff5733",
    },
    themes: {
      theme1: {
        primary: "blue",
        secondary: "orange",
      },
      theme2: {
        primary: "green",
        secondary: "blue",
      },
    },
    modes: {
      light: {
        active: "primary",
      },
      dark: {
        active: "secondary",
      },
    },
    roles: {},
  },
  {
    theme: "theme1",
    mode: "dark",
    whitelist: ["active", "primary", "secondary"],
  },
);
```

3. Activate the module

```ts
// ~/nuxt.config.ts
import untheme from "./untheme.config";

export default defineNuxtConfig({
  modules: ["nuxt-untheme"],
  untheme,
});
```

## Features

The `nuxt-untheme` module installs [`untheme`](https://github.com/zoobzio/untheme) and implements your token configuration as a reactive design system that:

- Provides configurable themes & color modes
- Publishes tokens as CSS variables
- Exposes utility functions/types to extend the design system

> [Read more](/packages/untheme/README.md)

Your tokens will be converted into global CSS variables which can be referenced in your components, changing the `theme` or `color mode` will automatically update the CSS variable values allowing seamless dynamic styling.

### Utils

#### `untheme` aliases

Several `untheme` utilities have been made available w/ aliases:

| Function                                        | Description                                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `resolveUnthemeToken(theme, mode, token)`       | Resolve a given `theme`, `mode`, & `token` to the root CSS value the token references.                     |
| `useUnthemeModes()`                             | Retrieve a list of available `mode` values.                                                                |
| `useUnthemeThemes()`                            | Retrieve a list of available `theme` values.                                                               |
| `useUnthemeTokens()`                            | Retrieve a list of available `token` values.                                                               |
| `paintUnthemeVariables(theme, mode, whitelist)` | Paint your `untheme` tokens as CSS variables, optionally including a `whitelist` of token values to paint. |

#### `untheme` state

`nuxt-untheme` maintains some state variables across pages/components:

| Function                | Description                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `useUnthemeTheme()`     | Access the current `theme` state.                                                                                       |
| `useUnthemeMode()`      | Access the current `color mode` state.                                                                                  |
| `useUnthemeWhitelist()` | Access the current `whitelist` state which holds the list of tokens that should be resolvable as CSS variables.         |
| `useUntheme()`          | Access all `untheme` state objects, compute the active token value, & resolve tokens using the active `theme` & `mode`. |

## License

MIT License &copy; 2024-PRESENT [Alexander Thorwaldson](https://github.com/zoobzio)
