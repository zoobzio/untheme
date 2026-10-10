# codemirror example

A CodeMirror 6 editor with a light/dark toggle. The editor uses the theme from
[`@untheme/codemirror`](../../integrations/codemirror). It is the runtime
counterpart of the [shiki example](../shiki).

The carrier tokens come from the [theme example](../theme), a preset over
aurora, with two DTCG JSON files of this example's own. The files in `tokens/`
match the shiki example: a `syntax-*` group and the dark bindings of the
group. `untheme.config.ts` names the preset as its source and extends it with
both. `untheme build` writes the theme to `untheme/` before the dev server
starts.

[`src/theme.ts`](./src/theme.ts) maps Lezer tag names to the carriers and binds
the editor chrome to tokens. [`src/main.ts`](./src/main.ts) does three things:

- It boots the built theme.
- It adds the renderer cascade to the page as a `<style>`.
- It mounts an editor with the extensions from the map and
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

## Test

```sh
pnpm test
```

[`test/theme.test.ts`](./test/theme.test.ts) checks the map and the chrome
without a build of the preset. A mock theme from
[`@untheme/testing`](../../packages/testing) defines only the carriers that the
map and the chrome name. The tests check four things:

- Every binding names a color token of the contract.
- The editor gets its two extensions.
- A binding to a token that is not a color is rejected.
- A swap of the color context rebinds the carriers through the cascade.
