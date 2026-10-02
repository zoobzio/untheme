---
"@untheme/aurora": minor
---

**Breaking:** aurora ships only DTCG JSON and has no dependencies. The
`preset` export, the `AuroraTheme`, `AuroraLayer` and `AuroraInput` types,
and the `./themes/*` TypeScript modules are gone.

`aurora.resolver.json` is the entry point: point an `@untheme/kit` config at
`npm:/@untheme/aurora/aurora.resolver.json`. The tokens are one file per
thing — `tokens/colors/<color>.json` (the ramps), `tokens/roles/<color>.json`
(the semantic tokens and their channels), one file per remaining group, and
`modifiers/<modifier>.json` with one key per context. Token names are
unchanged, so every CSS custom property keeps its name.

All 31 themes ship as JSON: `themes/index.json` lists their id, name and
description, and `themes/<id>/colors/` holds the eight ramp files each one
rebinds. Every file is exported for Node package resolution.
