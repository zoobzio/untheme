# @untheme/css

Renders a theme's tokens to CSS custom properties.

`defineRenderer(source)` returns a `Renderer` bound to a `Source` — an object exposing `config.theme` (the active theme, whose slots declare each token's type and whose modifier contexts back the static cascade) and `tokens()` (the active flat bindings, references intact). The core service already has this shape, so the common case is passing it straight through: `defineRenderer(untheme)`. Every read happens lazily at render time, so a renderer over a reactive container re-renders when the state it read changes.

## Usage

```ts
import { defineUntheme } from "@untheme/core";
import { defineRenderer } from "@untheme/css";

const untheme = defineUntheme(config, themes);
const renderer = defineRenderer(untheme);

renderer.root();
// :root {
//   --color-bg: #ffffff;
//   --color-accent: var(--color-ink);
// }

renderer.sheet();
// :root { --color-bg: #ffffff; ... }
// [data-color="dark"] { --color-bg: #111111; ... }
```

`root()` renders a single `:root` block over the renderer's active declarations (empty string if the contract holds no tokens). `variables()` gives the same declarations as data — a record of custom property name to CSS text, spreadable into a style object. `property(token)` and `var(token)` give the bare custom property name and its `var()` accessor for one token; `value(token)` gives one token's active binding as CSS text.

## Rendering a static set

`root(set)` and `variables(set)` render a fixed snapshot instead of the source's live bindings. The set is keyed by token; each value is either a **token name** — emitted as a `var()` alias to that token's custom property, the bare form of a `{token}` reference — or a **binding** of the token's own type, exactly as the live accessor supplies.

```ts
renderer.root({
  "color.paper": { colorSpace: "srgb", components: [0, 0, 0] },
  "color.accent": "color.white", // bare token name → var(--color-white)
  "type.display": "type.body", // typography alias, sibling and all
});
// :root {
//   --color-paper: color(srgb 0 0 0);
//   --color-accent: var(--color-white);
//   --type-display: var(--type-body);
//   --type-display-letter-spacing: var(--type-body-letter-spacing);
// }
```

The set is partial: a token it omits emits no declaration, so a snapshot may cover any subset of the contract. The contract still supplies each token's `$type` — the set supplies only values. A token-name value serializes through the same path as an authored `{token}` reference, so a typography alias stays pair-wise. Omit the argument for the live behavior above.

## References always emit as var()

A token bound to a `{other.token}` reference never inlines the target's value — it emits `var(--other-token)`, whole-value or nested inside a composite value (a border's color, a shadow's offset, a gradient stop's position). A gradient stop position that references a number token scales through `calc(var(--other-token) * 100%)`, since the position slot needs a percentage and the referenced custom property holds a unitless number.

This keeps a rebind of the target cascading through the stylesheet: change the referenced custom property once and every dependent picks it up, instead of each dependent baking in a copy of the value it had at render time.

A typography token carries a second declaration alongside its own, since the CSS `font` shorthand cannot hold letter spacing: `--type-body-letter-spacing`. A typography reference stays pair-wise — it points its own letter-spacing property at the target's, not at the target's `font` value.

## The static cascade

`sheet()` renders the full cascade for a theme: the base bindings under `:root`, then each modifier's contexts as `[data-<modifier>="<context>"]` blocks, in the theme's composition order. Selecting a context becomes a data-attribute flip on the document root — every block shares the root's specificity, so later blocks in the theme's order win, mirroring how the service composes them at read time. A context with no overrides emits no block, since the base bindings already are that default context; an empty contract yields an empty string.

Values serialize by each token's declared `$type`: color, dimension, duration, fontFamily, fontWeight, number, cubicBezier, strokeStyle, border, transition, shadow, gradient, and typography each have their own CSS rendering (colors prefer a hex fallback and fall back to the color-space function otherwise; borders and transitions render as their shorthand; and so on). This package trusts its input — bindings arrive already validated against the contract by [`@untheme/schema`](../schema), so serialization does not re-check them.

## Types

- `Source<T>` — what `defineRenderer` reads: `{ config: { theme }, tokens }`.
- `Renderer<T>` — `defineRenderer`'s return: `property`, `var`, `value`, `variables`, `root`, `sheet`.
- `Variable<Tok>` — a token's custom property name, e.g. `--color-bg`.
- `Variables<Tok>` — the record `variables()` returns.
- `Bindings<T>` — a static set for `root(set)`/`variables(set)`: each token mapped to a token-name alias or a binding.
- `Dashed<S>` — a token name with dots replaced by dashes, the ident-safe form a custom property name is built from.
- `Inputs` — the serializable input per token type: the type's own value shape, or a reference in its place.

The lower-level pieces `defineRenderer` is built from are also exported: `serialize(type, value)` and `emit(type, value)` for one token's CSS text, `property(token)` and `dashed(token)` for the custom property name, `indirection(reference)` for a `var()` accessor over a `{token}` reference, and `FONT_WEIGHT_NUMBERS` for the numeric weight behind each named `fontWeight` keyword.

## Related

- [`@untheme/core`](../core) — the runtime theme service; its shape satisfies `Source` directly.
- [`@untheme/schema`](../schema) — token contract types and the validation renderer input is trusted to have already passed.
- [`untheme`](../untheme) — umbrella package; re-exported at `untheme/css`.
