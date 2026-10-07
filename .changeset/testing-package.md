---
"@untheme/testing": patch
---

A new package, `@untheme/testing`, has test helpers and mocks for code that
uses untheme. `mockTheme` builds a complete theme from a terse spec. `"#fff"`
is a color, `"8px"` is a dimension, and `"{blue}"` has the type of `blue`. The
theme is typed as a `Contract` over its own names, and the schema checks it.
`bootUntheme` boots a service over the theme. `mockModules`, `mockKit`, and
`stubKit` stand in for the output of `untheme build` and the result of
`resolveKit`. `mockCatalog` serves layers from memory. `proveTheme` resolves
every token at every selection. A test suite runs without DTCG JSON, a kit
build, or Terrazzo.
