# Radix Preset Themes

Accent variants built on the Radix base preset. In Radix, a "theme" is primarily
a choice of **accent color** plus the **gray** tuned to pair with it — every scale
already lives in the base preset's palette tokens, so each variant simply remaps
the `accent-*` and `gray-*` semantic roles to a different scale.

## Approach

Each theme overrides only the roles that change: the 12 accent steps, and (when
the recommended gray pairing differs from the base slate) the 12 gray steps plus
the `background`/`panel` globals. The light bindings go in the variant's `tokens`
(the base scheme), the dark bindings in its `color.dark` context. Status colors
(error/success/warning/info) are universal and inherit from the base.

Each theme is a `preset.define` variant, importable by path; register the ones
you want with `defineUntheme` and select between them at runtime:

```ts
import { defineUntheme } from "@untheme/core";
import preset from "@untheme/radix-ui";
import blue from "@untheme/radix-ui/themes/blue";

const ut = defineUntheme(preset.use({ color: "light" }), { blue });
```

## Themes

| Id        | Name    | Accent  | Gray  |
| --------- | ------- | ------- | ----- |
| `blue`    | Blue    | blue    | slate |
| `cyan`    | Cyan    | cyan    | slate |
| `teal`    | Teal    | teal    | sage  |
| `grass`   | Grass   | grass   | sage  |
| `crimson` | Crimson | crimson | mauve |
| `orange`  | Orange  | orange  | sand  |
