# nuxt-untheme

🔮 Build your own tokenized design system w/ dynamic CSS vars in Nuxt using Untheme.

[✨ &nbsp;Release Notes](/CHANGELOG.md)

## Configuration

1. Install the module

```bash
pnpm add nuxt-untheme untheme
```

2. Create a config

```ts
// ~/untheme.config.ts
import { defineUnthemeConfig } from "untheme";

export default defineUnthemeConfig({
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
});
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

4. Look to the future, your tokens are done!

## Features

The `nuxt-untheme` module installs [`untheme`](https://github.com/zoobzio/untheme) and implements your token configuration as a reactive design system that:

- Provides configurable themes & color modes
- Publishes tokens as CSS variables
- Exposes utility functions/types to extend the design system

### Untheme

For more information about `untheme` and tokenized design systems, check out the [`untheme` documentation](https://github.com/zoobzio/untheme).

For more information about design systems in general, check out the [Material 3](https://m3.material.io/foundations/design-tokens/overview) documentation that inspired the `untheme` project.

### CSS Variables

The token configuration is passed to a Nuxt plugin that uses [`unhead`](https://unhead.unjs.io/) to declare CSS variables that mirror the token configuration. If using the configuration from above, you would also have access to two themes (`theme1` & `theme2`) and two colors modes (`light` & `dark`).

Reference tokens have static values, so the `var(--blue)` token would always resolve to `#0096ff`.

If the active theme was set to `theme2`, the `var(--primary)` system token would resolve to `#00a36c` and the `var(--secondary)` system token would resolve to `#0096ff`.

If the active color mode was set to `dark` (with an active theme of `theme2`), the `var(--active)` system token would resolve to `#0096ff`.

Role tokens can be set to any of the above token values and will resolve according to the actively set `theme` & `mode`.

### Utilities

| Function           | Description                                                                             |
| ------------------ | --------------------------------------------------------------------------------------- |
| `useThemes()`      | Retrieve a literally-typed list of the available `theme` keys.                          |
| `useTheme()`       | Access the reactive state of the currently active `theme`.                              |
| `useMode()`        | Access the reactive state of the currently active `mode`.                               |
| `useUntheme()`     | Access the currently active `untheme` service w/ `mode`, `theme`, & `tokens` properties |
| `useUnthemeRoot()` | Build a reactive CSS declaration string to manage CSS variable values                   |

## License

MIT License &copy; 2024-PRESENT [Alexander Thorwaldson](https://github.com/zoobzio)
