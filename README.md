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

## Overview

Taking inspiration from the [Material 3 Design Tokens specification](https://m3.material.io/foundations/design-tokens/overview), `untheme` was built to provide a tokenized design system for frontend applications. Using `untheme`, we can define:

- **Reference tokens** that represent static CSS values that can be applied as styling
- **Theme tokens** that resolve to any available reference tokens and comprise a unique theme
- **Mode tokens** that resolve to any available reference or system tokens and implement color modes (light, dark)
- **Role tokens** that resolve to any available reference, system, or mode tokens and are useful in components

Tokens can then be converted to CSS variables using [`unhead`](https://unhead.unjs.io/) by providing the currently active `theme` & `color mode`, allowing your web components to reference dynamic style tokens rather than static CSS values.

> [Read more](packages/untheme/README.md)

## Packages

> [Read more](packages/README.md)

## Development

`untheme` is a [`pnpm` workspace](https://pnpm.io/workspaces), here is how to get started:

```sh
pnpm i
pnpm prep
pnpm lint
pnpm check
pnpm test
```

Dependencies can be added to the [`catalog`](/pnpm-workspace.yaml) & are available to any workspace package!

## Contributions

Contributions are welcome!

`untheme` relies on [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to generate release notes, please feel free to open a PR following that specification and I will be happy to review!

## License

MIT License &copy; 2024-PRESENT [Alexander Thorwaldson](https://github.com/zoobzio)
