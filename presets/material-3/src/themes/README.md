# M3 Preset Themes

Themed variations built on the M3 base preset. Each theme is an independent,
faithful translation of a well-known color scheme into M3 design tokens.

## Approach

Every theme overrides both **palette tokens** (custom tonal palettes generated
from the scheme's canonical colors) and the **semantic roles** — the light scheme
in `tokens`, the dark scheme in the `color.dark` context — that reflect how the
original scheme actually uses its colors. The goal is maximum fidelity to the
source material — not pattern-matching across themes.

Each theme is a `preset.define` variant, importable by path; register the ones
you want with `defineUntheme` and select between them at runtime:

```ts
import { defineUntheme } from "@untheme/core";
import preset from "@untheme/material-3";
import dracula from "@untheme/material-3/themes/dracula";

const ut = defineUntheme(preset.use({ color: "light" }), { dracula });
```

## Themes

| Id            | Name               |
| ------------- | ------------------ |
| `ayu`         | Ayu                |
| `catppuccin`  | Catppuccin Mocha   |
| `cyberdream`  | Cyberdream         |
| `dracula`     | Dracula            |
| `everforest`  | Everforest         |
| `github`      | GitHub             |
| `gruvbox`     | Gruvbox            |
| `horizon`     | Horizon            |
| `kanagawa`    | Kanagawa           |
| `monokai`     | Monokai            |
| `night_owl`   | Night Owl          |
| `nord`        | Nord               |
| `one_dark`    | One Dark           |
| `palenight`   | Material Palenight |
| `rose_pine`   | Rosé Pine          |
| `solarized`   | Solarized          |
| `synthwave`   | Synthwave '84      |
| `tokyo_night` | Tokyo Night        |
| `vesper`      | Vesper             |
