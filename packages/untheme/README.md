# untheme

🎨 A universal tokenized theme manager for dynamic & type-safe design systems.

[✨ &nbsp;Release Notes](/CHANGELOG.md)

## Getting started

1. Install the module

```bash
pnpm add untheme
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
  roles: {
    button: "primary",
    link: "active",
  },
});
```

3. Paint the desired CSS variables to the DOM for use in components

```ts
import { paint } from "~/untheme";

paint("theme1", "dark", ["button", "link"]); // paints `--button` & `--link` CSS variables
```

## Features

Taking inspiration from the [Material 3 Design Tokens specification](https://m3.material.io/foundations/design-tokens/overview), `untheme` was built to provide a tokenized design system for frontend applications. Using `untheme`, we can define:

- **Reference tokens** that represent static CSS values that can be applied as styling
- **Theme tokens** that resolve to any available reference tokens and comprise a unique theme
- **Mode tokens** that resolve to any available reference or system tokens and implement color modes (light, dark)
- **Role tokens** that resolve to any available reference, system, or mode tokens and are useful in components

Tokens can then be converted to CSS variables using [`unhead`](https://unhead.unjs.io/) by providing the currently active `theme` & `color mode`, allowing your web components to reference dynamic style tokens rather than static CSS values.

### Config

Create `untheme` design systems w/ the available configuration functions:

| Function                        | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `isUnthemeConfig(template)`     | Check if a given template is a valid `untheme` config.               |
| `defineUnthemeConfig(template)` | Validates a template & creates a type-safe config.                   |
| `defineUntheme(config)`         | Constructs an `untheme` tokenized design systen from a valid config. |

### Utils

An `untheme` design system give you access to utilities that allow you to interact w/ your token definitions & convert your tokens to CSS variables:

| Function                                | Description                                                                                                |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `untheme.use(theme, mode)`              | Pass an active `theme` & `mode` value to retrieve a flat config object w/ all your tokens.                 |
| `untheme.resolve(theme, mode, token)`   | Resolve a given `theme`, `mode`, & `token` to the root CSS value the token references.                     |
| `untheme.modes()`                       | Retrieve a list of available `mode` values.                                                                |
| `untheme.themes()`                      | Retrieve a list of available `theme` values.                                                               |
| `untheme.tokens()`                      | Retrieve a list of available `token` values.                                                               |
| `untheme.paint(theme, mode, whitelist)` | Paint your `untheme` tokens as CSS variables, optionally including a `whitelist` of token values to paint. |

> Read more:
>
> [`plugins`](/packages/untheme/src/plugins/README.md)
>
> [`kit`](/packages/untheme/src/kit/README.md)

### CSS Variables

Your `untheme` token definitions can be converted into CSS variables, which resolve as follows:

- Reference tokens have static values, so the `var(--blue)` token would always resolve to `#0096ff`.
- If the active theme was set to `theme2`, the `var(--primary)` system token would resolve to `#00a36c` and the `var(--secondary)` system token would resolve to `#0096ff`.
- If the active color mode was set to `dark` (with an active theme of `theme2`), the `var(--active)` system token would resolve to `#0096ff`.
- Role tokens can be set to any of the above token values and will resolve according to the actively set `theme` & `mode`.

## License

MIT License &copy; 2024-PRESENT [Alexander Thorwaldson](https://github.com/zoobzio)
