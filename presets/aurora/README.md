# @untheme/aurora

The reference untheme preset: a compact semantic vocabulary over eight
generated tonal ramps and nine modifier axes — the palette itself among them,
with thirty-one themes to choose from — shipped as
[DTCG](https://www.designtokens.org/) JSON only. The package has no
dependencies and no code: one resolver document, the token files it lists,
and a folder per modifier with a file per context.

Aurora demonstrates the full token model — every value family the schema
validates appears at least once (colors, dimensions, durations, font
families and weights, numbers, cubic Béziers, stroke styles, borders,
transitions, shadows, gradients, and typography) — with a token set small
enough to keep in your head.

## The model

Tokens come in three tiers:

- **Ramps** — eight functional tonal palettes (`primary`, `secondary`,
  `tertiary`, `error`, `success`, `warning`, `neutral`, `neutral-variant`),
  each at the eleven Tailwind-style stops (`primary-50` … `primary-950`);
  the six accent ramps also carry muted and vivid chroma columns
  (`primary-muted-500`, `primary-vivid-500`, …) for the vibrancy axis.
  These are the only literal colors in the contract, and the only tokens the
  `theme` axis rebinds: generated from seed colors — see _Regenerating_
  below.
- **Roles** — a small semantic vocabulary: per accent family a fill, its
  text, a tinted container, and its text (`primary`, `on-primary`,
  `primary-container`, `on-primary-container`, …); the surfaces (`surface`,
  `on-surface`, `on-surface-muted`, `surface-container`,
  `surface-container-high`, `outline`, `outline-muted`, `scrim`); and the
  contrast channels the axes cooperate through. Every role binds a ramp stop
  by reference.
- **System scales** — a five-style type scale (`type-display` …
  `type-label`, typography composites whose sizes arrive through sub-value
  references), shape radii (`shape-sm` … `shape-full`), a spacing scale
  (`space-1` … `space-10`), elevation shadows (`elevation-none` …
  `elevation-high`), motion (`duration-*`, `easing-*`, and `transition-*`
  composites), state-layer opacities, strokes, borders, and the brand
  gradients.

Because roles reference ramps rather than literals, a theme defines _only
the 220 ramp values_ — every role and every modifier context follows
automatically.

## The axes

Nine modifier axes, composing in `order`:

| Axis       | Contexts                             | Overrides                         |
| ---------- | ------------------------------------ | --------------------------------- |
| `theme`    | thirty-one palettes — see _Themes_   | the ramps                         |
| `color`    | `light` / `dark`                     | color roles + channels            |
| `vibrancy` | `muted` / `balanced` / `vivid`       | accent roles → chroma channels    |
| `contrast` | `default` / `medium` / `high`        | shifted roles → contrast channels |
| `text`     | `sm` / `md` / `lg`                   | type-scale sizes                  |
| `density`  | `compact` / `default` / `spacious`   | the spacing scale                 |
| `radius`   | `sharp` / `default` / `round`        | shape radii                       |
| `depth`    | `flat` / `default` / `deep`          | elevation shadows                 |
| `motion`   | `default` / `reduced` / `expressive` | durations, delay, easing          |

The base tokens are the default context of every axis: the `theme` axis
supplies the ramps — the base has no palette of its own, its default theme
is the palette — and every other default context rebinds nothing. The axes override
disjoint token sets — apart from `color`, `vibrancy`, and `contrast`, whose
collisions are the point (below) — so all 90,396 combinations stay coherent
without being individually authored. `contrast` follows `vibrancy` in `order`, so
accessibility wins their collision.

## The contrast channels

What "higher contrast" means depends on the mode: in light, `on-surface`
pushes from stop 800 toward 950; in dark, from 200 toward 50. A context is a
single override map, so the contrast axis cannot say "950 if light, 50 if
dark" directly. It says it through reference indirection instead:

- The base defines a channel token per shifted role and level —
  `on-surface-medium-contrast`, `on-surface-high-contrast`, … — holding the
  light scheme's targets.
- The `color` axis's `dark` context rebinds those channels to the dark
  scheme's targets, alongside the roles themselves.
- The `contrast` axis's `medium`/`high` contexts override each shifted role
  with a mode-independent reference to its channel:
  `on-surface: "{on-surface-high-contrast}"`.

Both axes override `on-surface`; `contrast` follows `color` in `order`, so
its reference wins, and the reference resolves through whatever the color
context set. One override, correct in either mode — axes cooperating through
late-bound references rather than a hand-authored context per combination.

The `vibrancy` axis reuses the same mechanism for chroma: accent roles
re-point at `*-muted` / `*-vivid` channels, and the color contexts rebind
each channel to its mode's stop in the matching chroma column.

## Layout

One JSON file per thing, all under `src/`. Token names are flat
(`primary-50`), so each one is also its CSS custom property (`--primary-50`).

```
src/
  resolver.json              sets and modifiers, in resolution order
  tokens/                    the base: what every selection shares
    roles/                   one file per color: its semantic tokens
      primary.json  secondary.json  tertiary.json     16 tokens each
      error.json    success.json    warning.json      16 tokens each
      surface.json                                    14 tokens
    typography.json  20
    shape.json  4     space.json  10    elevation.json  4
    motion.json 11    state.json   3    blur.json       3
    stroke.json 2     border.json  3    gradient.json   2
  modifiers/                 one folder per modifier, one file per context
    theme/                   abyss.json … vesper.json     220 tokens each
    color/                   light.json  dark.json
    vibrancy/                balanced.json  muted.json  vivid.json
    contrast/                default.json  medium.json  high.json
    text/                    sm.json  md.json  lg.json
    density/                 compact.json  default.json  spacious.json
    radius/                  default.json  sharp.json  round.json
    depth/                   default.json  flat.json  deep.json
    motion/                  default.json  reduced.json  expressive.json
```

- **The resolver** is the one document a build points at. Each set lists
  token files; each modifier lists, per context, the one file in its folder.
- **A context file** opens with its `$description` and its display name
  (`$extensions["io.zoobz.untheme"].name`), then holds what its context
  rebinds. A theme file holds the eight ramps — three columns of eleven stops
  for an accent (base, muted, vivid), one column for a neutral. The default
  context of every other modifier rebinds nothing: its file is the name and
  description alone.
- **Every modifier** carries a `description` and a display name in the
  resolver, so a build's manifest names and describes every axis and every
  option — enough to draw a picker for each.
- **A role file** holds every semantic token of one color: for an accent, its
  4 roles (`primary`, `on-primary`, `primary-container`,
  `on-primary-container`), their 4 contrast channels (`*-medium-contrast`,
  `*-high-contrast`) and their 8 vibrancy channels (`*-muted`, `*-vivid`).
  `surface.json` holds the 8 surface roles and their 6 contrast channels.

What each token file needs:

| File             | Needs             |
| ---------------- | ----------------- |
| a `roles` file   | a theme's ramps   |
| `border`         | `roles`, `stroke` |
| `gradient`       | a theme, `roles`  |
| every other file | nothing           |

What each modifier needs:

| Modifier                               | Needs                                   |
| -------------------------------------- | --------------------------------------- |
| `theme`                                | nothing                                 |
| `color`                                | `roles`, `gradient`                     |
| `vibrancy`, `contrast`                 | `roles`                                 |
| `text`                                 | `typography`                            |
| `density`, `radius`, `depth`, `motion` | `space`, `shape`, `elevation`, `motion` |

Every file is exported, so Node package resolution finds it:
`@untheme/aurora/src/tokens/space.json`,
`@untheme/aurora/src/modifiers/theme/nord.json`.

## Usage

Point an [`@untheme/kit`](../../packages/kit) config at the resolver document
with an `npm:/` reference:

```ts
// untheme.config.ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
});
```

`untheme build` (or the [Nuxt module](../../integrations/nuxt), which builds
the config itself) produces the base theme, booted at each axis's default —
`aurora`, `light`, `balanced`, `default`, `md`, and `default` for the rest:

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";

import config, { type Contract } from "./untheme/config.mjs";

const ut = makeUntheme<Contract>(useUnthemeConfig(config));

ut.swap("theme", "nord"); // another palette under the same roles
ut.swap("color", "dark");
ut.swap("vibrancy", "vivid"); // electric dark, by composition
ut.swap("contrast", "high"); // and accessible, contrast wins the collision
```

### Taking only part of it

The config's `modifiers` decides what of aurora a build carries. All
thirty-one themes are over 6,000 ramp bindings; an app that offers three should
build three:

```ts
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
  modifiers: {
    // Keep three themes, in this order, and boot nord.
    theme: { contexts: ["nord", "dracula", "aurora"], default: "nord" },

    // Add a palette of your own: a token file that rebinds the ramp tokens.
    // theme: { add: { brand: "./tokens/brand.json" }, default: "brand" },

    // Turn an axis off: its default stays in the base, the axis is gone.
    depth: false,
  },
});
```

A theme left out is never read and is in neither the built theme nor its
types. The build's `manifest.mjs` lists what was kept — each axis and each
context with its name and description, read from the resolver and the context
files — for the interface that offers the choice. See the kit's [Modifiers](../../packages/kit#modifiers) section for
the rules.

### Adding tokens

To add tokens of your own, write your own resolver document: list aurora's
token files as sets, add yours, and declare each modifier again with aurora's
context files (`npm:/@untheme/aurora/src/modifiers/color/dark.json`) plus any
of yours. The tables above say which files a subset needs. The
[shiki example](../../examples/shiki) adds a `syntax-*` group this way, over
one fixed palette — it lists `modifiers/theme/aurora.json` as a set.

## Themes

Thirty-one themes, one file each under `src/modifiers/theme/` — the contexts
of the `theme` modifier. The preset's own palette, `aurora` — electric
teal-green, violet, and magenta on cold blue-grays — is the default, with no
other special standing.

Editor classics: `ayu`, `catppuccin`, `cyberdream`, `dracula`, `everforest`,
`github`, `gruvbox`, `horizon`, `kanagawa`, `monokai`, `night_owl`, `nord`,
`one_dark`, `palenight`, `rose_pine`, `solarized`, `synthwave`,
`tokyo_night`, `vesper`.

Nature and place: `abyss`, `aurora`, `dune`, `ember`, `glacier`, `moss`,
`sakura`.

Utility and print: `graphite` (grayscale identity with quietly hued
semantics), `manuscript` (sepia ink on paper), `phosphor` (CRT terminal
greens).

Modern open palettes: `flexoki`, `oxocarbon`.

## Regenerating

The files under `src/modifiers/theme/` are generated, and so are the contexts
of the `theme` modifier in `src/resolver.json`; the committed JSON is what
ships, and no color math runs at runtime. Everything else — the rest of the
resolver, the token files, the other modifiers — is authored by hand. To
change a palette or add a theme, edit `scripts/seeds.json`, then run:

```sh
pnpm generate && pnpm format
```

The generator (`scripts/generate.mjs`) expands each seed into a tonal ramp
in OKLCH: the seed contributes hue and chroma, every ramp shares one
perceptual lightness ladder across the eleven stops, and a chroma curve
peaks at the middle and tapers toward both ends (out-of-gamut colors
reduce chroma until sRGB holds them). Every theme seeds all eight ramps
individually; semantic seeds (`error`, `success`, `warning`) stay
recognizably red, green, and amber across themes, hue-shifted toward each
theme's temperature. Each theme file opens with the theme's name and
description from the seeds. The theme folder is rewritten whole, so a theme removed
from the seeds leaves nothing behind.

Aurora has no tests of its own: it is the test fixture of
[`@untheme/kit`](../../packages/kit), whose suite builds it, proves every
context, and checks the contrast and vibrancy channels.

## Related

- [`@untheme/kit`](../../packages/kit) — builds this preset into a theme.
- [Nuxt example](../../examples/nuxt) — restyles a page live across every
  axis.
