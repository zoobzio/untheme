# Packages

| Package                         | Directory          | Description                                                                                  |
| ------------------------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| [`untheme`](./untheme)          | `packages/untheme` | The public package. It exports the core API and the `catalog`, `config`, and `css` subpaths. |
| [`@untheme/catalog`](./catalog) | `packages/catalog` | Defines theme catalogs, providers, and clients with `defineCatalog`.                         |
| [`@untheme/core`](./core)       | `packages/core`    | Makes the runtime theme service with `makeUntheme`.                                          |
| [`@untheme/css`](./css)         | `packages/css`     | Renders a theme as CSS custom properties with `defineRenderer`.                              |
| [`@untheme/kit`](./kit)         | `packages/kit`     | Builds DTCG JSON into the contract and config modules with `untheme build`.                  |
| [`@untheme/schema`](./schema)   | `packages/schema`  | Defines the token contract types and the runtime validation with `defineSchema`.             |
| [`@untheme/utils`](./utils)     | `packages/utils`   | Copies, merges, and compares themes with `clone`, `merge`, and `diff`.                       |

The framework integrations are in [`../integrations`](../integrations).
