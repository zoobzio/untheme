# @untheme/nuxt

Nuxt module for runtime theming with untheme.

Author the theme as DTCG JSON, point an `untheme.config.ts` at it, and the module builds it at build time, validates it, derives typed token unions, and wires up a runtime service, a reactive stylesheet, a static stylesheet, and cookie-backed persistence. Serving switchable themes is one server route file away.

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@untheme/nuxt"],
});
```

```ts
// untheme.config.ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({
  source: "npm:/@untheme/aurora/aurora.resolver.json",
});
```

The module gets its theme one of two ways:

- **Built here.** With no `theme` in the options, it finds `untheme.config.ts` in the project root and builds it through [`@untheme/kit`](../../packages/kit), in memory — no `untheme build` step, nothing written to disk. `config` names another file. The config file and every JSON document the build read join Nuxt's watch list, so editing either restarts dev and builds again.
- **Built elsewhere.** Pass the `theme` and `input` a kit build already generated — a theme package in a monorepo, or a published one — and the module uses them as passed:

  ```ts
  import config from "@acme/theme/config";

  export default defineNuxtConfig({
    modules: ["@untheme/nuxt"],
    untheme: { ...config },
  });
  ```

`theme` and `input` go together or not at all. `defineUnthemeConfig` from `@untheme/nuxt/config` is an identity helper that types the options.

| Option   | Default             | Description                                                                  |
| -------- | ------------------- | ---------------------------------------------------------------------------- |
| `config` | `untheme.config.ts` | The kit config to build, relative to the project root. Ignored with `theme`. |
| `theme`  | —                   | A built base theme. Pass it with `input`.                                    |
| `input`  | —                   | The built boot selection, one context per modifier. Pass it with `theme`.    |
| `css`    | `true`              | Whether `#build/untheme.css` is linked into the app's global CSS.            |

**Nuxt layers.** When more than one layer sets `untheme`, the closest layer's value is used whole — the options are never merged across layers. Nuxt's own layer merge concatenates arrays, which would corrupt the array-valued bindings in a theme (color components, shadow lists, gradient stops), so the module reads each layer's own config instead.

## What it generates

At build time the module runs `defineSchema` against the theme, which validates it and the boot selection and derives the token and modifier contract. From that it writes:

- `#build/untheme/config.mjs` — the `theme` and `input` data, with a sibling `config.d.mts` that types them against the `Contract`.
- `#build/untheme/index.mjs` — the token and modifier lists and the `isToken` / `isModifier` guards, with a sibling `index.d.mts` carrying a `Token` union of every token name, an `Overrides` type for patches to those tokens, and a `Mod` type describing each modifier's contexts.
- `#build/untheme.css` — the static cascade as plain CSS; see [Static CSS](#static-css).

The two `untheme/` modules are the ones `untheme build` writes: the module registers the output of `@untheme/kit`'s `emit` as its build templates.

It also registers the runtime plugin and the auto-imports `useUntheme()`, `useUnthemeRenderer()` and `accessUntheme()`, plus the type imports `AppUnthemeContract`, `AppUnthemeTheme`, `AppUnthemeThemeLayer`, `AppUnthemeInput`, `AppUnthemeConfig`, and `AppUntheme` — all derived from the generated contract.

It registers no server routes; see [Serving themes](#serving-themes).

## `useUntheme()`

`useUntheme()` returns the theme service — [`@untheme/core`](../../packages/core)'s `Untheme`, bound to your app's token contract. Reads and writes flow through it directly; see that package's docs for the full API (`get`, `resolve`, `set`, `swap`, `apply`, `create`, `update`, `delta`, `dirty`, `reset`, …).

```vue
<script setup>
const ut = useUntheme();
</script>

<template>
  <button @click="ut.swap('color', 'dark')">Dark mode</button>
</template>
```

`useUnthemeRenderer()` returns the [CSS renderer](../../packages/css) the plugin builds over the same service, for naming a token's custom property (`var("primary")`), reading a live value, or emitting a static set. `accessUntheme()` is the lower-level state the service is built over: the reactive `config` container held in `useState`, and the raw `input`/`key` cookie refs. Most components only need `useUntheme()`.

## Serving themes

The service holds one active theme; other themes are layers the app fetches and `apply`s. To serve them, create one catch-all server route file. Its folder is the base the catalog client points at:

```ts
// server/api/untheme/[...path].get.ts
import { createThemeHandler, listEntries } from "@untheme/nuxt/server";

export default createThemeHandler({
  list: (listing) => listEntries(entries, listing),
  get: (id) => useStorage("themes").getItem(id),
});
```

`createThemeHandler(provider)` returns one h3 event handler speaking the catalog wire protocol, so `defineClient` from `untheme/catalog` reads it unchanged:

- `GET {base}/themes?q=<JSON query>` answers a page of entries;
- `GET {base}/themes/{id}` answers one layer, or 404.

The provider is `untheme/catalog`'s `Provider`: `list` receives the query already validated and normalized, and `get` returns a layer, or `null`/`undefined` for a miss. `listEntries(entries, listing)` filters, sorts and windows entries held in memory. The handler serves layers as the provider returns them; the browser client proves each one against the app's contract when it arrives.

```ts
// in the app
import { defineClient } from "untheme/catalog";

const catalog = defineClient(useUntheme().schema, { base: "/api/untheme" });
const layer = await catalog.get("nord");
if (layer) useUntheme().apply(layer);
```

Put the file in the folder above `themes` — `server/api/untheme/[...path].get.ts`, not `server/api/untheme/themes/[...id].get.ts`, which never matches the listing request. The catch-all may carry any name, or none (`[...].get.ts`): the handler reads the base off the route the file registered.

### Aurora's themes

To serve all 31 [aurora](../../presets/aurora) themes, see the [Nuxt example](../../examples/nuxt): its `server/aurora` folder builds a handler over aurora's theme files with `createThemeHandler`, which you can copy into your app.

## CSS

The runtime plugin injects a single reactive `<style>` tag holding a `:root` block of CSS custom properties, one per active token — built with [`defineRenderer(untheme).root()`](../../packages/css) from `untheme/css`. The block re-renders whenever the selection, active theme, or an override changes.

It also mirrors each modifier's selected context onto `<html>` as a `data-<modifier>` attribute (e.g. `data-color="dark"`), so your own stylesheets can key off the selection directly:

```css
[data-color="dark"] .card {
  box-shadow: none;
}
```

## Static CSS

The module also renders the full static cascade — [`defineRenderer(...).sheet()`](../../packages/css) over the base theme — to a real file in the build directory, `#build/untheme.css`, and links it into the app's global CSS: the base bindings under `:root`, then each modifier context as a `[data-<modifier>="<context>"]` block. Written to disk, the custom properties exist as plain CSS your tooling can see: editors index the file and autocomplete `var(--surface)` in your stylesheets, and the tokens resolve before hydration, without JavaScript, and in any context that loads the stylesheet but not the app.

The whole cascade sits in an `@layer untheme` block, so the unlayered `<style>` the runtime plugin injects — which additionally carries live overrides and switched themes — wins every equal-specificity conflict, wherever the stylesheet lands in the head. Your own unlayered CSS outranks the static cascade the same way.

Set `css: false` in the module config to keep the file out of the bundle. It is still written to the build directory, so editor indexing keeps working and you can link it yourself where you want it in your own cascade:

```css
@import "#build/untheme.css";
```

The file regenerates with the rest of the build templates whenever the theme changes.

## Cookies and SSR

The selection and the active theme's id persist to two cookies, `untheme-input` and `untheme-key`, written automatically whenever `swap` or `apply` changes them. On the server, the module reads the input cookie back before rendering: a stored input is validated with `schema.check.input` and adopted if it matches the contract, and cleared otherwise. The theme cookie is written but not yet read back.

## Hooks

The service emits three Nuxt hooks:

| Hook            | Fires when                                 | Payload                |
| --------------- | ------------------------------------------ | ---------------------- |
| `untheme:ready` | The plugin finishes setting up the service | the `Untheme` service  |
| `untheme:input` | The selection changes (`swap`)             | the new `input`        |
| `untheme:theme` | The active theme changes (`apply`)         | the new resolved theme |

## Related

- [`@untheme/kit`](../../packages/kit) — builds the theme from DTCG JSON.
- [`untheme`](../../packages/untheme) — umbrella package re-exporting the core service, schema, catalog, config and CSS helpers.
- [`@untheme/core`](../../packages/core) — the runtime theme service `useUntheme()` returns.
- [`@untheme/css`](../../packages/css) — the CSS renderer the plugin uses to build the stylesheets.
