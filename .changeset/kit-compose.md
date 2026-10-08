---
"@untheme/kit": minor
---

A resolver document can reference the sets and modifiers of another document.
The DTCG resolver format lets a `$ref` point into another document, as in
`npm:/@untheme/aurora/src/resolver.json#/sets/ramps`, and lets the keys beside
the `$ref` override what it points to. Terrazzo reads only a same-document
pointer as a set or a modifier, so the kit inlines each external one before
the parse. A resolver that builds on a package lists the sets and modifiers
it keeps and overrides what it changes, such as the palette set, with no copy
of the package's resolver and no file list of its own.
