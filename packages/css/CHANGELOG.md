# @untheme/css

## 0.2.0

### Minor Changes

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Tighten the public surface. `@untheme/css` now exports only `defineRenderer`,
  `property`, and its types — the serializer internals (`serialize`, `emit`,
  `dashed`, `indirection`, and the serializer tables) are no longer part of the
  package surface. The `@untheme/utils` template guard is renamed from `guard`
  to `isTemplate`, matching the naming of every other guard in the workspace.

### Patch Changes

- Updated dependencies []:
  - @untheme/common@0.2.0
  - @untheme/schema@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - @untheme/common@0.1.0
  - @untheme/schema@0.1.0
