# Carbon Preset Themes

The four official Carbon themes are single-tone — White and Gray 10 are light,
Gray 90 and Gray 100 are dark. An untheme theme bundles a light **and** a dark
mode, so each variant here is a **pairing** of one Carbon light theme with one
Carbon dark theme. The reference palette is identical across all of them (Carbon
grades are mode-independent); a variant only remaps the system modes that differ
from the base.

## Approach

The base preset is **White / Gray 100** (Carbon's default pairing). Each variant
overrides only the mode(s) that change:

- `white-g90` — keeps the White light mode, swaps dark to Gray 90.
- `g10-g100` — keeps the Gray 100 dark mode, swaps light to Gray 10.
- `g10-g90` — swaps both modes (Gray 10 light, Gray 90 dark).

Each variant is a `preset.define` theme, importable by path; pack the ones you
want with `preset.use(...)` to get fully resolved themes:

```ts
import preset from "@untheme/carbon";
import g10g90 from "@untheme/carbon/themes/g10-g90";

const bundle = preset.use(g10g90);
```

## Themes

| Id          | Name               | Light   | Dark     |
| ----------- | ------------------ | ------- | -------- |
| `g10-g90`   | Gray 10 / Gray 90  | Gray 10 | Gray 90  |
| `g10-g100`  | Gray 10 / Gray 100 | Gray 10 | Gray 100 |
| `white-g90` | White / Gray 90    | White   | Gray 90  |
