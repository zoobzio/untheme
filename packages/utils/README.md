# @untheme/utils

Common structural helpers for untheme's theme shape. Types come from [`@untheme/schema`](../schema); guards and generic helpers come from [`@untheme/common`](../common).

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

Computes the patch that turns `from` into `to`: every binding `to` holds that deviates from `from`, token by token and context by context. At the token level only the bound `$value` is compared and emitted — a token's metadata cannot drift through the patch pipeline. Identity and order are not compared. Empty maps mean the themes bind identically; applying the result to `from` via `merge` restores every binding `to` carries. A patch can add and override, never remove — a context override `from` holds that `to` dropped survives the restoration, and identity, order, and slot metadata are not part of it.

```ts
import { diff, merge } from "@untheme/utils";

const deviation = diff(pristine, edited);
merge(pristine, deviation); // ≅ edited
```

## Primitives

Supporting helpers that `merge`, `extend`, and `diff` are built on.

### `clone(theme)`

Deep copy of a theme, facet by facet: identity, tokens, modifiers, and order are each rebuilt through `copy`, so no definition object, nested `$value` structure, or override map is shared with the source. Because `copy` reaches every value through plain property access, cloning a reactive proxy yields an inert, plain snapshot. `clone` throws a `TypeError` if the rebuilt theme isn't structurally equal to the source.

```ts
import { clone } from "@untheme/utils";

const snapshot = clone(theme); // detached from any reactive proxy
```

### `copy(value)`

Deep copy of plain data: records and arrays are rebuilt from fresh containers, so mutating the copy never reaches the source. Non-plain values — functions and class instances, such as those a token's `$extensions` may carry — pass through by reference rather than being duplicated. `structuredClone` is never used: it throws on functions and detaches proxies through a mechanism `copy` deliberately avoids.

### `delta(from, to)`

The entries of `to` that deviate from `from`: every key `to` holds whose value is not structurally equal to the one `from` holds. Emitted values are copies, so the result shares no structure with `to`. Keys with structurally equal values drop out; two objects that bind identically yield an empty result.

### `traverse(modifiers, fn)`

Rebuilds a modifiers structure leaf by leaf: every context of every modifier is mapped through the callback, each modifier keeping its own context keys. The callback's `at` accessor indexes another (possibly sparse) modifiers structure at the same modifier/context coordinates, so a leaf can be combined with its counterpart elsewhere. This is the primitive `diff`, `merge`, and `extend` are all built on.

## Types

- `Overlay<T>` — the shape `merge` accepts: any subset of identity, tokens, modifiers, and order. Both a `Layer` and a `Patch` from [`@untheme/schema`](../schema) fit it.
- `Extension<Tok, Mod, XTok, XMod>` — the shape `extend` accepts: new tokens (`XTok`) and new modifiers (`XMod`) over a base contract's tokens (`Tok`) and modifiers (`Mod`). An existing base token accepts an optional bare binding that rebinds its `$value` only; a new token requires a full slot definition. New modifier axes carry their complete context maps; existing axes take optional overrides.
- `Diff<T>` — the shape `diff` returns: token and per-context override maps, always present (empty when nothing deviates).

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime validation.
- [`@untheme/core`](../core) — the runtime theme service.
