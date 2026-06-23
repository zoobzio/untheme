# @untheme/kit

Authoring toolkit for untheme presets.

A preset ships a complete base theme — reference, system, and role tokens. `defineUnthemePreset(base)` returns the authoring handle that presets use to define theme variants and that apps use to boot a service from them.

## Usage

```ts
// preset.ts — the base theme the preset ships as its default
import { defineUnthemePreset } from "@untheme/kit";

export const preset = defineUnthemePreset({
  id: "my",
  name: "My Preset",
  reference: { blue: "#3b82f6", white: "#ffffff", black: "#000000" },
  system: {
    light: { primary: "blue", surface: "white" },
    dark: { primary: "blue", surface: "black" },
  },
  roles: { accent: "primary" },
});
```

```ts
// themes/brand.ts — a variant resolved against the base
import { preset } from "../preset";

export default preset.define({
  id: "brand",
  name: "Brand",
  reference: { blue: "#1e40af" },
  system: { light: {}, dark: {} },
  roles: {},
});
```

```ts
// app — a ready config for the runtime service
import { defineUntheme } from "@untheme/core";
import { preset } from "my-preset";
import brand from "my-preset/themes/brand";

const ut = defineUntheme(preset.use("dark"), { brand });
```

```ts
// app, customized — derive a widened preset before booting
const app = preset.configure({
  id: "app",
  name: "App",
  reference: { red: "#ff0000" }, // joins the contract
  system: { light: { danger: "red" }, dark: { danger: "red" } },
  roles: { alert: "danger" },
});

const ut = defineUntheme(app.use("dark"));
```

## The authoring handle

`defineUnthemePreset(base)` returns a `Preset` with three methods:

- `define(layer)` — resolves a variant layer against the base into a complete theme: the layer's identity, its overrides merged over the base tokens. Powered by [`merge`](../utils).
- `configure(theme)` — derives a new preset whose base is this one widened by the theme: base tokens overridden where the theme binds them, new tokens joining the contract, identity from the theme. Powered by [`extend`](../utils).
- `use(mode)` — builds a ready `Config` for [`defineUntheme`](../core): the given mode and a detached copy of the base.

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime guards.
- [`@untheme/utils`](../utils) — the clone/merge/extend primitives.
- [`@untheme/core`](../core) — the runtime theme service.
- [`untheme`](../untheme) — umbrella package.
