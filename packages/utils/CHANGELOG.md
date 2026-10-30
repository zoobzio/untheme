# @untheme/utils

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.6.1

## 0.6.0

### Patch Changes

- [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2) Thanks [@zoobzio](https://github.com/zoobzio)! - `copy` is no longer exported from `@untheme/utils` or `untheme`; every copy is
  objectively's `copy`, a deep structural copy in a single walk. `clone` rebuilds
  a theme through `remap` onto its own type. Neither re-reads the source to
  prove the rebuild, so snapshotting a theme out of a reactive container — what
  `makeUntheme` does at construction, and the Nuxt plugin on every request and
  client boot — reads each member once instead of three times, about 60% less
  construction time on a large theme.

- [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e) Thanks [@zoobzio](https://github.com/zoobzio)! - Documentation and source comments are rewritten in Simplified Technical
  English. READMEs, JSDoc, and inline comments across every package use short
  declarative sentences, one idea per sentence, with a consistent vocabulary.
  No code, types, or emitted output change.
- Updated dependencies [[`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e)]:
  - @untheme/schema@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.5.0

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

- Updated dependencies []:
  - @untheme/schema@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.1

## 0.2.0

### Minor Changes

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Tighten the public surface. `@untheme/css` now exports only `defineRenderer`,
  `property`, and its types — the serializer internals (`serialize`, `emit`,
  `dashed`, `indirection`, and the serializer tables) are no longer part of the
  package surface. The `@untheme/utils` template guard is renamed from `guard`
  to `isTemplate`, matching the naming of every other guard in the workspace.

### Patch Changes

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Speed up token reads and deep copies. `get` now probes the layers that can
  bind a token — override, selected contexts in reverse order, base slot —
  instead of assembling the full flat token map on every read, which also drops
  the per-hop cost of dereferencing alias chains. `copy` proves its rebuild
  against the source once at the root instead of at every level; the comparison
  is deep, so loss at any depth is still caught. No behavioral change to
  resolution precedence or copy semantics.
- Updated dependencies []:
  - @untheme/schema@0.2.0

## 0.1.0

### Minor Changes

- Initial public release of the untheme ecosystem.

### Patch Changes

- Updated dependencies []:
  - @untheme/common@0.1.0
  - @untheme/schema@0.1.0
