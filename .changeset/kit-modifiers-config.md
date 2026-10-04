---
"@untheme/kit": minor
---

The config takes `modifiers`: what a build keeps of the resolver document's
modifiers, by name.

- `contexts` keeps only the listed contexts, in the listed order; a context
  left out is not built and its files are not read.
- `default` names the context a modifier boots at.
- `add` gives a modifier contexts of your own, each a token file the config
  points at.
- `false` turns a modifier off, leaving its default context in the base.

```ts
export default defineConfig({
  source: "npm:/@untheme/aurora/src/resolver.json",
  modifiers: {
    theme: {
      add: { brand: "./tokens/brand.json" },
      contexts: ["brand", "nord"],
    },
    depth: false,
  },
});
```

Every build also emits `manifest.mjs`: each modifier and each context it kept,
with an id, a display name and a description, for the interface that lets
someone choose. Descriptions are read off the documents — a modifier's
`description`, the root `$description` of a context's token file — and a name
off `$extensions["io.zoobz.untheme"].name`, falling back to the id, titled. `resolveKit`
returns the same `manifest`, and `describe(theme)` builds one from a theme
alone.
