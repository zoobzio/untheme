# @untheme/codemirror

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - untheme@0.6.1

## 0.6.0

### Patch Changes

- [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e) Thanks [@zoobzio](https://github.com/zoobzio)! - Documentation and source comments are rewritten in Simplified Technical
  English. READMEs, JSDoc, and inline comments across every package use short
  declarative sentences, one idea per sentence, with a consistent vocabulary.
  No code, types, or emitted output change.
- Updated dependencies [[`afbf821`](https://github.com/zoobzio/untheme/commit/afbf82171cb07d5986b4af5386d3eddca63aff6d), [`e240f21`](https://github.com/zoobzio/untheme/commit/e240f21ae67f96aaadcf28e9c33b38520e5b54d2), [`e842cfe`](https://github.com/zoobzio/untheme/commit/e842cfefa8c0738304ea35f28aa0f39d31be575e)]:
  - untheme@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - untheme@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [[`56bb0c5`](https://github.com/zoobzio/untheme/commit/56bb0c5209738364727cacfeea2e9022d1c4e329), [`f939c78`](https://github.com/zoobzio/untheme/commit/f939c78633ba251e126206b3b981bfeab84304a2)]:
  - untheme@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies []:
  - untheme@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - untheme@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - untheme@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - untheme@0.2.1

## 0.2.0

### Minor Changes

- [`978585b`](https://github.com/zoobzio/untheme/commit/978585bba1ef11fa29062bdb1aaf448b97bc0c63) Thanks [@zoobzio](https://github.com/zoobzio)! - Add the CodeMirror 6 integration. `defineCodeMirrorTheme(schema, map, options?)`
  returns the editor extensions — a `syntaxHighlighting` over the language's tags
  plus an `EditorView.theme` for the chrome — whose colors are `var()`
  indirections to contract tokens, so the editor re-themes through the
  custom-property cascade on a context or theme swap without reconfiguring.

  The role vocabulary is `@lezer/highlight`'s tags (CodeMirror's domain standard);
  the caller owns the interchange, a `map` binding tag names to tokens in their
  contract (re-proved against `schema` at build time). Editor chrome binds from
  `options`, and `options.tags` layers raw-Lezer-tag rules on top for anything the
  shipped vocabulary omits.

### Patch Changes

- Updated dependencies [[`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6), [`bdac46f`](https://github.com/zoobzio/untheme/commit/bdac46fb21a18f0c5231e71fade71e394dee08b6)]:
  - untheme@0.2.0
