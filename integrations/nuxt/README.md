# @untheme/nuxt

The Nuxt module for untheme. The module builds a theme from DTCG JSON at build time and adds a runtime theme service, a reactive stylesheet, and cookie storage for the selection.

## Install

```sh
pnpm add @untheme/nuxt
```

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
  source: "npm:/@untheme/aurora/src/resolver.json",
});
```

The module gets the theme in one of two ways.

- **Built here.** When the options have no `theme`, the module reads `untheme.config.ts` in the project root. The module builds the config in memory with [`@untheme/kit`](../../packages/kit). The `config` option names a different file. Nuxt watches the config file and each JSON document that the build read. A change to one of these files restarts the dev server.
- **Built elsewhere.** Pass the `theme` and `input` from a kit build. The build can come from a theme package in a monorepo or from a published theme package. The module uses the values as you pass them.

  ```ts
  import config from "@acme/theme/config";

  export default defineNuxtConfig({
    modules: ["@untheme/nuxt"],
    untheme: { ...config },
  });
  ```

## Options

`defineUnthemeConfig` from `@untheme/nuxt/config` types the options. Pass `theme` and `input` together.

| Option   | Default             | Description                                                                         |
| -------- | ------------------- | ----------------------------------------------------------------------------------- |
| `config` | `untheme.config.ts` | The kit config to build, relative to the project root. Read when `theme` is absent. |
| `theme`  | none                | A built base theme. Pass it with `input`.                                           |
| `input`  | none                | The built boot selection, with one context for each modifier. Pass it with `theme`. |

When more than one Nuxt layer sets `untheme`, the module uses the value of the closest layer as a whole.

## Generated files

At build time the module validates the theme and the boot selection with `defineSchema`. The module then writes these build templates.

- `#build/untheme/config.mjs` holds the `theme` and `input` data. The file `config.d.mts` types the data with the `Contract`.
- `#build/untheme/index.mjs` holds the token list, the modifier list, and the `isToken` and `isModifier` guards. The file `index.d.mts` has the `Token` union, the `Overrides` type, and the `Mod` type. `Mod` describes the contexts of each modifier.
- `#build/untheme/manifest.mjs` holds `manifest`. Each modifier and context has an id, a name, and a description. When the module builds the config, the names and descriptions come from the documents of the theme. A theme from the `theme` and `input` options gets titled ids.
- `#build/untheme.css` holds the static cascade. The module writes the file and does not link it. See [Static CSS](#static-css).

The `untheme/` modules are the same modules that `untheme build` writes. A kit config with `layers` also writes `#build/untheme/layers.mjs` and one `#build/untheme/layers/<id>.json` for each layer.

The module also registers the runtime plugin and these auto-imports: `useUntheme()`, `useUnthemeRenderer()`, and `accessUntheme()`. It registers these type imports from the generated contract: `AppUnthemeContract`, `AppUnthemeTheme`, `AppUnthemeThemeLayer`, `AppUnthemePatch`, `AppUnthemeInput`, `AppUnthemeConfig`, and `AppUntheme`.

## `useUntheme()`

`useUntheme()` returns the theme service. This is the `Untheme` service of [`@untheme/core`](../../packages/core) for the token contract of your app. See that package for the full API: `theme`, `get`, `resolve`, `set`, `swap`, `apply`, `create`, `update`, `delta`, `dirty`, `reset`, and more.

```vue
<script setup>
const ut = useUntheme();
</script>

<template>
  <button @click="ut.swap('color', 'dark')">Dark mode</button>
</template>
```

`useUnthemeRenderer()` returns the [CSS renderer](../../packages/css) for the same service. Use it to get the custom property of a token with `var("primary")`, to read a live value, or to emit a static set.

`accessUntheme()` returns the state that the service uses. This is the reactive `config` container from `useState`, with the `patch` and the `input`, and the `input` and `key` cookie refs. Most components need only `useUntheme()`.

## Serving themes

The service has one base theme and one applied layer. The app fetches themes as layers and calls `apply` with them. To serve the layers, create a catch-all server route file. The folder of the file is the base that the catalog client uses.

```ts
// server/api/untheme/[...path].get.ts
import { createThemeHandler, listEntries } from "@untheme/nuxt/server";

export default createThemeHandler({
  list: (listing) => listEntries(entries, listing),
  get: (id) => useStorage("themes").getItem(id),
});
```

`createThemeHandler(provider)` returns an h3 event handler for the catalog wire protocol. `defineClient` from `untheme/catalog` reads this protocol.

- `GET {base}/themes?q=<JSON query>` answers a page of entries.
- `GET {base}/themes/{id}` answers one layer, or 404.

The provider is the `Provider` type of `untheme/catalog`. `list` receives the validated and normalized query. `get` returns a layer, or `null` or `undefined` when no layer matches. `listEntries(entries, listing)` filters, sorts, and cuts a window from entries in memory.

```ts
// in the app
import { defineClient } from "untheme/catalog";

const catalog = defineClient(useUntheme().schema, { base: "/api/untheme" });
const layer = await catalog.get("nord");
if (layer) useUntheme().apply(layer);
```

Put the file in the folder above `themes`, as in `server/api/untheme/[...path].get.ts`. The catch-all can have any name, or no name, as in `[...].get.ts`. The handler reads the base from the route of the file.

### Aurora themes

[Aurora](../../presets/aurora) has 31 themes. Each theme is a layer that the kit build of the package writes. `@untheme/aurora/layers` lists them with an id, a name, and a description. `@untheme/aurora/layers/<id>.json` is the layer. Serve the files from the dependency. The route below puts the layer files in the server assets of Nitro, so the output of `nuxt build` holds them.

```ts
// nuxt.config.ts
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aurora = dirname(
  fileURLToPath(import.meta.resolve("@untheme/aurora/package.json")),
);

export default defineNuxtConfig({
  modules: ["@untheme/nuxt"],
  nitro: {
    serverAssets: [{ baseName: "themes", dir: join(aurora, ".dist/layers") }],
  },
});
```

```ts
// server/api/untheme/[...].get.ts
import { createThemeHandler, listEntries } from "@untheme/nuxt/server";
import { layers } from "@untheme/aurora/layers";

const ids = new Set(layers.map((layer) => layer.id));

export default createThemeHandler({
  list: (listing) => listEntries(layers, listing),
  get: (id) =>
    ids.has(id) ? useStorage("assets:themes").getItem(`${id}.json`) : null,
});
```

The app applies a theme with the catalog client. `useUntheme().theme().id` is the id of the active theme. See the [Nuxt example](../../examples/nuxt).

## CSS

The runtime plugin injects one reactive `<style>` tag. The tag holds a `:root` block with one CSS custom property for each active token. The plugin makes the block with [`defineRenderer(untheme).root()`](../../packages/css) from `untheme/css`. The block is the result of the base theme, the patch, and the selection. The block renders again when one of them changes.

The plugin also sets the selected context of each modifier on `<html>` as a `data-<modifier>` attribute, such as `data-color="dark"`. Your stylesheets can select on the attribute.

```css
[data-color="dark"] .card {
  box-shadow: none;
}
```

## Static CSS

The module renders the static cascade to `#build/untheme.css`. The module writes the file and does not link it. The module renders the file with [`defineRenderer(...).sheet()`](../../packages/css) over the base theme. The file has the base bindings under `:root`. Each modifier context follows as a `[data-<modifier>="<context>"]` block. Editors index the file and complete `var(--surface)`.

The cascade sits in an `@layer untheme` block. If you import the file, the unlayered `<style>` tag of the runtime plugin wins over the layer. Your own unlayered CSS also wins over the layer.

```css
@import "#build/untheme.css";
```

The module writes the file again when the theme changes.

## Cookies and SSR

The module saves the selection and the id of the patch to two cookies, `untheme-input` and `untheme-key`. `swap` writes the input cookie. `apply` and `update` write the key cookie. A patch with no id clears it. On the server, the module reads the input cookie before it renders. It checks the stored input with `schema.check.input`. When the input matches the contract, the module uses it. Otherwise the module clears the cookie. The module does not restore the layer from the key cookie. The app decides when to fetch and apply a layer.

The state in `useState` holds the patch and the selection. The base theme is the build module and does not travel in the payload.

## Hooks

The service calls three Nuxt hooks.

| Hook            | Called when                                  | Payload               |
| --------------- | -------------------------------------------- | --------------------- |
| `untheme:ready` | The plugin finishes the setup of the service | the `Untheme` service |
| `untheme:input` | The selection changes with `swap`            | the new `input`       |
| `untheme:patch` | The patch changes with `apply` or `update`   | the stored patch      |

## Related

- [`@untheme/kit`](../../packages/kit) builds the theme from DTCG JSON.
- [`untheme`](../../packages/untheme) re-exports the core service, the schema, the catalog, the config, and the CSS helpers.
- [`@untheme/core`](../../packages/core) is the theme service that `useUntheme()` returns.
- [`@untheme/css`](../../packages/css) is the CSS renderer that the plugin uses.
