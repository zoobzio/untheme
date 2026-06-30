# @untheme/carbon

IBM Carbon Design System token preset for untheme.

Provides a complete [Carbon](https://carbondesignsystem.com) baseline — 210 palette tokens plus 31 semantic roles, with a `color` modifier carrying the light and dark schemes — as an untheme preset, plus the official Carbon theme pairings as ready-made variants importable by path.

## Usage

```ts
import { defineUntheme } from "@untheme/core";
import preset from "@untheme/carbon";
import g10g90 from "@untheme/carbon/themes/g10-g90";

// Boot a service from the preset (preset.use(input) yields its Config),
// registering the variants you want to switch to at runtime.
const ut = defineUntheme(preset.use({ color: "dark" }), { "g10-g90": g10g90 });
ut.select("g10-g90"); // switch to a registered variant

// Or author your own variant against the preset's contract
const brand = preset.define({
  id: "brand",
  name: "Brand",
  tokens: { "blue-60": "#1e40af" },
});
```

## Palette Tokens (210)

### Color (122)

The 12 IBM Carbon color families — **blue, cyan, teal, green, gray, cool-gray, warm-gray, red, magenta, purple, orange, yellow** — each a 10-grade palette (`{family}-10` … `{family}-100`). Unlike Radix, Carbon's palette is **mode-independent**: a grade carries the same raw value in every theme, and light/dark divergence happens entirely in the semantic roles, which reference different grades per context.

Values come directly from `@carbon/colors` via `createCarbonColorTokens(name, scale)`.

### Pure tones (2)

`white` (`#ffffff`), `black` (`#000000`) — the contrast color a solid fill resolves its text against.

### Typography (63)

- 3 IBM Plex family stacks: `font-sans`, `font-mono`, `font-serif`
- 15 type-scale styles, each as `{style}-size`, `{style}-line-height`, `{style}-weight`, `{style}-letter-spacing`: `label-01/02`, `helper-text-01/02`, `body-01/02`, `body-compact-01/02`, `heading-01` … `heading-07`

### Spacing (13)

`spacing-01` (0.125rem) through `spacing-13` (10rem), following Carbon's 8px mini-unit scale.

### Motion (12)

- 6 durations: `duration-fast-01/02`, `duration-moderate-01/02`, `duration-slow-01/02`
- 6 easing curves: productive `easing-standard/entrance/exit` and `easing-expressive-standard/entrance/exit`, as CSS `cubic-bezier()` values

## Semantic Roles (31)

The semantic roles follow Carbon's color roles, each referencing a palette grade. They are bound to the White (light) scheme in the base `tokens`; the `color` modifier's `dark` context remaps them onto Gray 100:

| Group       | Tokens                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------- |
| **Surface** | `background`, `background-inverse`, `layer-01/02/03`, `field-01/02`                            |
| **Text**    | `text-primary`, `text-secondary`, `text-on-color`, `text-helper`, `text-error`, `text-inverse` |
| **Link**    | `link-primary`, `link-secondary`, `link-visited`                                               |
| **Border**  | `border-subtle-00/01`, `border-strong-01`, `border-inverse`, `border-interactive`              |
| **Icon**    | `icon-primary`, `icon-secondary`, `icon-on-color`, `icon-inverse`                              |
| **Support** | `support-error`, `support-success`, `support-warning`, `support-info`                          |
| **Other**   | `focus`, `interactive`                                                                         |

> Carbon's interaction-state tokens (`background-hover`, `background-selected`, `text-placeholder`, disabled states, button colors) are derived via alpha compositing rather than referencing a solid palette grade, so they fall outside the palette→role reference contract and are left to the consuming role layer.

## Themes

Each untheme theme bundles a light **and** a dark mode, so the four official single-tone Carbon themes (White, Gray 10, Gray 90, Gray 100) are surfaced as light/dark pairings. The base preset is **White / Gray 100** (Carbon's default); the other three pairings ship as individual subpath exports — only the ones you import enter your module graph:

```ts
import whiteg90 from "@untheme/carbon/themes/white-g90";
import g10g100 from "@untheme/carbon/themes/g10-g100";
import g10g90 from "@untheme/carbon/themes/g10-g90";
```

| Theme       | Light   | Dark     |
| ----------- | ------- | -------- |
| _(base)_    | White   | Gray 100 |
| `white-g90` | White   | Gray 90  |
| `g10-g100`  | Gray 10 | Gray 100 |
| `g10-g90`   | Gray 10 | Gray 90  |
