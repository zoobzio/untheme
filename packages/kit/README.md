# @untheme/kit

Authoring toolkit for building reusable untheme presets.

A **preset** defines the reference + system token structure once; the factory it produces then accepts deep-partial overrides to create unlimited variants. The [`@untheme/material-2`](../preset/material-2) and [`@untheme/material-3`](../preset/material-3) packages are both built with this kit.

## Exports

### `defineUnthemePreset(preset)`

Creates a theme factory from a base [`Preset`](#presetref-sys). The returned function takes `{ key, label }` plus optional deep-partial `reference`/`modes` overrides and returns a fully resolved preset.

```ts
import { defineUnthemePreset } from "@untheme/kit";

const defineMyPreset = defineUnthemePreset({
  preset: "my",
  key: "my",
  label: "My Preset",
  reference: { blue: "#3b82f6", white: "#fff", black: "#000" },
  modes: {
    light: { primary: "blue", surface: "white" },
    dark: { primary: "blue", surface: "black" },
  },
});

const variant = defineMyPreset({
  key: "brand",
  label: "Brand",
  reference: { blue: "#1e40af" }, // overrides merge over the base
});
```

### `Preset<Ref, Sys>`

A [`Theme`](../core) without `roles` — the reference + per-mode system token contract that a preset defines. Roles are layered on later by the consumer (e.g. the Nuxt module).

### `PresetFactory`

The signature returned by `defineUnthemePreset`.

### `DeepPartial<T>`

Recursively makes every property of `T` optional — used for the override argument.

## Related

- [`@untheme/core`](../core) — the token contract and runtime instance.
- [`untheme`](../untheme) — umbrella package; `untheme/kit` re-exports this package.
