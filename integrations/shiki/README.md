# @untheme/shiki

Makes a [Shiki](https://shiki.style) theme from an untheme contract. Each
color in the theme is a `var()` reference to a token.

## Install

```sh
pnpm add @untheme/shiki
```

## `defineShikiTheme`

`defineShikiTheme(schema, map, options?)` returns a Shiki theme. The color of
each scope is a `var()` reference, for example `var(--code-keyword)`. The
highlighted output changes color when a modifier context or theme layer
rebinds the tokens. Register the theme with Shiki one time.

`schema` is `untheme.schema`. `map` binds roles to tokens in your contract.
The roles are the LSP `SemanticTokenTypes`, for example `namespace`, `type`,
`function`, `macro`, `decorator`, `keyword`, and `string`. Each role is
optional. A scope with an unmapped role renders in the default foreground
color. Two roles can use the same token.

```ts
import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineShikiTheme } from "@untheme/shiki";
import { codeToHtml } from "shiki";
import config, { type Contract } from "./untheme/config.mjs";

// The theme that `untheme build` wrote, with code-* tokens
const untheme = makeUntheme<Contract>(config.theme, useUnthemeConfig(config));

// Bind roles to tokens
const theme = defineShikiTheme(untheme.schema, {
  keyword: "code-keyword",
  string: "code-string",
  comment: "code-comment",
  function: "code-fn",
  macro: "code-fn",
  type: "code-type",
  namespace: "code-type",
});

const html = await codeToHtml(source, { lang: "ts", theme });
```

> - Each token in `map` must exist in the contract and must have the type
>   `color`.
> - `defineShikiTheme` throws a `SyntaxMappingError` that lists every invalid
>   binding in `problems`.
> - The rendered spans have styles such as `style="color:var(--code-keyword)"`.
>   Emit the matching custom properties with `defineRenderer(untheme).sheet()`.

## Scopes

`BASIC_SCOPES` is a `ScopeRule[]` that routes common TextMate scopes to LSP
roles. `defineShikiTheme` always applies it. TextMate matches a scope by
prefix, so the rules also match scopes such as `keyword.control.rust`.

`options.scopes` adds rules after `BASIC_SCOPES`. A rule that names a base
scope replaces the base rule.

```ts
defineShikiTheme(untheme.schema, map, {
  scopes: [{ scope: "storage.type", role: "type" }],
});
```

`BASIC_SCOPES` has no rule for scopes that have no LSP role, for example
punctuation and Markdown headings. These scopes render in the default
foreground color. The `role` of a `ScopeRule` can be any string. To color such
a scope, add a rule with a custom role and add that role to the map.

```ts
defineShikiTheme(
  untheme.schema,
  { ...map, punctuation: "code-punct" },
  {
    scopes: [{ scope: "punctuation", role: "punctuation" }],
  },
);
```

## Options

`defineShikiTheme(schema, map, options)` accepts these options:

- `scopes`: an array of `ScopeRule` that the function adds after `BASIC_SCOPES`.
- `fg`: a token for the foreground color of the code block.
- `bg`: a token for the background color of the code block.
- `name`: the name of the theme. The default is `"untheme"`.
- `type`: `"light"` or `"dark"`. The default is `"dark"`.

## Exports

- `defineShikiTheme`: makes the theme.
- `SyntaxMappingError`: the error that `defineShikiTheme` throws. `problems`
  lists each invalid binding.
- `BASIC_SCOPES`: the base scope rules.
- `SEMANTIC_TYPES`: the array of LSP role names.
- `SEMANTIC`: maps the semantic token names that Shiki colors to roles.
- `SemanticType`: the union of the values in `SEMANTIC_TYPES`.
- `SyntaxMap<T>`: the type of `map`. It maps roles to `Token<T>`.
- `ScopeRule`: the type of one scope rule.
- `FontStyle`: `"italic"`, `"bold"`, `"underline"`, or `"strikethrough"`.
- `ShikiOptions<T>`: the type of `options`.

## Related

- [`untheme`](../../packages/untheme): the main package.
- [`@untheme/css`](../../packages/css): the renderer that emits the custom
  properties.
