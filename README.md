# Untheme Monorepo

<¨ A universal tokenized theme manager to implement dynamic design systems.

## Overview

Untheme is a comprehensive theming solution inspired by the [Material 3 Design Tokens specification](https://m3.material.io/foundations/design-tokens/overview). It provides a type-safe, tokenized approach to building dynamic design systems in JavaScript/TypeScript applications.

## Packages

This monorepo contains three main packages:

### [`untheme`](./packages/untheme)
The core theming library that provides:
- **Reference tokens** - Static CSS values for styling
- **Theme tokens** - Collections of reference tokens that define unique themes  
- **Mode tokens** - Support for color modes (light/dark)
- **Role tokens** - Semantic tokens for component usage

### [`unocss-preset-untheme`](./packages/unocss-preset-untheme)
UnoCSS preset integration that enables using untheme tokens directly in your UnoCSS configuration.

### [`nuxt-untheme`](./packages/nuxt-untheme)
Nuxt module that provides seamless integration with Nuxt applications, including auto-imports and type generation.

## Quick Start

1. **Install the core package:**
```bash
npm install untheme
# or
pnpm add untheme
# or  
yarn add untheme
```

2. **Define your theme configuration:**
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

3. **Use the theme utilities:**
```ts
import untheme from "~/untheme";

// Get flattened config for a theme/mode
const config = untheme.use("theme1", "dark");

// Resolve token to CSS value
const primaryColor = untheme.resolve("primary", "theme2", "light");

// Get available themes and tokens
const themes = untheme.themes();
const tokens = untheme.tokens();
```

## Features

- = **Type-safe** - Full TypeScript support with intelligent autocompletion
- <¨ **Token-based** - Hierarchical design token system (reference ’ system ’ mode ’ role)
- < **Multi-mode** - Built-in support for light/dark modes and custom modes
- <¯ **Framework agnostic** - Works with any JavaScript framework
- =' **Extensible** - Plugin ecosystem for popular frameworks and tools

## Development

This project uses [pnpm workspaces](https://pnpm.io/workspaces) for monorepo management.

### Setup
```bash
pnpm install
```

### Build all packages
```bash
pnpm build
```

### Run tests
```bash
pnpm test
```

### Linting
```bash
pnpm lint
```

### Type checking
```bash
pnpm typecheck
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License © 2024-PRESENT [Alexander Thorwaldson](https://github.com/zoobzio)