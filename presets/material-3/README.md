# @untheme/material-3

Material Design 3 token preset for untheme.

Provides a complete M3 baseline with 670 reference tokens and 49 system tokens, ready to use or customize via the theme factory, plus 19 ready-made themed variants.

## Usage

```ts
import { defineM3Theme } from "@untheme/material-3";

// Create a theme with the M3 baseline defaults
const theme = defineM3Theme({ key: "app", label: "My App" });

// Or override specific reference tokens
const brand = defineM3Theme({
  key: "brand",
  label: "Brand",
  reference: { "violet-40": "#1e40af" },
});
```

## Reference Tokens (670)

### Color (572)

22 tonal palettes × 26 M3 tone stops each, using Tailwind color family names as seeds:

**Chromatic:** red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

**Neutral:** slate, gray, zinc, neutral, stone

Each palette is generated via `createM3ColorTokens(name, hex)` using the HCT color space from `@material/material-color-utilities`.

### Typography (62)

- 2 typeface references: `font-brand`, `font-plain` (default: `Roboto, sans-serif`)
- 15 type scales × 4 properties: `{scale}-size`, `{scale}-line-height`, `{scale}-weight`, `{scale}-tracking`
- Scales: display-large/medium/small, headline-large/medium/small, title-large/medium/small, body-large/medium/small, label-large/medium/small

### Shape (7)

`shape-none` (0px), `shape-extra-small` (4px), `shape-small` (8px), `shape-medium` (12px), `shape-large` (16px), `shape-extra-large` (28px), `shape-full` (9999px)

### Elevation (6)

`elevation-0` (none) through `elevation-5` (CSS box-shadow values per the M3 spec)

### Motion — Easing (7)

`easing-standard`, `easing-standard-decelerate`, `easing-standard-accelerate`, `easing-emphasized`, `easing-emphasized-decelerate`, `easing-emphasized-accelerate`, `easing-linear`

### Motion — Duration (16)

`duration-short-1` (50ms) through `duration-short-4` (200ms), `duration-medium-1` (250ms) through `duration-medium-4` (400ms), `duration-long-1` (450ms) through `duration-long-4` (600ms), `duration-extra-long-1` (700ms) through `duration-extra-long-4` (1000ms)

## System Tokens (49)

Color system tokens mapped per light/dark mode following the M3 color system specification:

| Group     | Tokens                                                                                                                                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary   | primary, on-primary, primary-container, on-primary-container, inverse-primary, primary-fixed, primary-fixed-dim, on-primary-fixed, on-primary-fixed-variant                                                            |
| Secondary | secondary, on-secondary, secondary-container, on-secondary-container, secondary-fixed, secondary-fixed-dim, on-secondary-fixed, on-secondary-fixed-variant                                                             |
| Tertiary  | tertiary, on-tertiary, tertiary-container, on-tertiary-container, tertiary-fixed, tertiary-fixed-dim, on-tertiary-fixed, on-tertiary-fixed-variant                                                                     |
| Error     | error, on-error, error-container, on-error-container                                                                                                                                                                   |
| Surface   | surface, on-surface, surface-dim, surface-bright, surface-container-lowest/low/default/high/highest, surface-variant, on-surface-variant, surface-tint, inverse-surface, inverse-on-surface, background, on-background |
| Outline   | outline, outline-variant                                                                                                                                                                                               |
| Utility   | shadow, scrim                                                                                                                                                                                                          |

### Default Mappings

| Role                      | Palette |
| ------------------------- | ------- |
| Primary                   | violet  |
| Secondary                 | indigo  |
| Tertiary                  | pink    |
| Error                     | red     |
| Surface                   | neutral |
| Surface variant / outline | zinc    |

## Custom Color Palettes

Generate your own M3 tonal palettes from any hex color:

```ts
import { createM3ColorTokens } from "@untheme/material-3";

const tokens = createM3ColorTokens("brand", "#6750A4");
// { "brand-0": "#000000", "brand-4": "...", ..., "brand-100": "#ffffff" }
```

## Themes

19 built-in themed variants are available via the `/themes` entry point:

```ts
import themes from "@untheme/material-3/themes";

const dracula = themes.dracula;
```

See [src/themes/README.md](./src/themes/README.md) for the full list.
