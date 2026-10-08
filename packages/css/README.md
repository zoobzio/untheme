# @untheme/css

Renders the tokens of a theme as CSS custom properties.

## Install

```sh
pnpm add @untheme/css
```

## defineRenderer

`defineRenderer(source)` returns a `Renderer` for a `Source`. A `Source` has `theme()`, the active theme, and `tokens()`, the active flat bindings. The core service is a `Source`, so pass it directly.

```ts
import { makeUntheme } from "@untheme/core";
import { defineRenderer } from "@untheme/css";

const untheme = makeUntheme<Contract>(theme, { input, override: {} });
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

The renderer reads the source at render time. A renderer over a reactive container renders again when the state that it read changes.

The `Renderer` has these methods:

- `root()` returns one `:root` block for the active declarations. It returns an empty string when there are no declarations.
- `variables()` returns the declarations as a record of custom property name to CSS text. The record can spread into a style object.
- `property(token)` returns the custom property name of a token.
- `var(token)` returns the `var()` text of a token.
- `value(token)` returns the active binding of a token as CSS text.
- `sheet()` returns the static cascade.

## Static sets

`root(set)` and `variables(set)` render a fixed snapshot of bindings. The set is keyed by token. Each value is a token name or a binding of the type of the token. A token name renders as a `var()` alias to the custom property of that token.

```ts
renderer.root({
  "color.paper": { colorSpace: "srgb", components: [0, 0, 0] },
  "color.accent": "color.white", // var(--color-white)
  "type.display": "type.body", // typography alias with its letter spacing
});
// :root {
//   --color-paper: color(srgb 0 0 0);
//   --color-accent: var(--color-white);
//   --type-display: var(--type-body);
//   --type-display-letter-spacing: var(--type-body-letter-spacing);
// }
```

- The set can cover any subset of the tokens.
- A token that the set omits has no declaration.
- The contract gives the type of each token.

## References

A token bound to a `{other.token}` reference renders as `var(--other-token)`. This applies to a whole-value reference and to a reference in a composite value, such as the color of a border, the offset of a shadow, or the position of a gradient stop. A change to the target custom property changes every dependent.

A gradient stop position that references a number token renders as `calc(var(--other-token) * 100%)`.

A typography token renders two declarations. The `font` shorthand holds the font, and `--type-body-letter-spacing` holds the letter spacing. A typography reference points its letter-spacing property at the letter-spacing property of the target.

## Static cascade

`sheet()` returns the base bindings under `:root`. It then returns the overrides of each modifier context as a `[data-<modifier>="<context>"]` block, in the composition order of the theme.

- A data attribute on the document root selects a context.
- A later block overrides an earlier block.
- A context with no overrides has no block.
- An empty contract returns an empty string.

## Serialization

The renderer serializes each value by the `$type` of its token. The types are color, dimension, duration, fontFamily, fontWeight, number, cubicBezier, strokeStyle, border, transition, shadow, gradient, and typography.

- A color renders as its hex fallback when it has one. Otherwise it renders as the function of its color space.
- A named font weight renders as a number.
- A border renders as the `border` shorthand.
- A transition renders as the `transition` shorthand.
- A typography set renders as the `font` shorthand.
- A gradient renders as `linear-gradient()`.

> The renderer assumes that each binding matches the type of its token. The core service validates bindings.

## Types

- `Source<T>` is the input of `defineRenderer`.
- `Renderer<T>` is the return value of `defineRenderer`.
- `Variable<Tok>` is the custom property name of a token, such as `--color-bg`.
- `Variables<Tok>` is the record that `variables()` returns.
- `Bindings<T>` is a static set for `root(set)` and `variables(set)`.
- `Dashed<S>` is a token name with each dot replaced by a dash.
- `Inputs` is the serializable input for each token type.

The package also exports `property(token)`. It returns the custom property name of a token.

## Related

- [`@untheme/core`](../core) is the runtime theme service. It is a `Source`.
- [`@untheme/schema`](../schema) defines the token contract types.
- [`untheme`](../untheme) re-exports this package as `untheme/css`.
