# @untheme/utils

Common structural helpers for untheme's theme shape. Types come from [`@untheme/schema`](../schema); there is no other dependency.

## Exports

### `merge(theme, ...overlays)`

Merges overlays over a complete theme into a fresh theme, left to right: later overlays win where they bind the same token, token by token and context by context. Identity and order transfer from the last overlay that carries them. No input is mutated; with no overlays the result is a plain copy.

```ts
import { merge } from "@untheme/utils";

merge(theme, patch); // patch has no identity → identity preserved (update)
merge(theme, layer); // layer carries id/name → identity adopted (apply)
merge(theme, layer, patch); // layer applied, then patched — last binding wins
```

### `extend(base, extension)`

Widens a base contract with an extension into a fresh contract over the union token and modifier sets. New tokens and new modifiers join; existing tokens are overridden; existing modifier contexts are deep-merged leaf by leaf, so the base's other tokens in that context are kept. The `order` the extension lists wins — any modifier it names is dropped from the base order, then the extension's order is appended. Neither input is mutated.

```ts
import { extend } from "@untheme/utils";

const wide = extend(base, {
  id: "wide",
  name: "Wide",
  tokens: { accent: "#0090ff", bg: "{accent}" }, // new token + override existing
  modifiers: {
    color: { dark: { fg: "{accent}" } }, // override an existing context (leaf)
    density: { compact: {}, cozy: {} }, // a new modifier
  },
  order: ["density", "color"],
});
```

Unlike `merge`, which stays within one contract, `extend` is the widening primitive: the result's token and modifier sets grow to include the extension's.

### `diff(from, to)`

Computes the patch that turns `from` into `to`: every binding `to` holds that deviates from `from`, token by token and context by context. Identity and order are not compared. Empty maps mean the themes bind identically; applying the result to `from` via `merge` restores `to`.

```ts
import { diff, merge } from "@untheme/utils";

const deviation = diff(pristine, edited);
merge(pristine, deviation); // ≅ edited
```

## Types

- `Overlay<T>` — the shape `merge` accepts: any subset of identity, tokens, modifiers, and order. Both a `Layer` and a `Patch` from [`@untheme/schema`](../schema) fit it.
- `Extension<T, XTok, XMod>` — the shape `extend` accepts: new tokens (`XTok`) and new modifiers (`XMod`), plus optional overrides of base tokens and of existing modifier contexts.
- `Diff<T>` — the shape `diff` returns: token and per-context override maps, always present (empty when nothing deviates).

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime validation.
- [`@untheme/core`](../core) — the runtime theme service.
