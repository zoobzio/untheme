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

Import the full set from the package's `/themes` entry point:

```ts
import themes from "@untheme/radix-ui/themes";
```

## Themes

| Theme     | Accent  | Gray  |
| --------- | ------- | ----- |
| `blue`    | blue    | slate |
| `cyan`    | cyan    | slate |
| `teal`    | teal    | sage  |
| `grass`   | grass   | sage  |
| `crimson` | crimson | mauve |
| `orange`  | orange  | sand  |
