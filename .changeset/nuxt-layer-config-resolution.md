---
"@untheme/nuxt": patch
---

Resolve the untheme config across Nuxt layers instead of trusting Nuxt's
defu-merged options, whose array concatenation corrupts array-valued
bindings (shadow lists, gradient stops, `cubicBezier` tuples, color
components, font stacks) and duplicates `order`. When more than one layer
authors an `untheme` key, the module now resolves the chain from
`nuxt.options._layers` per member, the closest layer winning: `theme`
replaces whole, `input` resolves per modifier, and `themes` per catalog
key. A single author keeps the merged options, inline module options
included.
