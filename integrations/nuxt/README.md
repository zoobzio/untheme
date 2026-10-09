# @untheme/nuxt

The Nuxt module for untheme. The module builds a theme from DTCG JSON at build time and adds a base stylesheet, a runtime theme service, a reactive style tag for the applied layer, and cookie storage for the selection and the layer.

## Install

```sh
pnpm add @untheme/nuxt
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@untheme/nuxt"],
  untheme: { preset: "@untheme/aurora" },
});
```

The module gets the theme in one of three ways.

- **A preset.** Name a package that exports a kit build with `preset`. The module takes the base theme, the boot selection, the manifest, and the layers from the package, and serves the layers as a theme catalog. [Aurora](../../presets/aurora) is a preset. So is any package whose `untheme build` output it exports: `./config`, `./manifest`, `./layers`, and `./layers/<id>.json`. The module resolves the package from the project root, so it is a dependency of the app.
- **Built here.** When the options have no `theme` and no `preset`, the module reads `untheme.config.ts` in the project root. The module builds the config in memory with [`@untheme/kit`](../../packages/kit). The `config` option names a different file. Nuxt watches the config file and each JSON document that the build read. A change to one of these files restarts the dev server. The layers of the config are served the same way as the layers of a preset.

  ```ts
  // untheme.config.ts
  import { defineConfig } from "@untheme/kit";

  export default defineConfig({
    source: "./app.resolver.json",
    layers: "npm:/@untheme/aurora/src/themes",
  });
  ```

- **Built elsewhere.** Pass the `theme` and `input` from a kit build. The module uses the values as you pass them, and serves no layers.

  ```ts
  import config from "@acme/theme/config";

  export default defineNuxtConfig({
    modules: ["@untheme/nuxt"],
    untheme: { ...config },
  });
  ```

## Options

`defineUnthemeConfig` from `@untheme/nuxt/config` types the options. Pass `theme` and `input` together.

| Option   | Default             | Description                                                                                       |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `preset` | none                | A package that exports a kit build, such as `@untheme/aurora`. Read when `theme` is absent.       |
| `config` | `untheme.config.ts` | The kit config to build, relative to the project root. Read when `theme` and `preset` are absent. |
| `theme`  | none                | A built base theme. Pass it with `input`.                                                         |
| `input`  | none                | The built boot selection, with one context for each modifier. Pass it with `theme`.               |

When more than one Nuxt layer sets `untheme`, the module uses the value of the closest layer as a whole.

## Generated files

At build time the module validates the theme and the boot selection with `defineSchema`. The module then writes these build templates.

- `#build/untheme/config.mjs` holds the `theme` and `input` data. The file `config.d.mts` types the data with the `Contract`.
- `#build/untheme/index.mjs` holds the token list, the modifier list, and the `isToken` and `isModifier` guards. The file `index.d.mts` has the `Token` union, the `Overrides` type, and the `Mod` type. `Mod` describes the contexts of each modifier.
- `#build/untheme/manifest.mjs` holds `manifest`. Each modifier and context has an id, a name, and a description. When the module builds the config, the names and descriptions come from the documents of the theme. A theme from the `theme` and `input` options gets titled ids.
- `#build/untheme.css` holds the base cascade. The module links it into the CSS of the app. See [CSS](#css).

- `#build/untheme/layers.mjs` holds `layers`, the id, name, and description of each layer of the build, and `load`, one lazy import for each layer by id. The file `layers.d.mts` has the `LayerId` union. For a preset the list and the layers are the package's own, re-exported. For a kit config the module writes the list and `#build/untheme/layers/<id>.json`. The list and the map are empty when the build has no layers.

The `untheme/` modules are the same modules that `untheme build` writes.

The module also registers the runtime plugin and these auto-imports: `useUntheme()`, `useUnthemeRenderer()`, `useUnthemeCatalog()`, and `accessUntheme()`. It registers these type imports from the generated contract: `AppUnthemeContract`, `AppUnthemeTheme`, `AppUnthemeThemeLayer`, `AppUnthemePatch`, `AppUnthemeInput`, `AppUnthemeConfig`, and `AppUntheme`.

## `useUntheme()`

`useUntheme()` returns the theme service. This is the `Untheme` service of [`@untheme/core`](../../packages/core) for the token contract of your app, with the layers of the build. See that package for the full API: `theme`, `get`, `resolve`, `set`, `swap`, `apply`, `create`, `update`, `delta`, `dirty`, `reset`, and more.

```vue
<script setup>
const ut = useUntheme();
</script>

<template>
  <button @click="ut.swap('color', 'dark')">Dark mode</button>
  <select @change="ut.select($event.target.value)">
    <option v-for="layer in ut.layers" :key="layer.id" :value="layer.id">
      {{ layer.name }}
    </option>
  </select>
</template>
```

`layers` lists the layers of the build: an id, a name, and a description each. `select(id)` loads one by id and applies it. It resolves the layer, or `undefined` for an id outside the build. `theme().id` is the id of the applied layer, or of the base theme when none is applied. The key cookie restores the layer on the next request. See [Cookies](#cookies).

`useUnthemeRenderer()` returns the [CSS renderer](../../packages/css) for the same service. Use it to get the custom property of a token with `var("primary")`, to read a live value, or to emit a static set.

`accessUntheme()` returns the state that the service uses. This is the reactive `config` container from `useState`, with the `patch` and the `input`, and the `input` and `key` cookie refs. Most components need only `useUntheme()`.

## `useUnthemeCatalog()`

The service has one base theme and one applied layer. The app loads a theme as a layer and calls `apply` with it. `useUnthemeCatalog()` returns a catalog over the layers of the build. `list` pages the entries of the layers module. `get` imports one layer on demand and checks it against the contract of the app. Each layer is its own chunk, so the client loads only the themes it applies, and a new build has new chunk URLs.

```ts
import { layers } from "#build/untheme/layers.mjs";

const untheme = useUntheme();
const catalog = useUnthemeCatalog();

layers; // [{ id: "nord", name: "Nord", description: "..." }, ...]
const page = await catalog.list({ limit: 50 }); // the same entries, paged and searchable
const layer = await catalog.get("nord");
if (layer) untheme.apply(layer);
untheme.theme().id; // "nord"
```

The catalog is empty when the build has no layers. The import works during server rendering, so a layer applied on the server renders on the first response.

## Remote themes

For themes that are not in the build, mount `createThemeHandler` from `@untheme/nuxt/server` in a catch-all server route file. The folder of the file is the base that a catalog client uses.

```ts
// server/api/themes/[...path].get.ts
import { createThemeHandler, listEntries } from "@untheme/nuxt/server";

export default createThemeHandler({
  list: (listing) => listEntries(entries, listing),
  get: (id) => useStorage("themes").getItem(id),
});
```

`createThemeHandler(provider)` returns an h3 event handler for the catalog wire protocol. `defineClient` from `untheme/catalog` reads this protocol. The provider is the `Provider` type of `untheme/catalog`. `list` receives the validated and normalized query. `get` returns a layer, or `null` or `undefined` when no layer matches. `listEntries(entries, listing)` filters, sorts, and cuts a window from entries in memory.

```ts
// in the app
import { defineClient } from "untheme/catalog";

const catalog = defineClient(useUntheme().schema, { base: "/api/themes" });
```

See the [Nuxt example](../../examples/nuxt) for aurora served as a preset.

## CSS

The module renders the base cascade to `#build/untheme.css` at build time and links it into the CSS of the app. The module renders the file with [`defineRenderer(...).sheet()`](../../packages/css) over the base theme. The file has the base bindings under `:root`. Each modifier context follows as a `[data-<modifier>="<context>"]` block. The cascade sits in an `@layer untheme` block, so your own unlayered CSS wins over it. Editors index the file and complete `var(--surface)`.

The runtime plugin sets the selected context of each modifier on `<html>` as a `data-<modifier>` attribute, such as `data-color="dark"`. The attribute selects the context blocks of the stylesheet, so a `swap` renders no CSS. Your stylesheets can select on the attribute too.

```css
[data-color="dark"] .card {
  box-shadow: none;
}
```

The plugin injects the patch alone as one reactive `<style>` tag: the tokens that an applied layer or `update` rebinds, and the context overrides a layer carries, made with [`defineRenderer(...).patch()`](../../packages/css). The tag is unlayered, so it wins over the base cascade. It is empty when the patch is, so a page with no applied layer carries no runtime CSS. The tag renders again when the patch changes.

## Cookies and SSR

The module saves the selection and the id of the patch to two cookies, `untheme-input` and `untheme-key`. `swap` writes the input cookie. `apply`, `select`, and `update` write the key cookie. A patch with no id clears it. On the server, the module reads both cookies before it renders. It checks the stored input with `schema.check.input` and uses it when it matches the contract. It loads the layer that the key names through the catalog and uses it when it matches. A cookie that fails, or a key that names no layer of the build, is cleared.

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
