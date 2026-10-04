# @untheme/catalog

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.5.0

## 0.4.0

### Minor Changes

- [`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329) Thanks [@zoobzio](https://github.com/zoobzio)! - `toListing(query)` is exported: it fills a query's gaps with the default
  ordering and window, the normalization `defineCatalog` applies. A serving
  handler uses it in place of its own copy.

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

- [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6) Thanks [@zoobzio](https://github.com/zoobzio)! - Extract the theme catalog into the standalone `@untheme/catalog` package,
  re-exported as `untheme/catalog`. `defineCatalog` builds a provider over
  storage callbacks; `defineClient` builds the same surface over a remote
  transport, so themes can be sourced from a server as easily as from a local
  registry. The Nuxt module serves its catalog layers over the catalog wire
  protocol as nitro server assets, keeping theme JSON off the app bundle.

### Patch Changes

- Updated dependencies []:
  - @untheme/schema@0.2.0
