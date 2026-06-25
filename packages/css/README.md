# @untheme/css

Renders a flat token map into CSS custom properties. Dependency-free.

`generateCSS(tokens)` takes a flat record of token name → value and emits a single `:root` block, one custom property per entry. This is the bridge between a resolved theme (e.g. `untheme.tokens()` from [`@untheme/core`](../core)) and the stylesheet the browser reads.

## Aliasing

A value that is itself another token's key is emitted as a `var()` reference to that property; any other value is emitted verbatim. So an alias chain stays a chain in the output — change one custom property and everything pointing at it follows.

```ts
import { generateCSS } from "@untheme/css";

generateCSS({
  white: "#ffffff",
  black: "#000000",
  background: "white", // a key → var() reference
  foreground: "black",
  primary: "foreground", // chained alias
});
```

```css
:root {
  --white: #ffffff;
  --black: #000000;
  --background: var(--white);
  --foreground: var(--black);
  --primary: var(--foreground);
}
```

An empty record yields an empty string.

## Usage

The flat map `generateCSS` expects is exactly what the core service produces, so the two compose directly — for example, injecting the stylesheet on render:

```ts
import { generateCSS } from "@untheme/css";

const css = generateCSS(untheme.tokens());
```

## Related

- [`@untheme/core`](../core) — the runtime theme service; `untheme.tokens()` produces the flat map this consumes.
- [`@untheme/schema`](../schema) — token contract types; the flat map mirrors `Tokens<T>`.
- [`untheme`](../untheme) — umbrella package; re-exported at `untheme/css`.
