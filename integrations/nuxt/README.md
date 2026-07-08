# @untheme/nuxt

Nuxt module for runtime theming with untheme.

Give the module a base theme and a catalog of switchable variants, and it validates them at build time, derives typed token unions, and wires up a runtime service, a reactive stylesheet, and cookie-backed persistence — no other setup required.

## Setup

```ts
// nuxt.config.ts
import { defineUnthemeConfig } from "@untheme/nuxt/config";

export default defineNuxtConfig({
  modules: ["@untheme/nuxt"],
  untheme: defineUnthemeConfig({
    base: {
      id: "alpha",
      name: "Alpha",
      tokens: {
        white: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [1, 1, 1], hex: "#ffffff" },
        },
        black: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [0, 0, 0], hex: "#000000" },
        },
        surface: { $type: "color", $value: "{white}" },
        "on-surface": { $type: "color", $value: "{black}" },
      },
      modifiers: {
        color: {
          light: {},
          dark: { surface: "{black}", "on-surface": "{white}" },
        },
      },
      order: ["color"],
    },
    themes: {
      bravo: {
        id: "bravo",
        name: "Bravo",
        tokens: {
          white: {
            colorSpace: "srgb",
            components: [0.98, 0.98, 0.98],
            hex: "#fafafa",
          },
        },
      },
    },
    input: { color: "light" },
  }),
});
```

`base` is a complete theme — every token carries a `$type` and `$value`, and each modifier (here, `color`) declares the contexts that override those tokens for that axis. `themes` is a catalog of layers keyed by name: each layer states only what diverges from `base`, so `bravo` above only rebinds `white`. `input` is the selection to boot with, one context per modifier. `defineUnthemeConfig` is an identity helper — it does nothing at runtime, but types the config and infers the token and modifier unions from `base`.

## What it generates

At build time the module runs `defineSchema` against `base`, which validates the theme and derives its token and modifier contract. From that it writes:

- `#build/untheme.mjs` — the `theme`, `themes`, and `input` data, plus a sibling `untheme.d.mts` that types them against the derived contract instead of the loose types TypeScript would otherwise infer from a `.mjs` file.
- `#build/types/untheme.d.ts` — a `Token` union of every token name in `base`, an `Overrides` type for patches to those tokens, and a `Mod` type describing each modifier's contexts.

It also registers the runtime plugin and two auto-imports: `useUntheme()` and `accessUntheme()`, plus the type imports `AppContract`, `AppTheme`, `AppThemeLayer`, `AppThemes`, `AppInput`, `AppConfig`, and `AppUntheme` — all derived from the generated contract.

## `useUntheme()`

`useUntheme()` returns the theme service — [`@untheme/core`](../../packages/core)'s `Untheme`, bound to your app's token contract. Reads and writes flow through it directly; see that package's docs for the full API (`get`, `resolve`, `set`, `swap`, `apply`, `select`, `create`, `update`, `delta`, `dirty`, `reset`, …).

```vue
<script setup>
const ut = useUntheme();
</script>

<template>
  <button @click="ut.swap('color', 'dark')">Dark mode</button>
  <button @click="ut.select('bravo')">Switch to Bravo</button>
</template>
```

`accessUntheme()` is the lower-level state the service is built over: the reactive `config` and `themes` containers held in `useState`, and the raw `input`/`key` cookie refs. Most components only need `useUntheme()`.

## CSS

The runtime plugin injects a single reactive `<style>` tag holding a `:root` block of CSS custom properties, one per active token — built with [`defineRenderer(untheme).root()`](../../packages/css) from `untheme/css`. The block re-renders whenever the selection, active theme, or an override changes.

It also mirrors each modifier's selected context onto `<html>` as a `data-<modifier>` attribute (e.g. `data-color="dark"`), so your own stylesheets can key off the selection directly:

```css
[data-color="dark"] .card {
  box-shadow: none;
}
```

## Cookies and SSR

The selection and the active theme's key persist to two cookies, `untheme-input` and `untheme-key`, written automatically whenever `swap`, `apply`, or `select` changes them. On the server, the module reads these cookies back before rendering: a stored input is validated with `schema.check.input` and adopted if it matches the contract, and a stored theme key is looked up in the catalog and validated with `schema.check.layer` before being applied. A cookie that fails validation — for example, after a theme is removed from the catalog — is cleared instead of applied.

## Hooks

The service emits three Nuxt hooks:

| Hook            | Fires when                                  | Payload                |
| --------------- | ------------------------------------------- | ---------------------- |
| `untheme:ready` | The plugin finishes setting up the service  | the `Untheme` service  |
| `untheme:input` | The selection changes (`swap`)              | the new `input`        |
| `untheme:theme` | The active theme changes (`apply`/`select`) | the new resolved theme |

## Related

- [`untheme`](../../packages/untheme) — umbrella package re-exporting the core service, schema, and CSS/kit helpers.
- [`@untheme/core`](../../packages/core) — the runtime theme service `useUntheme()` returns.
- [`@untheme/css`](../../packages/css) — the CSS renderer the plugin uses to build the stylesheet.
