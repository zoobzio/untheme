# @untheme/shiki

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - untheme@0.2.1

## 0.2.0

### Minor Changes

- [`dc01a3a`](https://github.com/zoobzio/untheme/commit/dc01a3ae922ce675274121eb4fc4cfd2d03fae29) Thanks [@zoobzio](https://github.com/zoobzio)! - Add the Shiki integration. `defineShikiTheme(schema, map, options?)` builds a
  Shiki theme whose scope colors are `var()` indirections to contract tokens, so
  highlighted code re-themes through the custom-property cascade on a context or
  theme swap without re-highlighting.

  The role vocabulary is the LSP `SemanticTokenTypes` standard; the caller owns
  the interchange, a `map` binding those roles to tokens in their contract
  (re-proved against `schema` at build time). A universal, strict-LSP scope set
  is always applied, and `options.scopes` layers extra rules on top — with an open
  `role`, so any TextMate scope the standard omits is reachable.

### Patch Changes

- Updated dependencies [[`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6)]:
  - untheme@0.2.0
