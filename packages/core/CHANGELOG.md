# @untheme/core

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.1
  - @untheme/utils@0.2.1

## 0.2.0

### Patch Changes

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Speed up token reads and deep copies. `get` now probes the layers that can
  bind a token — override, selected contexts in reverse order, base slot —
  instead of assembling the full flat token map on every read, which also drops
  the per-hop cost of dereferencing alias chains. `copy` proves its rebuild
  against the source once at the root instead of at every level; the comparison
  is deep, so loss at any depth is still caught. No behavioral change to
  resolution precedence or copy semantics.
- Updated dependencies [[`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6)]:
  - @untheme/utils@0.2.0
  - @untheme/schema@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - @untheme/common@0.1.0
  - @untheme/schema@0.1.0
  - @untheme/utils@0.1.0
