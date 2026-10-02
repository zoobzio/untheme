---
"@untheme/kit": minor
---

**Breaking:** `@untheme/kit` is now a generator, and DTCG JSON is the only
way to define tokens. `defineUnthemePreset`, `makePreset`, `configure`,
`define`, `use` and their types are gone.

One authored `untheme.config.ts` points at a DTCG resolver document —
`defineConfig({ source, id?, name?, outDir? })` — and
`untheme build [--config <file>] [--root <dir>]` writes two modules with
declarations to `outDir` (default `untheme/`): `index.mjs` (the `Token`
union, modifier and context types, the token and modifier lists, `isToken`
and `isModifier`) and `config.mjs` (the base `theme`, the boot `input` — each
modifier's `default` context — and the `Contract` type). A `.untheme.json`
manifest lets the next build remove only the files it wrote. The kit emits no
CSS and no theme layers.

`source` is a path, a URL, or an `npm:/` reference into an installed package
(`npm:/@untheme/aurora/aurora.resolver.json`), resolved with Node package
resolution from the project root. Composition and layering use the resolver
format itself: to extend a theme, write a resolver that lists its files.

The code of `@untheme/terrazzo` moved into the kit, which reads documents
with `@terrazzo/parser` only, converts them, validates them with untheme's
schema, and proves the result against Terrazzo's own resolution.
`@untheme/terrazzo` and its `plugin` for `tz build` are no longer developed;
use the kit instead. A modifier declared inline in `resolutionOrder` is now
built — it used to be dropped without an error.

`generate()`, `writeOutput()` and `build()` are the programmatic pipeline;
`resolveKit()` returns `{ theme, input, outDir, documents }` without writing
files.

`emit({ theme, input })` is exported: it returns the `index` and `config`
modules for a built theme without reading or writing anything.
