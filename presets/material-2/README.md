# @untheme/material-2

Material Design 2 token preset for untheme.

Provides a complete M2 baseline — color palettes, typography, shape, elevation, and motion — as an untheme preset, plus 19 ready-made theme variants importable by path.

## Usage

```ts
import preset from "@untheme/material-2";
import dracula from "@untheme/material-2/themes/dracula";

// Pack the base and the variants you want into a bundle —
// every entry is a complete theme, resolved over the M2 base.
const bundle = preset.use(dracula);

// Or author your own variant against the preset's contract
const brand = preset.define({
  id: "brand",
  name: "Brand",
  reference: { "violet-500": "#1e40af" },
  system: { light: {}, dark: {} },
});
```

## Reference Tokens

### Color (308)

22 palettes × 14 shade stops, using Tailwind color family names as seeds:

**Chromatic:** red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

**Neutral:** slate, gray, zinc, neutral, stone

Each palette spans the standard M2 shades `50–900` plus accents `A100`, `A200`, `A400`, `A700`, generated via `createM2ColorTokens(name, hex)` using the HCT color space from `@material/material-color-utilities`.

### Typography (53)

A typeface reference plus the M2 type scale (`headline-1…6`, `subtitle-1…2`, `body-1…2`, `button`, `caption`, `overline`), each with `size`, `line-height`, `weight`, and `tracking` properties.

### Shape (3)

`shape-small`, `shape-medium`, `shape-large`.

### Elevation (25)

`elevation-0` through `elevation-24` (CSS `box-shadow` values per the M2 spec).

### Motion (11)

4 easing curves (`easing-*`) and 7 durations (`duration-*`).

## System Tokens (12 per mode)

Color roles mapped per light/dark mode: `primary`, `primary-variant`, `on-primary`, `secondary`, `secondary-variant`, `on-secondary`, `background`, `on-background`, `surface`, `on-surface`, `error`, `on-error`.

### Default Mappings

| Role               | Palette |
| ------------------ | ------- |
| Primary            | violet  |
| Secondary          | teal    |
| Background/Surface | neutral |
| Error              | red     |

## Custom Color Palettes

Generate your own M2 palette from any hex color:

```ts
import { createM2ColorTokens } from "@untheme/material-2";

const tokens = createM2ColorTokens("brand", "#6750A4");
// { "brand-50": "...", ..., "brand-900": "...", "brand-A100": "...", ... }
```

## Themes

19 built-in theme variants ship as individual subpath exports — only the ones you import enter your module graph:

```ts
import dracula from "@untheme/material-2/themes/dracula";
import nord from "@untheme/material-2/themes/nord";
```

See [src/themes/README.md](./src/themes/README.md) for the full list.
