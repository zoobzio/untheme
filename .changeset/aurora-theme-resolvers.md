---
"@untheme/aurora": minor
---

**Breaking:** every aurora theme is a folder with its own resolver document,
and aurora's own palette is one of them.

`themes/<id>/` holds `resolver.json` and the theme's eight ramp files under
`colors/`. The root `aurora.resolver.json` and the `tokens/colors/` files are
gone — they are `themes/aurora/resolver.json` and `themes/aurora/colors/` —
and the manifest moved from `themes/index.json` to `index.json`.

Point an `@untheme/kit` config at
`npm:/@untheme/aurora/themes/aurora/resolver.json`, or at any other theme:
the resolver documents are identical apart from `name` and `description`, each
listing the color files beside it and the shared files under `tokens/` and
`modifiers/`, so they are interchangeable.
