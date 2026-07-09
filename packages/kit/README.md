# @untheme/kit

Authoring toolkit for untheme presets.

A preset ships a complete base theme — a flat token map plus the modifier axes (e.g. a `color` axis with `light`/`dark` contexts) that override those tokens. `defineUnthemePreset(base)` returns the authoring handle that presets use to define theme variants and that apps use to boot a service from them.

## Usage

```ts
// preset.ts — the base theme the preset ships as its default
import { defineUnthemePreset } from "@untheme/kit";

export const preset = defineUnthemePreset({
  id: "my",
  name: "My Preset",
  tokens: {
    blue: {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0.231, 0.51, 0.965] },
    },
    white: {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 1, 1] },
    },
    black: {
      $type: "color",
      $value: { colorSpace: "srgb", components: [0, 0, 0] },
    },
    surface: { $type: "color", $value: "{white}" },
    primary: { $type: "color", $value: "{blue}" },
  },
  modifiers: {
    color: {
      light: { surface: "{white}" },
      dark: { surface: "{black}" },
    },
  },
  order: ["color"],
});
```

```ts
// themes/brand.ts — a variant layer, filed in the service's registry
export default {
  id: "brand",
  name: "Brand",
  tokens: { blue: { colorSpace: "srgb", components: [0.118, 0.251, 0.686] } },
};
```

```ts
// app — a ready config for the runtime service
import { defineUntheme } from "@untheme/core";
import { preset } from "my-preset";
import brand from "my-preset/themes/brand";

const ut = defineUntheme(preset.use({ color: "dark" }), { brand });
// ut.select("brand") switches to the layer above, resolved against the base
```

```ts
// app, customized — derive a widened preset before booting
const app = preset.configure({
  id: "app",
  name: "App",
  tokens: {
    // new tokens join the contract, so each needs a full definition
    red: {
      $type: "color",
      $value: { colorSpace: "srgb", components: [1, 0, 0] },
    },
    danger: { $type: "color", $value: "{red}" },
  },
  modifiers: {
    color: { light: { danger: "{red}" }, dark: { danger: "{red}" } },
  },
  order: ["color"],
});

// a configured preset's theme is machine-built, so it boots through the factory
const ut = makeUntheme(app.use({ color: "dark" }));
```

## The authoring handle

`defineUnthemePreset(base)` returns a `Preset` with three methods:

- `define(layer)` — resolves a variant layer against the base into a complete theme: the layer's identity, its overrides merged over the base tokens and modifier contexts. Powered by [`merge`](../utils).
- `configure(extension)` — derives a new preset whose base is this one widened by the extension: base tokens and contexts overridden where the extension binds them, new tokens and modifiers joining the contract, identity from the extension. Powered by [`extend`](../utils).
- `use(input)` — builds a ready `Config` for [`defineUntheme`](../core): the given selection (one context per modifier), a detached copy of the base, and an empty override.

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime guards.
- [`@untheme/utils`](../utils) — the merge/extend/diff primitives.
- [`@untheme/core`](../core) — the runtime theme service.
- [`untheme`](../untheme) — umbrella package.
