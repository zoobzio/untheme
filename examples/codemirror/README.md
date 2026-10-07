# codemirror example

A CodeMirror 6 editor with a light/dark toggle. The editor uses the theme from
[`@untheme/codemirror`](../../integrations/codemirror). It is the runtime
counterpart of the [shiki example](../shiki).

The carrier tokens come from the [aurora](../../presets/aurora) preset, with
extra DTCG JSON files. The files in `tokens/` match the shiki example. They are
a resolver that lists the aurora files from its package, a `syntax-*` group,
and the dark bindings of the group. `untheme build` writes the theme to
`untheme/` before the dev server starts.

[`src/main.ts`](./src/main.ts) does four things:

- It boots the built theme.
- It adds the renderer cascade to the page as a `<style>`.
- It maps Lezer tag names to the carriers.
- It mounts an editor with the resulting extensions and
  `@codemirror/lang-javascript`.

## Run

```sh
pnpm --filter @untheme/example-codemirror dev
```

Open the printed URL, which is `http://localhost:5173` by default. The toggle
flips the `data-color` attribute on `<html>`. Every `var()` in the generated
styles of the editor re-resolves through the cascade. The editor chrome and the
syntax both re-theme.

## Wiring

- The editor tokens use `color: var(--syntax-keyword)` and similar values, from
  the `HighlightStyle`. The editor chrome uses `var(--surface-container-high)`
  and similar values, from the `EditorView.theme`.
- `renderer.sheet()` defines those custom properties under `:root` and rebinds
  them under `[data-color="dark"]`.
- The toggle flips the attribute and CSS does the rest.
