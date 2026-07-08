# Packages

| Package                       | Directory          | Description                                                       |
| ----------------------------- | ------------------ | ----------------------------------------------------------------- |
| [`untheme`](./untheme)        | `packages/untheme` | Umbrella package — core API at the root, `css` and `kit` subpaths |
| [`@untheme/common`](./common) | `packages/common`  | Dependency-free type guards and typed object helpers              |
| [`@untheme/core`](./core)     | `packages/core`    | The runtime theme service (`defineUntheme`)                       |
| [`@untheme/css`](./css)       | `packages/css`     | CSS custom-property renderer (`defineRenderer`)                   |
| [`@untheme/kit`](./kit)       | `packages/kit`     | Preset-authoring toolkit (`defineUnthemePreset`)                  |
| [`@untheme/schema`](./schema) | `packages/schema`  | Token contract types and runtime validation (`defineSchema`)      |
| [`@untheme/utils`](./utils)   | `packages/utils`   | Structural theme operations (`clone`/`merge`/`extend`/`diff`)     |

Framework integrations (e.g. the Nuxt module) live in [`../integrations`](../integrations).
