# untheme

The umbrella package for the untheme design token system.

Re-exports the core runtime, the token-contract schema, and the structural utils at the package root, and exposes the catalog, the config helpers, and the CSS renderer through subpath entry points. Install this single package to get everything most apps need at run time.

```sh
pnpm add untheme
```

Themes are authored as DTCG JSON and built by [`@untheme/kit`](../kit), a build-time tool this package does not re-export.

## Entry points

| Import            | Re-exports                                                                               | Provides                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `untheme`         | [`@untheme/core`](../core), [`@untheme/schema`](../schema), [`@untheme/utils`](../utils) | `makeUntheme`, `Untheme`, `Config`, `defineSchema`, `Schema`, `Contract`, `Theme`, `Layer`, `Patch`, `Input`, `SchemaError`, `clone`/`merge`/`diff`/`delta`/`traverse`, … |
| `untheme/catalog` | [`@untheme/catalog`](../catalog)                                                         | `defineCatalog`, `defineClient`, `Catalog`, `Provider`, `Entry`, `Query`, `Page`, …                                                                                       |
| `untheme/config`  | —                                                                                        | `UnthemeConfig`, `defineUnthemeConfig`, `useUnthemeConfig` — the built shape (`theme`/`input`) the kit emits and every integration consumes                               |
| `untheme/css`     | [`@untheme/css`](../css)                                                                 | `defineRenderer`, `Renderer`, `serialize`, `emit`, `property`, `Variables`, …                                                                                             |

## Usage

`untheme build` writes the theme to `untheme/config.mjs`, with a declaration typing it against the theme's exact token and modifier unions. Seed a container from it and boot the service:

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineRenderer } from "untheme/css";

import config, { type Contract } from "./untheme/config.mjs";

// The container is { theme, input, override } — the caller-owned state the
// service operates on. `input` selects one context per modifier.
const ut = makeUntheme<Contract>(useUnthemeConfig(config));

const renderer = defineRenderer(ut);
renderer.root();
// :root { --primary: var(--violet); --violet: #b3c5ff; ... }
```

`renderer.root()` builds a single `:root` block of custom properties from the active token bindings, wrapping any value that points at another token in `var()` automatically.

The service holds one active theme. Other themes are layers — an identity plus the bindings they change — that the caller supplies, typically from a catalog:

```ts
import { defineClient } from "untheme/catalog";

const catalog = defineClient(ut.schema, { base: "/api/untheme" });

const midnight = await catalog.get("midnight"); // proven against the contract
if (midnight) {
  ut.apply(midnight); // become that theme
}
```

## Related

- [`@untheme/core`](../core) — the runtime theme service.
- [`@untheme/schema`](../schema) — token contract types and runtime validation.
- [`@untheme/utils`](../utils) — structural theme operations.
- [`@untheme/css`](../css) — CSS custom-property renderer.
- [`@untheme/catalog`](../catalog) — theme catalogs and the wire protocol.
- [`@untheme/kit`](../kit) — builds the theme from DTCG JSON.
- [`@untheme/nuxt`](../../integrations/nuxt) — Nuxt module for runtime theming.
