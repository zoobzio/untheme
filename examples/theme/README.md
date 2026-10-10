# @untheme/example-theme

A theme package that builds on a preset. The package is **Mantis**: the
[aurora](../../presets/aurora) preset with its own palette as the base, every
theme of aurora as a layer, and a build that the other examples and an app
take as their preset. It is the shape of a theme package for a site or a
product: a palette of your own, with the roles, the modifier axes, and the
themes of aurora untouched.

## Layout

```
untheme.config.ts      the kit config: aurora as the source, the palette in its ramps set
scripts/generate.mjs   the seeds of the palette, and the script that writes src/mantis.json
src/mantis.json        the palette: its name, its description, and the eight ramps
```

The config is the whole wiring:

```ts
export default defineConfig({
  source: "npm:/@untheme/aurora",
  name: "Mantis",
  extend: {
    description: "Aurora with the palette of the mantis shrimp: ...",
    sets: { ramps: { sources: [{ $ref: "./src/mantis.json" }] } },
  },
  outDir: ".dist",
});
```

- **`source`** names aurora as a preset. The kit reads the `preset.json` of the
  package, takes its resolver document as the source, and inherits its 31
  themes as layers.
- **`extend`** merges a fragment onto that document. The palette joins the
  `ramps` set after the palette of aurora, so its tokens win. Every role of
  aurora references a ramp stop, and every context rebinds a role, so the
  roles, the dark scheme, contrast, vibrancy, and every theme follow the new
  ramps with no bindings of this package's own. The description replaces the
  one of aurora.
- **The base is a layer.** The catalog lists `mantis` first, with the stops
  that differ from aurora's, so a visitor comes back to it after picking a
  theme. The package names its palette once.

## The palette

The ramps are generated, not hand-written. `scripts/generate.mjs` holds one
seed for each ramp and writes `src/mantis.json` with `palette` from
`@untheme/aurora/ramp`, the generator of aurora. The ramps share aurora's
lightness ladder and chroma curve, so every stop sits where aurora's does.

| Ramp              | Color                                  | Seed      |
| ----------------- | -------------------------------------- | --------- |
| `primary`         | peacock teal                           | `#00a3a8` |
| `secondary`       | coral                                  | `#ff5a36` |
| `tertiary`        | violet                                 | `#7b4fd6` |
| `neutral`         | grey with a green cast                 | `#6f766a` |
| `neutral-variant` | the same, a shade cooler, for outlines | `#74786b` |

The `error`, `success`, and `warning` seeds are aurora's. To change a color,
edit the seed and run:

```sh
pnpm generate && pnpm format
```

## Exports

The build writes `.dist/`. The package exports it the way aurora does, so
`untheme: { preset: "@untheme/example-theme" }` is the whole setup for the
[Nuxt module](../../integrations/nuxt), and another kit config names the
package as its source.

- `@untheme/example-theme/config`: the built `{ theme, input }` and the
  `Contract` type.
- `@untheme/example-theme/manifest`: each modifier and its contexts.
- `@untheme/example-theme/layers` and `./layers/<id>.json`: the layer list
  and each layer, `mantis` first, then the themes of aurora.
- `@untheme/example-theme/preset.json` and `./resolver.json`: the preset
  manifest and the portable resolver document of the build. The
  [shiki](../shiki) and [codemirror](../codemirror) examples build on them
  with `source: "npm:/@untheme/example-theme"`.
- `@untheme/example-theme/src/mantis.json`: the palette, as DTCG JSON.

## Scripts

- `pnpm build`: writes `.dist/`.
- `pnpm generate`: writes `src/mantis.json` from the seeds.
- `pnpm test`: builds the theme from the config and checks that the palette is
  the base, that everything else is aurora's, that every theme of aurora
  applies, and that the package is a source for another build.
