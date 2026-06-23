# Radix Preset Themes

Accent variants built on the Radix base preset. In Radix, a "theme" is primarily
a choice of **accent color** plus the **gray** tuned to pair with it — every scale
already lives in the base preset's reference tokens, so each variant simply remaps
the `accent-*` and `gray-*` system roles to a different scale.

## Approach

Each theme overrides only the mode tokens that change: the 12 accent steps, and
(when the recommended gray pairing differs from the base slate) the 12 gray steps
plus the `background`/`panel` globals. Status colors (error/success/warning/info)
are universal and inherit from the base.

Each theme is a `preset.define` variant, importable by path; pack the ones you
want with `preset.use(...)` to get fully resolved themes:

```ts
import preset from "@untheme/radix-ui";
import blue from "@untheme/radix-ui/themes/blue";

const bundle = preset.use(blue);
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
