# M2 Preset Themes

Themed variations built on the M2 base preset. Each theme is an independent,
faithful translation of a well-known color scheme into M2 design tokens —
overriding both palette tokens (custom palettes generated from the scheme's
canonical colors) and the semantic roles (the light scheme in `tokens`, the dark
scheme in the `color.dark` context).

Each theme is a `preset.define` variant, importable by path; register the ones
you want with `defineUntheme` and select between them at runtime:

```ts
import { defineUntheme } from "@untheme/core";
import preset from "@untheme/material-2";
import dracula from "@untheme/material-2/themes/dracula";

const ut = defineUntheme(preset.use({ color: "light" }), { dracula });
```

## Themes

| Id            | Name        |
| ------------- | ----------- |
| `ayu`         | Ayu         |
| `catppuccin`  | Catppuccin  |
| `cyberdream`  | Cyberdream  |
| `dracula`     | Dracula     |
| `everforest`  | Everforest  |
| `github`      | GitHub      |
| `gruvbox`     | Gruvbox     |
| `horizon`     | Horizon     |
| `kanagawa`    | Kanagawa    |
| `monokai`     | Monokai     |
| `night_owl`   | Night Owl   |
| `nord`        | Nord        |
| `one_dark`    | One Dark    |
| `palenight`   | Palenight   |
| `rose_pine`   | Rose Pine   |
| `solarized`   | Solarized   |
| `synthwave`   | Synthwave   |
| `tokyo_night` | Tokyo Night |
| `vesper`      | Vesper      |
