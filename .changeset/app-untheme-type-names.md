---
"@untheme/nuxt": patch
---

Rename the generated app-level types from `App*` to `AppUntheme*`
(`AppUnthemeContract`, `AppUnthemeTheme`, `AppUnthemeThemeLayer`,
`AppUnthemeInput`, `AppUnthemeConfig`) so the auto-imported names don't
collide with app code. `AppUntheme` is unchanged.
