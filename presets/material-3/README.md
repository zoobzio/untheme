# @untheme/material-3

Material Design 3 token preset for untheme.

Provides a complete M3 baseline — 701 palette/scale tokens plus 49 semantic roles, with a `color` modifier carrying the light/dark schemes at standard, medium, and high contrast — as an untheme preset, plus 19 ready-made theme variants importable by path.

## Usage

```ts
import { defineUntheme } from "@untheme/core";
import preset from "@untheme/material-3";
import dracula from "@untheme/material-3/themes/dracula";

// Boot a service from the preset (preset.use(input) yields its Config),
// registering the variants you want to switch to at runtime.
const ut = defineUntheme(preset.use({ color: "dark" }), { dracula });
ut.select("dracula"); // switch to a registered variant

// Or author your own variant against the preset's contract
const brand = preset.define({
  id: "brand",
  name: "Brand",
  tokens: { "violet-40": "#1e40af" },
});
```

## Base Tokens (701)

### Color (572)

22 tonal palettes × 26 M3 tone stops each, using Tailwind color family names as seeds:

**Chromatic:** red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

**Neutral:** slate, gray, zinc, neutral, stone

Each palette is generated via `createM3ColorTokens(name, hex)` using the HCT color space from `@material/material-color-utilities`.

### Typography (83)

- 5 typeface references: `font-brand`, `font-plain` (default: `Roboto, sans-serif`), `weight-regular` (400), `weight-medium` (500), `weight-bold` (700)
- 15 type scales × 5 properties: `{scale}-font`, `{scale}-size`, `{scale}-line-height`, `{scale}-weight`, `{scale}-tracking` — `font` and `weight` reference the typeface tokens above
- 3 prominent label weights: `label-large/medium/small-weight-prominent` (→ `weight-bold`)
- Scales: display-large/medium/small, headline-large/medium/small, title-large/medium/small, body-large/medium/small, label-large/medium/small

### Shape (10)

`shape-none` (0px), `shape-extra-small` (4px), `shape-small` (8px), `shape-medium` (12px), `shape-large` (16px), `shape-large-increased` (20px), `shape-extra-large` (28px), `shape-extra-large-increased` (32px), `shape-extra-extra-large` (48px), `shape-full` (9999px)

### Elevation (6)

`elevation-0` (none) through `elevation-5` (CSS box-shadow values per the M3 spec)

### Motion — Easing (10)

`easing-standard`, `easing-standard-decelerate`, `easing-standard-accelerate`, `easing-emphasized`, `easing-emphasized-decelerate`, `easing-emphasized-accelerate`, `easing-linear`, `easing-legacy`, `easing-legacy-decelerate`, `easing-legacy-accelerate`

### Motion — Duration (16)

`duration-short-1` (50ms) through `duration-short-4` (200ms), `duration-medium-1` (250ms) through `duration-medium-4` (400ms), `duration-long-1` (450ms) through `duration-long-4` (600ms), `duration-extra-long-1` (700ms) through `duration-extra-long-4` (1000ms)

### State (4)

State-layer opacities: `state-hover` (0.08), `state-focus` (0.12), `state-pressed` (0.12), `state-dragged` (0.16)

## Semantic Roles (49)

Color roles bound to the light scheme in the base `tokens`, with the `color` modifier's `dark` context remapping them following the M3 color system specification:

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

19 built-in theme variants ship as individual subpath exports — only the ones you import enter your module graph:

```ts
import dracula from "@untheme/material-3/themes/dracula";
import nord from "@untheme/material-3/themes/nord";
```

See [src/themes/README.md](./src/themes/README.md) for the full list.
