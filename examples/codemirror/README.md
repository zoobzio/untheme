# codemirror example

A live CodeMirror 6 editor themed by [`@untheme/codemirror`](../../integrations/codemirror),
with a light/dark toggle — the runtime counterpart to the static
[shiki example](../shiki).

The carrier tokens come from the [aurora](../../presets/aurora) preset widened
in DTCG JSON — the same `tokens/` files as the shiki example: aurora's files
listed from its package by a resolver of its own, plus a `syntax-*` group and
its dark bindings. `untheme build` writes the theme to `untheme/` before the
dev server starts. [`src/main.ts`](./src/main.ts) boots it, injects the
renderer's cascade as a `<style>`,
maps Lezer tag names onto the carriers, and mounts an editor with the resulting
extensions plus `@codemirror/lang-javascript`.

## Run

```sh
pnpm --filter @untheme/example-codemirror dev
```

Open the printed URL (default `http://localhost:5173`). Toggle light/dark: it
flips a single `data-color` attribute on `<html>`, and every `var()` the
editor's generated styles reference re-resolves through the cascade — the whole
editor, chrome and syntax, re-themes with **no reconfigure and no re-parse**.

## The wiring

- The editor's tokens carry `color: var(--syntax-keyword)` etc. (from the
  `HighlightStyle`), its chrome carries `var(--surface-container-high)` etc.
  (from the `EditorView.theme`).
- `renderer.sheet()` defines those custom properties under `:root` and rebinds
  them under `[data-color="dark"]`.
- Flipping the attribute is the only thing that happens on toggle; CSS does the
  rest.
