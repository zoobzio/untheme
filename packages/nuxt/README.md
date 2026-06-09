# @untheme/nuxt

Nuxt module for runtime theming with untheme.

Pick a preset and a base theme, layer on your own role tokens, and the module handles build-time token extraction, typed token unions, a `useTheme` composable, and a plugin that injects CSS variables.

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@untheme/nuxt"],
  untheme: {
    preset: "m3", // "m2" | "m3" | "radix" | "carbon"
    theme: "dracula", // a built-in theme key from the preset
    extend: {
      // optional reference / mode overrides
      reference: { "violet-40": "#1e40af" },
      // component-level role tokens, aliased to reference or system tokens
      roles: {
        "button-bg": "primary",
        "button-text": "on-primary",
        "page-bg": "surface",
      },
    },
  },
});
```

## What it generates

At build time the module resolves the chosen `preset` + `theme`, merges `extend`, and:

- writes the resolved theme set to `public/themes/*.json` (for runtime switching),
- emits a build template (`#build/untheme.mjs`) with the active theme, options, and token lists,
- emits typed unions — `ReferenceToken`, `SystemToken`, `RoleToken` — derived from the active tokens,
- registers the runtime plugin and the `useTheme` auto-import.

## `useTheme()`

```vue
<script setup>
const { mode, theme, themes, tokens, init } = useTheme();

// sync mode + theme from cookies on hydration
await init();
</script>
```

| Property | Description                                                         |
| -------- | ------------------------------------------------------------------- |
| `mode`   | Reactive ref of the current color mode (`"light"` \| `"dark"`)      |
| `theme`  | Reactive ref of the active resolved theme                           |
| `themes` | Available theme options (`{ key, label }`)                          |
| `tokens` | Reactive flat record of all tokens resolved for the current mode    |
| `init()` | Async; syncs mode and theme from cookies, switching theme if needed |

## Plugin

The bundled plugin injects the active tokens as `:root` CSS custom properties (via `generateCSS`) and toggles the `dark` class on `<html>` to match the color mode.

## Typed config

`defineUnthemeConfig` (in the package source) is an identity helper that types the config object and infers the preset's token unions for `extend`.
