# shiki example

A static page with a Shiki theme from [`@untheme/shiki`](../../integrations/shiki).
The example has two parts. **Carrier tokens** hold the colors. The
**interchange** binds LSP semantic token types to the carriers.

## Carrier tokens

The carriers come from the [aurora](../../presets/aurora) preset, with extra DTCG
JSON files.

- [`tokens/syntax.json`](./tokens/syntax.json) adds a `syntax-*` token group.
  The members reference the tonal ramps of aurora.
- [`tokens/syntax-dark.json`](./tokens/syntax-dark.json) rebinds the group for
  the dark context. The colors flip between light and dark through the same
  modifier axis as the aurora roles.
- [`tokens/aurora-syntax.resolver.json`](./tokens/aurora-syntax.resolver.json)
  lists the aurora files from its package (`npm:/@untheme/aurora/...`). It adds
  the syntax set after the aurora sets. It adds the dark file in the dark color
  context.
- [`untheme.config.ts`](./untheme.config.ts) points at the resolver.
  `untheme build` writes the theme to `untheme/`.

## Interchange

[`src/generate.ts`](./src/generate.ts) maps each LSP role to a carrier. Several
roles share a carrier. The `type` carrier serves `namespace` and `class`, and
the `function` carrier serves `method`.

```ts
const theme = defineShikiTheme(
  untheme.schema,
  {
    keyword: "syntax-keyword",
    string: "syntax-string",
    function: "syntax-function",
    macro: "syntax-builtin",
    type: "syntax-type",
    namespace: "syntax-type",
    // more roles
  },
  { fg: "syntax-text", bg: "surface-container" },
);
```

## Run

```sh
pnpm generate
```

The script runs `untheme build` and writes `.dist/index.html`. The page has the
full aurora cascade in a `<style>` block, a code sample that the generated theme
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
`[data-color="dark"]`. The ramp of aurora defines the final color.
