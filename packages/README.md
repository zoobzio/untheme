# Packages

| Package                         | Directory          | Description                                                                  |
| ------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| [`untheme`](./untheme)          | `packages/untheme` | Umbrella package — core API at the root, `catalog`, `config`, `css` subpaths |
| [`@untheme/catalog`](./catalog) | `packages/catalog` | Theme catalogs: providers and wire-protocol clients (`defineCatalog`)        |
| [`@untheme/core`](./core)       | `packages/core`    | The runtime theme service (`makeUntheme`)                                    |
| [`@untheme/css`](./css)         | `packages/css`     | CSS custom-property renderer (`defineRenderer`)                              |
| [`@untheme/kit`](./kit)         | `packages/kit`     | Build kit: DTCG JSON → contract and key modules (`untheme build`)            |
| [`@untheme/schema`](./schema)   | `packages/schema`  | Token contract types and runtime validation (`defineSchema`)                 |
| [`@untheme/utils`](./utils)     | `packages/utils`   | Structural theme operations (`clone`/`merge`/`diff`)                         |

The kit is a build-time tool and is not re-exported by `untheme`; the runtime
packages never import Terrazzo. Framework integrations (e.g. the Nuxt module)
live in [`../integrations`](../integrations).
