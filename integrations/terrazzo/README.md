# @untheme/terrazzo

Codegen from DTCG (2025.10) design token JSON to an `untheme.config.ts`. A
[terrazzo](https://terrazzo.app) plugin and a programmatic `generate()` share
one pipeline: the resolver document's modifiers become untheme's axes, aliases
survive as live references, and the output is validated against untheme's own
schema — including a round-trip proof that Terrazzo's resolution and untheme's
composition agree on every token at every selection.

Token names keep their DTCG dotted paths (`color.primary.600`); the CSS
renderer dashes them into custom properties. Theme documents are plain DTCG
token files that rebind a subset of the base contract — each becomes a layer
in the generated catalog. The default export is the configuration (`theme`
and `input`); the catalog is a named `themes` export, proven against the
config's contract, for whatever serves it — the Nuxt module's `themes`
option, a catalog provider, or a hand-rolled switcher.

## Plugin

```js
// terrazzo.config.js
import { defineConfig } from "@terrazzo/cli";
import untheme from "@untheme/terrazzo";

export default defineConfig({
  tokens: "./tokens.resolver.json",
  plugins: [
    untheme({
      themes: [{ source: "./themes/dark-ocean.json", name: "Dark Ocean" }],
    }),
  ],
});
```

`tz build` writes `untheme.config.ts` into the output directory. Theme
documents resolve against the first token source and load without
credentials.

## Programmatic

`generate()` owns parsing, so a caller-supplied `req` can authenticate every
document the parse touches — remote resolver, referenced sets, and theme
documents alike. It returns the file contents; the caller owns I/O.

```ts
import { generate } from "@untheme/terrazzo";

const { filename, contents } = await generate({
  source: "https://api.example.com/v1/orgs/acme/resolver.json",
  req: async (src) => {
    const response = await fetch(src, {
      headers: { authorization: `Bearer ${key}` },
    });
    return response.text();
  },
});
```

## Boundaries

- Terrazzo's beta token types (`boolean`, `string`, `link`) are off-spec and
  fail codegen by name; `$extends` is ignored.
- A theme or context may only rebind base tokens, never add them.
- Every modifier needs a `default` context — untheme boots one context per
  axis.
- Token names that would collide as CSS custom properties (`a.b` vs `a-b`)
  fail codegen.
