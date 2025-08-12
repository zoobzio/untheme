# untheme

🎨 A universal tokenized theme manager to implement dynamic design systems.

[✨ &nbsp;Release Notes](/CHANGELOG.md)

## Configuration

1. Install the module

```bash
[npm|yarn|pnpm] add untheme
```

2. Create an `untheme` instance w/ your design tokens

```ts
// ~/untheme.ts
import { defineUntheme } from "untheme";

export default defineUntheme({
  tokens: {
    blue: "#0096ff",
    green: "#00a36c",
    orange: "#ff5733",
  },
  theme: {
    primary: "blue",
    secondary: "orange",
  },
  modes: {
    light: {
      active: "primary",
    },
    dark: {
      active: "secondary",
    },
  },
  roles: {
    button: "primary",
    link: "active",
  },
});
```

3. Paint a picture w/ Bob Ross, you are done!

## Features

Taking inspiration from the [Material 3 Design Tokens specification](https://m3.material.io/foundations/design-tokens/overview), `untheme` was built to provide a system to implement a tokenized design system in JS/TS applications. Using `untheme`, we can define:

- **Reference tokens** that represent static CSS values that will be applied for styling
- **System tokens** that resolve to any available reference tokens and define the theme structure
- **Mode tokens** that resolve to any available reference or system tokens and implement color modes (light, dark)
- **Role tokens** that resolve to any available reference, system, or mode tokens and are useful in components

The key feature is that themes can be changed at runtime - you define the structure once at build time, then load different theme mappings from any source (database, API, etc.) at runtime.

The configuration functions are full type-safe and any modern IDE will be able to take advantage of the extremely helpful type-hints.

### Utilities

Instatiating an `untheme` config will expose several useful utilities:

```ts
// ~/utils/example.ts
import untheme from "~/untheme";

// access a flattened untheme config using a given mode
const unthemeConfig = untheme.use("dark");

// resolve a given token/mode to it's base CSS value
const unthemePrimaryValue = untheme.resolve("primary", "light");

// dynamically change the theme at runtime
untheme.setTheme({
  primary: "green",
  secondary: "blue",
});

// get the current theme (useful for saving to database)
const currentTheme = untheme.getTheme();

// access a list of available tokens
const unthemeTokens = untheme.tokens();
```

## Integrations

`untheme` can be integrated w/ frameworks like [`nuxt`](https://nuxt.com) & [`unocss`](https://unocss.dev) to take your design system further:

| Project                                                   | Description |
| --------------------------------------------------------- | ----------- |
| [`nuxt-untheme`](https://github.com/zoobzio/nuxt-untheme) |             |
| [`unocss-preset-untheme`](https://github.com/zoobzio/)    |             |

If you have an idea for an integration, please let [me](https://github.com/zoobzio) know and I will see if I can help out!

## License

MIT License &copy; 2024-PRESENT [Alexander Thorwaldson](https://github.com/zoobzio)
