# M3 Preset Themes

Themed variations built on the M3 base preset. Each theme is an independent,
faithful translation of a well-known color scheme into M3 design tokens.

## Approach

Every theme overrides both **reference tokens** (custom tonal palettes generated
from the scheme's canonical colors) and **system tokens** (semantic role mappings
that reflect how the original scheme actually uses its colors). The goal is
maximum fidelity to the source material — not pattern-matching across themes.

Each theme is a `preset.define` variant, importable by path; pack the ones you
want with `preset.use(...)` to get fully resolved themes:

```ts
import preset from "@untheme/material-3";
import dracula from "@untheme/material-3/themes/dracula";

const bundle = preset.use(dracula);
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
