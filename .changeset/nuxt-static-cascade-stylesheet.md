---
"@untheme/nuxt": minor
---

Write the static cascade to a `#build/untheme.css` build template and link
it into the app's global CSS. The file renders `sheet()` over the resolved
base theme — the base bindings under `:root`, then each modifier context as
a `[data-<modifier>="<context>"]` block — so the token custom properties
exist as plain CSS: editors index the file and autocomplete `var(--token)`
in authored stylesheets, and the tokens resolve before hydration and
without JavaScript. The cascade sits in an `@layer untheme` block, so the
unlayered style the runtime plugin injects — carrying live overrides and
switched catalog themes — wins every equal-specificity conflict regardless
of head order. Set `css: false` to keep the file out of the bundle; it is
still written to the build directory for indexing and manual
`@import "#build/untheme.css"`. The flag resolves across Nuxt layers as a
scalar, the closest authored value winning.
