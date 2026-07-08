# untheme

The umbrella package for the untheme design token system.

Re-exports the core runtime, the token-contract schema, and the structural utils at the package root, and exposes the CSS renderer and the preset-authoring toolkit through subpath entry points. Install this single package to get everything most apps need.

```sh
pnpm add untheme
```

## Entry points

| Import        | Re-exports                                                                               | Provides                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `untheme`     | [`@untheme/core`](../core), [`@untheme/schema`](../schema), [`@untheme/utils`](../utils) | `defineUntheme`, `Untheme`, `Config`, `defineSchema`, `Schema`, `Theme`, `Layer`, `Patch`, `Input`, `SchemaError`, `clone`/`copy`/`merge`/`extend`/`diff`/`delta`/`traverse`, … |
| `untheme/css` | [`@untheme/css`](../css)                                                                 | `defineRenderer`, `Renderer`, `serialize`, `emit`, `property`, `Variables`, …                                                                                                   |
| `untheme/kit` | [`@untheme/kit`](../kit)                                                                 | `defineUnthemePreset`, `Preset`                                                                                                                                                 |

## Usage

```ts
import { defineUntheme } from "untheme";
import { defineRenderer } from "untheme/css";

// The config is { theme, input, override } — the caller-owned state the
// service operates on. `input` selects one context per modifier.
const ut = defineUntheme({ theme, input: { color: "dark" }, override: {} });

const renderer = defineRenderer(ut);
renderer.root();
// :root { --primary: var(--violet); --violet: #b3c5ff; ... }
```

`renderer.root()` builds a single `:root` block of custom properties from the active token bindings, wrapping any value that points at another token in `var()` automatically.

To boot from a preset and register a switchable variant:

```ts
import { defineUntheme } from "untheme";
import { defineUnthemePreset } from "untheme/kit";

const preset = defineUnthemePreset({
  id: "brand",
  name: "Brand",
  tokens: {
    blue: "#3b82f6",
    surface: "{blue}",
  },
  modifiers: {
    color: {
      light: {},
      dark: { surface: "{blue}" },
    },
  },
  order: ["color"],
});

const midnight = preset.define({
  id: "midnight",
  name: "Midnight",
  tokens: { blue: "#1e3a8a" },
});

const ut = defineUntheme(preset.use({ color: "dark" }), { midnight });
ut.select("midnight"); // switch to the registered variant
```

`defineUntheme`'s second argument is a registry of layers keyed by name; `select` applies the one filed under a given key and throws `UnknownThemeError` if nothing is registered there.

## Related

- [`@untheme/core`](../core) — the runtime theme service.
- [`@untheme/schema`](../schema) — token contract types and runtime validation.
- [`@untheme/utils`](../utils) — structural theme operations.
- [`@untheme/css`](../css) — CSS custom-property renderer.
- [`@untheme/kit`](../kit) — preset-authoring toolkit.
- [`@untheme/nuxt`](../../integrations/nuxt) — Nuxt module for runtime theming.
