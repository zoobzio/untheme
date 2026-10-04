# @untheme/aurora

The reference untheme preset: a compact semantic vocabulary over eight
generated tonal ramps, eight modifier axes, and a catalog of thirty-one
theme variants — shipped as [DTCG](https://www.designtokens.org/) JSON
only. The package has no dependencies and no code: a folder per theme — its
resolver document and its color files — and the token and modifier files
every theme shares.

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
  These are the only literal colors in the contract, and the only part a
  theme owns: generated from seed colors — see _Regenerating_ below.
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

Eight modifier axes, composing in `order`:

| Axis       | Contexts                             | Overrides                         |
| ---------- | ------------------------------------ | --------------------------------- |
| `color`    | `light` / `dark`                     | color roles + channels            |
| `vibrancy` | `muted` / `balanced` / `vivid`       | accent roles → chroma channels    |
| `contrast` | `default` / `medium` / `high`        | shifted roles → contrast channels |
| `text`     | `sm` / `md` / `lg`                   | type-scale sizes                  |
| `density`  | `compact` / `default` / `spacious`   | the spacing scale                 |
| `radius`   | `sharp` / `default` / `round`        | shape radii                       |
| `depth`    | `flat` / `default` / `deep`          | elevation shadows                 |
| `motion`   | `default` / `reduced` / `expressive` | durations, delay, easing          |

The base tokens are the default context of every axis, so each default
context is empty. The axes override disjoint token sets — apart from
`color`, `vibrancy`, and `contrast`, whose collisions are the point
(below) — so all 2,916 combinations stay coherent without being
individually authored. `contrast` follows `vibrancy` in `order`, so
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

One JSON file per thing. Token names are flat (`primary-50`), so each one is
also its CSS custom property (`--primary-50`).

```
index.json                   the manifest: id, name, description
themes/
  <id>/                      one folder per theme
    resolver.json            sets and modifiers, in resolution order
    colors/                  one file per color: its ramp
      primary.json  secondary.json  tertiary.json     33 tokens each
      error.json    success.json    warning.json      33 tokens each
      neutral.json  neutral-variant.json              11 tokens each
tokens/                      shared by every theme
  roles/                     one file per color: its semantic tokens
    primary.json  secondary.json  tertiary.json     16 tokens each
    error.json    success.json    warning.json      16 tokens each
    surface.json                                    14 tokens
  typography.json  20
  shape.json  4     space.json  10    elevation.json  4
  motion.json 11    state.json   3    blur.json       3
  stroke.json 2     border.json  3    gradient.json   2
modifiers/                   shared: one file per modifier, one key per context
  color.json  vibrancy.json  contrast.json  text.json
  density.json  radius.json  depth.json  motion.json
```

- **A theme's resolver** is a complete resolver document. Its `colors` set
  lists the color files beside it; every other set and every modifier
  references the shared files. The 31 documents are identical apart from
  `name` and `description`, so any theme stands in for any other.
- **A color file** holds one ramp. An accent ramp has three columns of eleven
  stops: base, muted and vivid. A neutral ramp has one column.
- **A role file** holds every semantic token of one color: for an accent, its
  4 roles (`primary`, `on-primary`, `primary-container`,
  `on-primary-container`), their 4 contrast channels (`*-medium-contrast`,
  `*-high-contrast`) and their 8 vibrancy channels (`*-muted`, `*-vivid`).
  `surface.json` holds the 8 surface roles and their 6 contrast channels.
- **A modifier file** holds every context of one modifier, one top-level key
  per context; the default context is an empty object. A resolver reads a
  context with a JSON pointer: `../../modifiers/contrast.json#/high`.

What each shared file needs:

| File             | Needs              |
| ---------------- | ------------------ |
| a `roles` file   | a theme's `colors` |
| `border`         | `roles`, `stroke`  |
| `gradient`       | `colors`, `roles`  |
| every other file | nothing            |

What each modifier needs:

| Modifier                               | Needs                                   |
| -------------------------------------- | --------------------------------------- |
| `color`                                | `roles`, `gradient`                     |
| `vibrancy`, `contrast`                 | `roles`                                 |
| `text`                                 | `typography`                            |
| `density`, `radius`, `depth`, `motion` | `space`, `shape`, `elevation`, `motion` |

Every file is exported, so Node package resolution finds it:
`@untheme/aurora/tokens/space.json`,
`@untheme/aurora/themes/nord/colors/primary.json`.

## Usage

Point an [`@untheme/kit`](../../packages/kit) config at a theme's resolver
document with an `npm:/` reference:

```ts
// untheme.config.ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({
  source: "npm:/@untheme/aurora/themes/aurora/resolver.json",
});
```

`untheme build` (or the [Nuxt module](../../integrations/nuxt), which builds
the config itself) produces the base theme, booted at each axis's default —
`light`, `balanced`, `default`, `md`, and `default` for the rest:

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";

import config, { type Contract } from "./untheme/config.mjs";

const ut = makeUntheme<Contract>(useUnthemeConfig(config));

ut.swap("color", "dark");
ut.swap("vibrancy", "vivid"); // electric dark, by composition
ut.swap("contrast", "high"); // and accessible, contrast wins the collision
```

Every theme's resolver is a drop-in for that source — same tokens, same
axes, same defaults, its own palette as the base
(`npm:/@untheme/aurora/themes/nord/resolver.json`).

To add tokens of your own, write your own resolver document: list a theme's
color files and aurora's shared files as sets, add yours, and declare each
modifier again with aurora's context files
(`npm:/@untheme/aurora/modifiers/color.json#/dark`) plus any of yours. The tables above say which files a subset needs. The
[shiki example](../../examples/shiki) adds a `syntax-*` group this way.

## Themes

Thirty-one themes, one folder each under `themes/`, listed with
their name and description in `index.json`. The preset's own palette,
`aurora` — electric teal-green, violet, and magenta on cold blue-grays — is
one of them, with no special standing.

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

A theme is used two ways:

- **As a base theme.** Point a kit config's `source` at its resolver
  (above). The base theme takes the document's `name`; its id is the slug of
  that name unless the config sets `id`.
- **As a layer.** A theme is its `id` and `name` from the manifest and each
  token's `$value` in its color files as its binding — plain JSON reads, no
  build. This is what the [Nuxt example](../../examples/nuxt)'s theme
  handler serves, so an app can switch between all of them.

## Regenerating

`index.json` and the files under `themes/` are generated; the committed
JSON is what ships, and no color math runs at runtime. To change a palette,
edit the seed hexes in `scripts/seeds.json`; to change what every theme
shares — a set, a modifier, the resolution order — edit
`scripts/resolver.json`. Then run:

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
theme's temperature. Each theme's resolver is `scripts/resolver.json` under
the theme's name, beside its color files. The `themes/` folder
and the manifest are rewritten whole, so a theme removed from the seeds
leaves nothing behind.

Aurora has no tests of its own: it is the test fixture of
[`@untheme/kit`](../../packages/kit), whose suite builds it, proves every
context, and checks the contrast and vibrancy channels. After regenerating,
also regenerate the Nuxt example's theme map (`pnpm generate:themes` in
`examples/nuxt`).

## Related

- [`@untheme/kit`](../../packages/kit) — builds this preset into a theme.
- [Nuxt example](../../examples/nuxt) — serves its themes over the catalog
  protocol.
