# shiki example

A static page with a Shiki theme from [`@untheme/shiki`](../../integrations/shiki).
The example has two parts. **Carrier tokens** hold the colors. The
**interchange** binds LSP semantic token types to the carriers.

## Carrier tokens

The carriers come from the [theme example](../theme), a preset over aurora.
Its `syntax-*` token group holds one color role for each kind of syntax, over
the tonal ramps of the preset, and its dark color context rebinds the group.
The colors flip between light and dark through the same modifier axis as the
other color roles. This example adds no tokens and runs no build. It imports
`@untheme/example-theme/config`: the built theme, its boot selection, and the
`Contract` type.

## Interchange

[`src/theme.ts`](./src/theme.ts) maps each LSP role to a carrier. Several roles
share a carrier. The `type` carrier serves `namespace` and `class`, and the
`function` carrier serves `method`. [`src/generate.ts`](./src/generate.ts)
builds the Shiki theme from the map.

```ts
export const MAP = {
  keyword: "syntax-keyword",
  string: "syntax-string",
  function: "syntax-function",
  macro: "syntax-builtin",
  type: "syntax-type",
  namespace: "syntax-type",
  // more roles
} as const satisfies SyntaxMap<Contract>;

const theme = defineShikiTheme(untheme.schema, MAP, {
  fg: "syntax-text",
  bg: "surface-container",
});
```

## Run

```sh
pnpm generate
```

The script writes `.dist/index.html`. The page has the full cascade of the
preset in a `<style>` block, a code sample that the generated theme
highlights, and a light/dark toggle. The toggle flips the `data-color`
attribute. The custom-property graph re-themes the highlighted code.

The script prints the two-hop path from scope to color:

```
  scope "keyword" -> var(--syntax-keyword)
  light  --syntax-keyword: var(--primary-600)
  dark   --syntax-keyword: var(--primary-400)
```

A Shiki span reads `var(--syntax-keyword)`. The cascade resolves it to
`var(--primary-600)` under `:root` and to `var(--primary-400)` under
`[data-color="dark"]`. The ramp of the preset defines the final color.

## Test

```sh
pnpm test
```

[`test/theme.test.ts`](./test/theme.test.ts) checks the interchange without
the theme package. A mock theme from [`@untheme/testing`](../../packages/testing)
defines only the carriers that the map names, over two stops of two ramps. The
tests check three things:

- Every role binds to a color token of the contract.
- Each scope reaches its carrier through a `var()`.
- A swap of the color context rebinds the carriers, and the Shiki theme does
  not change.

The map is declared `as const`, so the same constant type-checks against the
mock contract and the real contract.
