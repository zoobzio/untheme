# @untheme/aurora

A preset for untheme. The package has DTCG token files in JSON and a build of
them. The JSON has one resolver document, the token files that the resolver
lists, and one folder for each modifier with one file for each context. The
build has the modules that `untheme build` writes from the resolver, ready for
`makeUntheme`. The tokens are eight tonal color ramps, a set of semantic color
roles, and the system scales for type, shape, space, elevation, and motion.
The package has nine modifiers and thirty-one themes.

## Install

```sh
pnpm add @untheme/aurora
```

## The model

The tokens are in three tiers.

- **Ramps.** The eight ramps are `primary`, `secondary`, `tertiary`, `error`,
  `success`, `warning`, `neutral`, and `neutral-variant`. Each ramp has the
  eleven stops `primary-50` to `primary-950`. The six accent ramps also have a
  muted column and a vivid column, such as `primary-muted-500` and
  `primary-vivid-500`. The ramps are the only literal colors. The `theme`
  modifier is the only modifier that rebinds them. The script in
  `scripts/generate.mjs` makes them from seed colors.
- **Roles.** For each accent, the roles are a fill, the text on the fill, a
  tinted container, and the text on the container. For `primary`, these are
  `primary`, `on-primary`, `primary-container`, and `on-primary-container`. The
  surface roles are `surface`, `on-surface`, `on-surface-muted`,
  `surface-container`, `surface-container-high`, `outline`, `outline-muted`,
  and `scrim`. The contrast channels and vibrancy channels are also roles. Each
  role binds a ramp stop by reference.
- **System scales.** The package has a type scale of five styles, from
  `type-display` to `type-label`. Each style is a typography composite. The
  sizes come from sub-value references. The other scales are the shape radii
  `shape-sm` to `shape-full`, the spacing scale `space-1` to `space-10`, the
  elevation shadows `elevation-none` to `elevation-high`, and the motion tokens
  `duration-*`, `easing-*`, and `transition-*`. The package also has the state
  opacities, blurs, strokes, borders, and two brand gradients.

A theme defines only the 220 ramp values. Every role and every modifier
context follows from them.

## Modifiers

The package has nine modifiers. The `resolutionOrder` of the resolver applies
them in the order of this table.

| Modifier   | Contexts                             | Overrides                         |
| ---------- | ------------------------------------ | --------------------------------- |
| `theme`    | thirty-one palettes, see _Themes_    | the ramps                         |
| `color`    | `light` / `dark`                     | color roles + channels            |
| `vibrancy` | `muted` / `balanced` / `vivid`       | accent roles → chroma channels    |
| `contrast` | `default` / `medium` / `high`        | shifted roles → contrast channels |
| `text`     | `sm` / `md` / `lg`                   | type-scale sizes                  |
| `density`  | `compact` / `default` / `spacious`   | the spacing scale                 |
| `radius`   | `sharp` / `default` / `round`        | shape radii                       |
| `depth`    | `flat` / `default` / `deep`          | elevation shadows                 |
| `motion`   | `default` / `reduced` / `expressive` | durations, delay, easing          |

The base tokens are the default context of every modifier. The default context
of `theme` is the `aurora` palette. The default context of every other
modifier is empty.

The modifiers override separate sets of tokens. `color`, `vibrancy`, and
`contrast` also override some of the same tokens. All 135,594 combinations
resolve from the same files. `contrast` follows `vibrancy` in
`order`, and the `contrast` value wins.

## The contrast channels

In light mode, `on-surface` moves from stop 800 toward stop 950 as contrast
rises. In dark mode, `on-surface` moves from stop 200 toward stop 50. A context
is one override map, so the `contrast` modifier names a channel token. The
channel token holds the target for the current mode.

- The base defines a channel token for each shifted role and level. Two
  examples are `on-surface-medium-contrast` and `on-surface-high-contrast`.
  These tokens hold the targets of the light scheme.
- The `dark` context of `color` rebinds the channel tokens to the targets of
  the dark scheme. It also rebinds the roles.
- The `medium` and `high` contexts of `contrast` override each shifted role
  with a reference to its channel, such as
  `on-surface: "{on-surface-high-contrast}"`.

Both modifiers override `on-surface`. `contrast` follows `color` in `order`, so
its reference wins. The reference resolves through the value that the `color`
context sets. One override gives the correct value in each mode.

The `vibrancy` modifier uses the same method for chroma. Its contexts point
each accent role at a `*-muted` or `*-vivid` channel. The `color` contexts
rebind each channel to the stop of the mode in the matching chroma column.

## Layout

All files are under `src/`. Token names are flat, as in `primary-50`. Each
token name is also its CSS custom property, such as `--primary-50`.

```
src/
  resolver.json              sets and modifiers, in resolution order
  tokens/                    the base tokens
    roles/                   one file for each color
      primary.json  secondary.json  tertiary.json     16 tokens each
      error.json    success.json    warning.json      16 tokens each
      surface.json                                    14 tokens
    typography.json  20
    shape.json  4     space.json  10    elevation.json  4
    motion.json 11    state.json   3    blur.json       3
    stroke.json 2     border.json  3    gradient.json   2
  modifiers/                 one folder for each modifier
    theme/                   abyss.json to vesper.json, 220 tokens each
    color/                   light.json  dark.json
    vibrancy/                balanced.json  muted.json  vivid.json
    contrast/                default.json  medium.json  high.json
    text/                    sm.json  md.json  lg.json
    density/                 compact.json  default.json  spacious.json
    radius/                  default.json  sharp.json  round.json
    depth/                   default.json  flat.json  deep.json
    motion/                  default.json  reduced.json  expressive.json
```

- **The resolver** is the document that a build reads. Each set lists token
  files. Each modifier lists one file in its folder for each context.
- **A context file** starts with its `$description` and its display name in
  `$extensions["io.zoobz.untheme"].name`. Then it holds the tokens that its
  context rebinds. A theme file holds the eight ramps. An accent ramp has three
  columns of eleven stops, which are base, muted, and vivid. A neutral ramp has
  one column. The default context of every modifier except `theme` holds only
  the name and the description.
- **Every modifier** has a `description` and a display name in the resolver. The
  manifest of a build lists them for each modifier and each option. An
  interface can use them to draw a picker.
- **A role file** holds the semantic tokens of one color. For an accent, these
  are 4 roles, 4 contrast channels, and 8 vibrancy channels. The 4 roles are
  `primary`, `on-primary`, `primary-container`, and `on-primary-container`. The
  contrast channels are the `*-medium-contrast` and `*-high-contrast` tokens.
  The vibrancy channels are the `*-muted` and `*-vivid` tokens. `surface.json`
  holds the 8 surface roles and 6 contrast channels.

The next table shows what each token file needs.

| File             | Needs             |
| ---------------- | ----------------- |
| a `roles` file   | a theme's ramps   |
| `border`         | `roles`, `stroke` |
| `gradient`       | a theme, `roles`  |
| every other file | no other file     |

The next table shows what each modifier needs.

| Modifier                               | Needs                                   |
| -------------------------------------- | --------------------------------------- |
| `theme`                                | no other file                           |
| `color`                                | `roles`, `gradient`                     |
| `vibrancy`, `contrast`                 | `roles`                                 |
| `text`                                 | `typography`                            |
| `density`, `radius`, `depth`, `motion` | `space`, `shape`, `elevation`, `motion` |

The package exports every file, so Node package resolution finds each one:
`@untheme/aurora/src/tokens/space.json` and
`@untheme/aurora/src/modifiers/theme/nord.json`.

## Usage

The package exports the modules that `untheme build` writes from its own
resolver document. The modules hold the whole preset, with every modifier at
its default and all thirty-one themes.

| Export                     | Holds                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `@untheme/aurora`          | the `Token`, `Modifier`, `Mod`, and `Context` types, the token list, the modifier list, `isToken`, and `isModifier` |
| `@untheme/aurora/config`   | the base theme, the boot selection, and the `Contract` type                                                         |
| `@untheme/aurora/manifest` | the id, the name, and the description of each modifier and each context                                             |

Import the config and boot a service. The base theme starts at the default of
each modifier, which is `aurora`, `light`, `balanced`, `default`, `md`,
`default`, `default`, `default`, and `default`.

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";

import config, { type Contract } from "@untheme/aurora/config";

const ut = makeUntheme<Contract>(useUnthemeConfig(config));

ut.swap("theme", "nord"); // the nord palette under the same roles
ut.swap("color", "dark");
ut.swap("vibrancy", "vivid"); // vivid accents on the dark scheme
ut.swap("contrast", "high"); // high contrast wins over vibrancy
```

The [Nuxt module](../../integrations/nuxt) takes the same config as its
options, as `untheme: { ...config }`. The modules hold only data. The package
has `untheme` as an optional peer dependency, for the types of the modules.

### Building the preset yourself

To take part of the preset or to add tokens, build the JSON with the kit. Set
the `source` of an [`@untheme/kit`](../../packages/kit) config to the resolver
document with an `npm:/` reference.

```ts
// untheme.config.ts
import { defineConfig } from "@untheme/kit";

export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
});
```

`untheme build` writes the same three modules into `untheme/`. The Nuxt module
runs the same build. The service boots from `./untheme/config.mjs` in the same
way as above.

### Taking part of the preset

The `modifiers` key of the config selects the parts of Aurora that a build
contains. The thirty-one themes hold more than 6,000 ramp bindings. A build
that offers three themes contains only those three themes.

```ts
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
  modifiers: {
    // Keep three themes, in this order, and start with nord.
    theme: { contexts: ["nord", "dracula", "aurora"], default: "nord" },

    // Add a palette. The token file rebinds the ramp tokens.
    // theme: { add: { brand: "./tokens/brand.json" }, default: "brand" },

    // Turn off a modifier. Its default stays in the base tokens.
    depth: false,
  },
});
```

The build reads only the themes that the config keeps. The built tokens and the
types contain only those themes. The `manifest.mjs` of the build lists each
modifier and each context with its name and description. An interface can read
this file to offer the choice. The kit README has the rules in its
[Modifiers](../../packages/kit#modifiers) section.

### Adding tokens

To add tokens, write your own resolver document. List the token files of
Aurora as sets, and add your own sets. Declare each modifier again with the
context files of Aurora, such as
`npm:/@untheme/aurora/src/modifiers/color/dark.json`, and add your own context
files. The tables in _Layout_ show which files a subset needs. The
[shiki example](../../examples/shiki) adds a `syntax-*` group in this way. It
lists `modifiers/theme/aurora.json` as a set to use one fixed palette.

## Themes

The `theme` modifier has thirty-one contexts. Each context is one file under
`src/modifiers/theme/`. The default theme is `aurora`, which has electric
teal-green, violet, and magenta on cold blue-grays.

Editor classics: `ayu`, `catppuccin`, `cyberdream`, `dracula`, `everforest`,
`github`, `gruvbox`, `horizon`, `kanagawa`, `monokai`, `night_owl`, `nord`,
`one_dark`, `palenight`, `rose_pine`, `solarized`, `synthwave`,
`tokyo_night`, `vesper`.

Nature and place: `abyss`, `aurora`, `dune`, `ember`, `glacier`, `moss`,
`sakura`.

Utility and print: `graphite`, `manuscript`, `phosphor`. `graphite` is
grayscale with lightly tinted semantic colors. `manuscript` is sepia ink on
paper. `phosphor` is CRT terminal green.

Modern open palettes: `flexoki`, `oxocarbon`.

## Regenerating

The script generates the files under `src/modifiers/theme/`. It also generates
the contexts of the `theme` modifier in `src/resolver.json`. The committed JSON
is the shipped package. The rest of the
resolver, the token files, and the other modifiers are written by hand.

To change a palette or add a theme, edit `scripts/seeds.json`. Then run:

```sh
pnpm generate && pnpm format
```

The script `scripts/generate.mjs` expands each seed into a tonal ramp in OKLCH.
The seed gives the hue and the chroma. All ramps use one lightness ladder
across the eleven stops. The chroma curve peaks at the middle stops and
tapers toward both ends. When a color is outside the sRGB gamut, the script
reduces its chroma until sRGB holds it.

Each theme has a seed for each of the eight ramps. The seeds for `error`,
`success`, and `warning` stay red, green, and amber in all themes. Their hue
shifts toward the temperature of the theme. Each theme file starts with the
name and the description from the seeds. The script rewrites the theme folder
in full, so each run removes the file of a theme that left the seeds.

## Building

The modules under `.dist/` are a kit build of `src/`. `untheme.config.ts`
points at the resolver document, and `pnpm build` runs `untheme build`. The
test suite in `test/` builds the documents, checks every context, checks the
contrast channels and the vibrancy channels, and compares the exported modules
with that build. A `.dist/` that is older than `src/` fails the suite.

## Related

- [`@untheme/kit`](../../packages/kit) builds this preset into a theme.
- [Nuxt example](../../examples/nuxt) changes a page live across every
  modifier.
