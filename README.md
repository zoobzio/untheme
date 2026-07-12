# untheme

A type-safe design token system with runtime theming, built on the
[DTCG](https://www.designtokens.org/) 2025.10 token format.

untheme separates the **contract** — which tokens exist, their types, and how
they reference each other — from the **values that fill it**. Modifier axes
rebind tokens per context (light/dark, density, contrast, motion, …), theme
layers rebind them wholesale, and references stay live all the way into CSS:
a role points at a ramp as a `var()` indirection, so swapping a context or
theme cascades through the custom-property graph instead of recompiling
styles. The contract is carried in the types — token names, axes, and
contexts autocomplete and misuse fails to compile — and re-proved at runtime
by a schema derived from the theme itself.

## Anatomy

A theme is a flat map of DTCG token definitions, modifier axes whose contexts
rebind subsets of them, and an order fixing composition precedence. The
runtime service resolves tokens through the active selection:

```ts
import { defineUntheme } from "untheme";

const untheme = defineUntheme({
  theme: {
    id: "app",
    name: "App",
    tokens: {
      "blue-600": {
        $type: "color",
        $value: { colorSpace: "srgb", components: [0.15, 0.35, 0.9] },
      },
      "blue-200": {
        $type: "color",
        $value: { colorSpace: "srgb", components: [0.7, 0.8, 1] },
      },
      primary: { $type: "color", $value: "{blue-600}" },
    },
    modifiers: {
      color: { light: {}, dark: { primary: "{blue-200}" } },
    },
    order: ["color"],
  },
  input: { color: "light" },
  override: {},
});

untheme.resolve("primary"); // the blue-600 color object
untheme.swap("color", "dark"); // primary now follows {blue-200}
```

Rendering to CSS keeps the reference graph intact:

```ts
import { defineRenderer } from "untheme/css";

const renderer = defineRenderer(untheme);

renderer.var("primary"); // "var(--primary)"
renderer.root(); // :root block over the active bindings
renderer.sheet(); // static cascade: base + per-context attribute blocks
```

Reusable presets — a base contract plus a catalog of variant layers — are
authored with the kit (`untheme/kit`); the [aurora](./presets/aurora) preset
is the reference: eight modifier axes over eight tonal ramps, with a large
catalog of themes that each rebind only the ramps.

## Workspace

| Directory                        | Contents                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| [`packages`](./packages)         | The library: the public [`untheme`](./packages/untheme) package and the internals behind it |
| [`presets`](./presets)           | Reusable presets — [`@untheme/aurora`](./presets/aurora) is the reference                   |
| [`integrations`](./integrations) | Framework bridges — the Nuxt module and the terrazzo DTCG codegen                           |
| [`examples`](./examples)         | A themeable Nuxt app, and a terrazzo pipeline compiling DTCG JSON to an untheme config      |

## From DTCG token JSON

Teams that already maintain DTCG token documents (with a resolver document
describing modifiers) can generate their untheme configuration instead of
authoring it: the [`@untheme/terrazzo`](./integrations/terrazzo) plugin
compiles token JSON to an `untheme.config.ts`, keeping aliases live and
proving the translation against Terrazzo's own resolution. See
[`examples/terrazzo`](./examples/terrazzo) for the aurora preset expressed
entirely as token JSON.

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## License

MIT
