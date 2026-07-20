---
"@untheme/css": minor
"@untheme/utils": minor
"untheme": minor
---

Tighten the public surface. `@untheme/css` now exports only `defineRenderer`,
`property`, and its types — the serializer internals (`serialize`, `emit`,
`dashed`, `indirection`, and the serializer tables) are no longer part of the
package surface. The `@untheme/utils` template guard is renamed from `guard`
to `isTemplate`, matching the naming of every other guard in the workspace.
