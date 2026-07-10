# @untheme/aurora

The reference untheme preset: a compact semantic vocabulary over eight
generated tonal ramps, six modifier axes, and a catalog of thirty-one theme
variants.

Aurora demonstrates the full token model — every value family the schema
validates appears at least once (colors, dimensions, durations, font
families and weights, numbers, cubic Béziers, stroke styles, borders,
transitions, shadows, gradients, and typography) — with a token set small
enough to keep in your head.

## The model

Tokens come in three tiers:

- **Ramps** — eight functional tonal palettes (`primary`, `secondary`,
  `tertiary`, `error`, `success`, `warning`, `neutral`, `neutral-variant`),
  each at the eleven Tailwind-style stops (`primary-50` … `primary-950`).
  These are the only literal colors in the contract, generated from seed
  colors — see _Regenerating_ below.
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

Because roles reference ramps rather than literals, a theme variant rebinds
_only the 88 ramp values_ — every role and every modifier context follows
automatically.

## The axes

Six modifier axes, composing in `order`:

| Axis       | Contexts                           | Overrides              |
| ---------- | ---------------------------------- | ---------------------- |
| `color`    | `light` / `dark`                   | color roles + channels |
| `contrast` | `default` / `medium` / `high`      | color roles → channels |
| `text`     | `sm` / `md` / `lg`                 | type-scale sizes       |
| `density`  | `compact` / `default` / `spacious` | the spacing scale      |
| `radius`   | `sharp` / `default` / `round`      | shape radii            |
| `motion`   | `default` / `reduced`              | durations → `0ms`      |

The base tokens are the default context of every axis, so each default
context is empty. The axes override disjoint token sets — apart from `color`
and `contrast`, whose collision is the point (below) — so all 324
combinations stay coherent without being individually authored.

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

## Usage

```ts
import { defineUntheme } from "@untheme/core";
import { preset } from "@untheme/aurora";
import dracula from "@untheme/aurora/themes/dracula";
import nord from "@untheme/aurora/themes/nord";

const ut = defineUntheme(
  preset.use({
    color: "dark",
    contrast: "default",
    text: "md",
    density: "default",
    radius: "default",
    motion: "default",
  }),
  { dracula, nord },
);

ut.swap("contrast", "high"); // high-contrast dark, by composition
ut.select("nord"); // re-tint every role through the ramps
```

The package also exports `AuroraTheme`, `AuroraLayer`, and
`AuroraInput` — the contract types a consumer's own layers and
selections check against.

## Themes

Thirty-one variants, one subpath export each (`@untheme/aurora/themes/<id>`).
The base palette is `aurora` itself — electric teal-green, violet, and
magenta on cold blue-grays — and it appears in the catalog too, so a demo
can always select its way back to the default.

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

Each file carries exactly the eight re-seeded ramps and nothing else.

## Regenerating

`src/ramps.ts` and the files in `src/themes/*.ts` are generated literals —
the committed files are what builds and ships; no color math runs at
runtime. To change a palette, edit the seed hexes in `scripts/seeds.json`
and run:

```sh
pnpm generate && pnpm format
```

The generator (`scripts/generate.mjs`) expands each seed into a tonal ramp
through [`theme-colors`](https://github.com/unjs/theme-colors), the seed
itself landing at stop 500. The base ramps and every theme seed all eight
ramps individually; semantic seeds (`error`, `success`, `warning`) stay
recognizably red, green, and amber across themes, hue-shifted toward each
theme's temperature.

## Related

- [`@untheme/kit`](../../packages/kit) — the authoring handle
  (`define`/`configure`/`use`) this preset is built with.
- [`@untheme/core`](../../packages/core) — the runtime service `use` feeds.
- [`@untheme/schema`](../../packages/schema) — the contract types and the
  validation the tests run against.
