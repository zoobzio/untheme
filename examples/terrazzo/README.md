# terrazzo example

The aurora preset authored as DTCG (2025.10) token JSON, compiled to an
`untheme.config.ts` by the [`@untheme/terrazzo`](../../integrations/terrazzo)
plugin — the workflow of a terrazzo user adopting untheme without leaving
their token documents.

## Layout

- `tokens/aurora.tokens.json` — the flat base token set, all 392 tokens.
- `tokens/aurora.resolver.json` — the resolver document: the eight modifier
  axes, each context referencing its own document, defaults marking which
  context the base embodies.
- `tokens/modifiers/<axis>/<context>.json` — one document per context (what
  `color/dark.json` rebinds, what `density/compact.json` rebinds, …); a
  default context's document is empty — the base tokens are its values.
- `tokens/themes/*.json` — theme documents; each rebinds the tonal ramps and
  becomes an entry in the generated catalog.
- `terrazzo.config.js` — wires the plugin and names the bundled themes.

## Commands

```sh
pnpm build      # tz build → .dist/untheme.config.ts
pnpm typecheck  # builds, then typechecks the generated config
```

The JSON under `tokens/` is the example's source of truth: a faithful DTCG
port of the `@untheme/aurora` preset (aurora's authored form is already
DTCG-shaped, so the port is direct). The generated `.dist/untheme.config.ts`
is the same shape `examples/nuxt` authors by hand.
