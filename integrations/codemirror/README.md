# @untheme/codemirror

Makes a [CodeMirror 6](https://codemirror.net) theme from an untheme contract.
Each color in the theme is a `var()` reference to a token.

## Install

```sh
pnpm add @untheme/codemirror
```

## `defineCodeMirrorTheme`

`defineCodeMirrorTheme(schema, map, options?)` returns an array of two
extensions. One extension is a `syntaxHighlighting` extension for the tags.
The other extension is an `EditorView.theme` for the editor chrome. Each color
is a `var()` reference to a token. The editor changes color when a modifier
context or theme layer rebinds the tokens.

`schema` is `untheme.schema`. `map` binds `@lezer/highlight` tag names to
tokens in your contract, for example `keyword`, `typeName`, `variableName`,
`function`, and `string`. Each name is optional. A tag with no mapped token
renders in the editor foreground color.

```ts
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { makeUntheme } from "untheme";
import { defineCodeMirrorTheme } from "@untheme/codemirror";
import config, { type Contract } from "./untheme/config.mjs";

// The theme that `untheme build` wrote, with code-* tokens
const untheme = makeUntheme<Contract>(config.theme, { patch: {}, input: config.input });

const theme = defineCodeMirrorTheme(
  untheme.schema,
  {
    keyword: "code-keyword",
    string: "code-string",
    comment: "code-comment",
    function: "code-fn",
    typeName: "code-type",
    propertyName: "code-property",
  },
  {
    background: "surface",
    foreground: "code-fg",
    caret: "code-fg",
    selection: "surface-container",
  },
);

new EditorView({
  parent: document.body,
  doc: "const x = 1;",
  extensions: [javascript(), ...theme],
});
```

> - Each token in `map`, in the chrome options, and in `options.tags` must
>   exist in the contract and must have the type `color`.
> - `defineCodeMirrorTheme` throws a `SyntaxMappingError` that lists every
>   invalid binding in `problems`.
> - The editor styles use values such as `var(--code-keyword)`. Emit the
>   matching custom properties with `defineRenderer(untheme).sheet()`.

## Options

`defineCodeMirrorTheme(schema, map, options)` accepts these options:

- `background`, `foreground`, `caret`, `selection`, `gutterBackground`,
  `gutterForeground`, `activeLine`: tokens for the colors of the editor. A part
  with no token keeps the CodeMirror default.
- `dark`: the CodeMirror dark mode flag. The default is `true`.
- `tags`: an array of `TagRule` for tags outside `TAGS`, for
  example `[{ tag: tags.docComment, token: "code-doc" }]`.

## Exports

- `defineCodeMirrorTheme`: makes the theme.
- `SyntaxMappingError`: the error that `defineCodeMirrorTheme` throws.
  `problems` lists each invalid binding.
- `TAGS`: maps tag names to `@lezer/highlight` tags.
- `TagName`: the union of the keys of `TAGS`.
- `TagMap<T>`: the type of `map`. It maps tag names to `Token<T>`.
- `TagRule<T>`: the type of one rule in `options.tags`. It has a raw Lezer
  `Tag`, and an optional token, `fontStyle`, `fontWeight`, and
  `textDecoration`.
- `CodeMirrorOptions<T>`: the type of `options`.

## Related

- [`untheme`](../../packages/untheme): the main package.
- [`@untheme/css`](../../packages/css): the renderer that emits the custom
  properties.
- [`@untheme/shiki`](../shiki): the same integration for Shiki.
