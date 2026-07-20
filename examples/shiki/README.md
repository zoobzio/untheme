# shiki example

Shows the two halves a [`@untheme/shiki`](../../integrations/shiki) theme needs:
**carrier tokens** to hold the colors, and the **interchange** binding LSP
semantic token types to them.

The carriers come from the [aurora](../../presets/aurora) preset, widened with
`configure`. [`src/preset.ts`](./src/preset.ts) adds a `syntax-*` token group
whose members reference aurora's tonal ramps and rebind for the dark context —
authored exactly like aurora's own roles, so the colors flip light↔dark through
the same modifier axis as everything else.

The interchange is the app's to own. [`src/generate.ts`](./src/generate.ts)
maps each LSP role onto a carrier — many-to-one, reusing the `type` carrier for
`namespace`/`class`/… and the `function` carrier for `method`, surfacing only
the distinctions it wants:

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
    // …
  },
  { fg: "syntax-text", bg: "surface-container" },
);
```

## Run

```sh
pnpm generate
```

Builds `.dist/index.html`: aurora's full cascade in a `<style>` block, a code
sample highlighted by the generated theme, and a light/dark toggle. Flipping it
flips a single `data-color` attribute — the highlighted code re-themes through
the custom-property graph, with no re-highlight.

The script also prints the two-hop indirection it relies on:

```
  scope "keyword" -> var(--syntax-keyword)
  light  --syntax-keyword: var(--primary-600)
  dark   --syntax-keyword: var(--primary-400)
```

A Shiki span reads `var(--syntax-keyword)`; the cascade resolves that to
`var(--primary-600)` under `:root` and to `var(--primary-400)` under
`[data-color="dark"]`, and aurora's ramp defines the final color.
