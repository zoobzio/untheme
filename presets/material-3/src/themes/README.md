# M3 Preset Themes

Themed variations built on the M3 base preset. Each theme is an independent,
faithful translation of a well-known color scheme into M3 design tokens.

## Approach

Every theme overrides both **reference tokens** (custom tonal palettes generated
from the scheme's canonical colors) and **mode tokens** (semantic role mappings
that reflect how the original scheme actually uses its colors). The goal is
maximum fidelity to the source material — not pattern-matching across themes.

Import the full set from the package's `/themes` entry point:

```ts
import themes from "@untheme/material-3/themes";
```

## Themes

| Key           | Label              |
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
| `night-owl`   | Night Owl          |
| `nord`        | Nord               |
| `one-dark`    | One Dark           |
| `palenight`   | Material Palenight |
| `rose_pine`   | Rosé Pine          |
| `solarized`   | Solarized          |
| `synthwave`   | Synthwave '84      |
| `tokyo_night` | Tokyo Night        |
| `vesper`      | Vesper             |
