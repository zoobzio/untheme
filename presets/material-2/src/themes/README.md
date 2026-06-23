# M2 Preset Themes

Themed variations built on the M2 base preset. Each theme is an independent,
faithful translation of a well-known color scheme into M2 design tokens —
overriding both reference tokens (custom palettes generated from the scheme's
canonical colors) and mode tokens (semantic role mappings).

Each theme is a `preset.define` variant, importable by path; pack the ones you
want with `preset.use(...)` to get fully resolved themes:

```ts
import preset from "@untheme/material-2";
import dracula from "@untheme/material-2/themes/dracula";

const bundle = preset.use(dracula);
```

## Themes

| Id            | Name               |
| ------------- | ------------------ |
| `ayu`         | Ayu                |
| `catppuccin`  | Catppuccin         |
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
| `palenight`   | Palenight          |
| `rose_pine`   | Rose Pine          |
| `solarized`   | Solarized          |
| `synthwave`   | Synthwave          |
| `tokyo_night` | Tokyo Night        |
| `vesper`      | Vesper             |
