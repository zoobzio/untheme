# @untheme/Aurora

The reference untheme preset: Material 3 semantics, six modifier axes, and a
catalog of nineteen theme variants.

Aurora demonstrates the full token model — every DTCG value family the
schema validates (colors, dimensions, durations, font families and weights,
numbers, cubic Béziers, shadows), modifier axes that compose in a declared
order, and theme layers that re-tint the entire system by rebinding eight
tonal ramps.

## The model

Tokens come in three tiers:

- **Ramps** — eight functional tonal palettes (`primary`, `secondary`,
  `tertiary`, `error`, `success`, `warning`, `neutral`, `neutral-variant`),
  each at the 26 M3 tone stops (`primary-0` … `primary-100`). These are the
  only literal colors in the contract, pregenerated from seed colors — see
  _Regenerating_ below.
- **Roles** — the M3 semantic vocabulary (`surface`, `on-surface`,
  `primary-container`, `outline`, …) plus `success`/`warning` mirrors of the
  error roles. Every role binds a ramp step by reference, and the
  role-to-tone mapping is fixed by the M3 spec.
- **System scales** — the M3 type scale (per-property: `body-medium-size`,
  `body-medium-line-height`, …), shape radii (`shape-*`), elevation shadows
  (`elevation-0` … `elevation-5`), motion easings and durations, state-layer
  opacities, and a spacing scale (`space-*`, `control-*`) of Aurora's own,
  since M3 defines none.

Because roles reference ramps rather than literals, a theme variant rebinds
_only the 208 ramp values_ — every role and every modifier context follows
automatically.

## The axes

Six modifier axes, composing in `order`:

| Axis       | Contexts                           | Overrides                    |
| ---------- | ---------------------------------- | ---------------------------- |
| `color`    | `light` / `dark`                   | color roles + channels       |
| `contrast` | `default` / `medium` / `high`      | color roles → channels       |
| `text`     | `sm` / `md` / `lg`                 | type-scale sizes and leading |
| `density`  | `compact` / `default` / `spacious` | spacing and control metrics  |
| `radius`   | `sharp` / `default` / `round`      | shape radii                  |
| `motion`   | `default` / `reduced`              | durations → `0ms`            |

The base tokens are the default context of every axis, so each default
context is empty. The axes override disjoint token sets — apart from `color`
and `contrast`, whose collision is the point (below) — so all 324
combinations stay coherent without being individually authored.

## The contrast channels

What "higher contrast" means depends on the mode: in light, `on-surface`
pushes from tone 10 toward 0; in dark, from 90 toward 100. A context is a
single override map, so the contrast axis cannot say "tone 0 if light, tone
100 if dark" directly. It says it through reference indirection instead:

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
import { preset } from "@untheme/Aurora";
import dracula from "@untheme/Aurora/themes/dracula";
import nord from "@untheme/Aurora/themes/nord";

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

Nineteen variants, one subpath export each (`@untheme/Aurora/themes/<id>`):

`ayu`, `catppuccin`, `cyberdream`, `dracula`, `everforest`, `github`,
`gruvbox`, `horizon`, `kanagawa`, `monokai`, `night_owl`, `nord`, `one_dark`,
`palenight`, `rose_pine`, `solarized`, `synthwave`, `tokyo_night`, `vesper`.

Each file carries exactly the eight re-seeded ramps and nothing else.

## Regenerating

The ramps in `src/preset.ts` and the files in `src/themes/*.ts` are generated
literals — the committed files are what builds and ships; no color math runs
at runtime. To change a
palette, edit the seed hexes in `scripts/seeds.json` and run:

```sh
pnpm generate && pnpm format
```

The generator (`scripts/generate.mjs`) expands each seed into a tonal ramp
via M3's HCT color space. The base preset derives its primary, secondary,
tertiary, error, and neutral ramps from a single source seed exactly as the
M3 baseline does; themes seed all eight ramps individually.

## Related

- [`@untheme/kit`](../../packages/kit) — the authoring handle
  (`define`/`configure`/`use`) this preset is built with.
- [`@untheme/core`](../../packages/core) — the runtime service `use` feeds.
- [`@untheme/schema`](../../packages/schema) — the contract types and the
  validation the tests run against.
