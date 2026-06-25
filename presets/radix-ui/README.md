# @untheme/radix-ui

Radix UI token preset for untheme.

Provides a complete [Radix Colors](https://www.radix-ui.com/colors) baseline with 801 reference tokens and 49 system tokens as an untheme preset, plus 6 ready-made accent variants importable by path.

## Usage

```ts
import { defineUntheme } from "@untheme/core";
import preset from "@untheme/radix-ui";
import blue from "@untheme/radix-ui/themes/blue";

// Boot a service from the preset (preset.use(mode) yields its Config),
// registering the variants you want to switch to at runtime.
const ut = defineUntheme(preset.use("dark"), { blue });
ut.select("blue"); // switch to a registered variant

// Or author your own variant against the preset's contract
const brand = preset.define({
  id: "brand",
  name: "Brand",
  reference: { "indigo-9": "#1e40af" },
  system: { light: {}, dark: {} },
});
```

## Reference Tokens (801)

### Color (744)

31 Radix scales, each provided as a **light** (`{scale}-{step}`) and **dark** (`{scale}-dark-{step}`) 12-step palette. Radix tunes the light and dark variants of each scale independently — the same step number carries the same _meaning_ in both modes but a different raw value — so both are surfaced as references and the per-mode system tokens select between them.

**Chromatic (25):** tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan, teal, jade, green, grass, brown, orange, sky, mint, lime, yellow, amber, gold, bronze

**Neutral (6):** gray, mauve, slate, sage, olive, sand

Values come directly from `@radix-ui/colors` via `createRadixColorTokens(name, light, dark)`.

### Pure tones (2)

`white` (`#ffffff`), `black` (`#000000`) — the contrast color a solid (step 9/10) fill resolves its text against.

### Radius (7)

`radius-1` (3px) through `radius-6` (16px), plus `radius-full` (9999px).

### Spacing (9)

`space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-5` (24px), `space-6` (32px), `space-7` (40px), `space-8` (48px), `space-9` (64px).

### Typography (33)

- 2 font families: `font-sans`, `font-mono`
- 9 font sizes: `font-size-1` (12px) – `font-size-9` (60px)
- 9 line heights: `line-height-1` (16px) – `line-height-9` (60px)
- 9 letter-spacing steps: `letter-spacing-1` – `letter-spacing-9`
- 4 weights: `weight-light` (300), `weight-regular` (400), `weight-medium` (500), `weight-bold` (700)

### Shadow (6)

`shadow-1` (inset hairline) through `shadow-6` (high overlay), as CSS `box-shadow` values.

## System Tokens (49 per mode)

System tokens follow Radix's [12-step semantic scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale): each step has a consistent role, and the same role maps to a light reference in light mode and a dark reference in dark mode.

| Role suffix      | Step | Usage                        |
| ---------------- | ---- | ---------------------------- |
| `app-bg`         | 1    | App background               |
| `subtle-bg`      | 2    | Subtle background            |
| `element`        | 3    | Component background         |
| `element-hover`  | 4    | Hovered component background |
| `element-active` | 5    | Active / selected component  |
| `border-subtle`  | 6    | Subtle border / separator    |
| `border`         | 7    | Component border, focus ring |
| `border-strong`  | 8    | Hovered component border     |
| `solid`          | 9    | Solid background             |
| `solid-hover`    | 10   | Hovered solid background     |
| `text-subtle`    | 11   | Low-contrast text            |
| `text`           | 12   | High-contrast text           |

- **`accent-*`** (12 + `accent-contrast`): the brand scale — defaults to **indigo**.
- **`gray-*`** (12 + `gray-contrast`): the neutral scale — defaults to **slate**.
- **Status** (`error-*`, `success-*`, `warning-*`, `info-*`): a reduced `-bg` (3), `-border` (7), `-solid` (9), `-solid-hover` (10), `-text` (11) set mapped to **red**, **green**, **amber**, and **blue**.
- **Globals**: `background` (gray-1), `panel` (gray-2), `overlay` (black).

## Themes

6 built-in accent variants ship as individual subpath exports — only the ones you import enter your module graph. Each pairs a Radix accent with its recommended gray:

```ts
import blue from "@untheme/radix-ui/themes/blue";
import teal from "@untheme/radix-ui/themes/teal";
```

`blue` (slate), `cyan` (slate), `teal` (sage), `grass` (sage), `crimson` (mauve), `orange` (sand).

See [src/themes/README.md](./src/themes/README.md) for the full list.
