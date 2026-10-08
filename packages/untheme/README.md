# untheme

The umbrella package for the untheme design token system. The package gives access to the runtime service, the schema, the utils, the catalog, the config helpers, and the CSS renderer.

## Install

```sh
pnpm add untheme
```

[`@untheme/kit`](../kit) builds a theme from DTCG JSON. Install the kit as a separate package.

## Entry points

| Import            | Re-exports                                                                               | Provides                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `untheme`         | [`@untheme/core`](../core), [`@untheme/schema`](../schema), [`@untheme/utils`](../utils) | `makeUntheme`, `Untheme`, `Config`, `defineSchema`, `Schema`, `Contract`, `Theme`, `Layer`, `Patch`, `Input`, `SchemaError`, `clone`/`merge`/`diff`/`delta`/`traverse`, … |
| `untheme/catalog` | [`@untheme/catalog`](../catalog)                                                         | `defineCatalog`, `defineClient`, `Catalog`, `Provider`, `Entry`, `Query`, `Page`, …                                                                                       |
| `untheme/config`  | -                                                                                        | `UnthemeConfig`, `defineUnthemeConfig`                                                                                                                                     |
| `untheme/css`     | [`@untheme/css`](../css)                                                                 | `defineRenderer`, `Renderer`, `serialize`, `emit`, `property`, `Variables`, …                                                                                             |

## Usage

`untheme build` writes the theme to `untheme/config.mjs`. A declaration file types the theme with its token names and modifier names. `makeUntheme` makes the service from the theme and a container with an empty patch and the starting input.

```ts
import { makeUntheme } from "untheme";
import { defineRenderer } from "untheme/css";

import config, { type Contract } from "./untheme/config.mjs";

// The container is { patch, input }. `input` selects one context for each modifier.
// The theme of the config is the base theme of the service.
const ut = makeUntheme<Contract>(config.theme, { patch: {}, input: config.input });

const renderer = defineRenderer(ut);
renderer.root();
// :root { --primary: var(--violet); --violet: #b3c5ff; ... }
```

`renderer.root()` returns one `:root` block of custom properties for the active token bindings. A value that points at another token becomes a `var()` reference.

The service has one base theme and one applied layer. A layer has an identity and the bindings that it changes. The caller supplies the layers, for example from a catalog or from the `layers/` output of a kit build.

```ts
import { defineClient } from "untheme/catalog";

const catalog = defineClient(ut.schema, { base: "/api/untheme" });

const midnight = await catalog.get("midnight"); // checked against the contract
if (midnight) {
  ut.apply(midnight); // the active theme is the base with midnight merged in
}
```

## Related

- [`@untheme/core`](../core): the runtime theme service.
- [`@untheme/schema`](../schema): token contract types and runtime validation.
- [`@untheme/utils`](../utils): structural theme operations.
- [`@untheme/css`](../css): CSS custom property renderer.
- [`@untheme/catalog`](../catalog): theme catalogs and the wire protocol.
- [`@untheme/kit`](../kit): builds the theme from DTCG JSON.
- [`@untheme/nuxt`](../../integrations/nuxt): Nuxt module for runtime theming.
