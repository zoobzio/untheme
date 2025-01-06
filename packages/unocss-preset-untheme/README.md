# unocss-preset-untheme

🎨 Generate custom utility types in UnoCSS w/ an Untheme tokenized design system.

[✨ &nbsp;Release Notes](/CHANGELOG.md)

## Getting started

1. Install the module

```bash
pnpm add unocss-preset-untheme untheme
```

2. Create an `untheme` design system

```ts
// ~/untheme.config.ts
import { defineUnthemeConfig } from "untheme";

export default defineUnthemeConfig({
  tokens: {
    "ui-blue": "#0096ff",
    "ui-green": "#00a36c",
    "ui-orange": "#ff5733",
  },
  themes: {
    theme1: {
      "ui-primary": "ui-blue",
      "ui-secondary": "orange",
    },
    theme2: {
      "ui-primary": "green",
      secondary: "blue",
    },
  },
  modes: {
    light: {
      "ui-active": "ui-primary",
    },
    dark: {
      "ui-active": "ui-secondary",
    },
  },
  roles: {},
});
```

3. Create an `unocss` config that implements the preset

```ts
// ~/unocss.config.ts
import { defineConfig, presetUno } from "unocss";
import { presetUntheme } from "unocss-preset-untheme";
import unthemeConfig from "~/untheme.config";

export default defineConfig({
  presets: [
    presetUno(),
    presetUntheme({
      config: unthemeConfig,
      templates: {
        colors: /ui(-(.*))/,
      },
    }),
  ],
});
```

4. Ensure `untheme` paints your variables to the DOM

```ts
import { defineUntheme } from "untheme";
import unthemeConfig from "~/untheme.config";

const untheme = defineUntheme(unthemeConfig);
untheme.paint("theme1", "dark", ["ui-active", "ui-primary", "ui-secondary"]);
```

5. Use utility class like: `bg-ui-primary text-ui-secondary hover:text-ui-active`

> `unocss-preset-untheme` relies on `presetUno` to generate utility classes.
>
> Take a look [here](https://github.com/unocss/unocss/blob/main/packages/preset-mini/src/_theme/types.ts) to see how UnoCSS does it.

## License

MIT License &copy; 2024-PRESENT [Alexander Thorwaldson](https://github.com/zoobzio)
