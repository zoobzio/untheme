# @untheme/core

## 0.4.0

### Minor Changes

- [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329) Thanks [@zoobzio](https://github.com/zoobzio)! - **Breaking:** the TypeScript authoring path is removed; themes are built from
  DTCG JSON by `@untheme/kit`.

  - `defineUntheme` is gone from `@untheme/core` and `untheme`. Boot the service
    with `makeUntheme`, typed by the `Contract` the kit's `config` module
    declares: `makeUntheme<Contract>(useUnthemeConfig(config))`.
  - `extend` and the `Extension` type are gone from `@untheme/utils` and
    `untheme`.
  - The `untheme/kit` subpath is gone, and `untheme` no longer depends on
    `@untheme/kit`: the kit is a build-time tool.

  `untheme/config` keeps `UnthemeConfig`, `defineUnthemeConfig` and
  `useUnthemeConfig`, which describe the built shape — `theme` and `input` —
  the kit emits.

### Patch Changes

- Updated dependencies [[`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329)]:
  - @untheme/utils@0.4.0
  - @untheme/schema@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.3.0
  - @untheme/utils@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.3
  - @untheme/utils@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.2
  - @untheme/utils@0.2.2

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
