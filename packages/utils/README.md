# @untheme/utils

Common structural helpers for untheme's theme shape. Types come from [`@untheme/schema`](../schema); there is no other dependency.

## Exports

### `clone(theme)`

Structural copy of a theme: fresh records at every facet, so mutating the copy never reaches the original. Reads via plain property access, so cloning a reactive proxy yields an inert snapshot.

```ts
import { clone } from "@untheme/utils";

const snapshot = clone(theme);
snapshot.reference.white = "#fafafa"; // original untouched
```

### `merge(theme, ...overlays)`

Merges overlays over a complete theme into a fresh theme, left to right: later overlays win where they bind the same token, facet by facet, mode by mode. Identity transfers from the last overlay that carries one. No input is mutated; with no overlays the result is a plain clone.

```ts
import { merge } from "@untheme/utils";

merge(theme, patch); // patch has no identity → identity preserved (update)
merge(theme, layer); // layer carries id/name → identity adopted (apply)
merge(theme, layer, patch); // layer applied, then patched — last binding wins
```

### `extend(base, extension)`

Widens a base theme with an extension into a fresh, complete theme over the union contract. The extension may override base tokens or introduce new ones, and its new system and role tokens may alias the extension's own tokens as well as the base's. Identity transfers when the extension carries one; an all-empty extension yields a plain copy of the base.

```ts
import { extend } from "@untheme/utils";

const theme = extend(base, {
  reference: { red: "#ff0000" }, // new token joins the contract
  system: {
    light: { danger: "red" }, // aliases the extension's own token
    dark: { danger: "red" },
  },
  roles: { alert: "danger" },
});
```

Unlike `merge`, which stays within one contract, `extend` is the widening primitive: the result's token unions grow to include the extension's.

### `diff(from, to)`

Computes the patch that turns `from` into `to`: every binding `to` holds that deviates from `from`, facet by facet, mode by mode. Identity is not compared — a patch carries none. All-empty facets mean the themes bind identically, and applying the result to `from` via `merge` restores `to`.

```ts
import { diff, merge } from "@untheme/utils";

const deviation = diff(pristine, edited);
merge(pristine, deviation); // ≅ edited
```

### `Overlay<T>`

The overlay shape `merge` accepts: any subset of identity and bindings. Both a `Layer` and a `Patch` from [`@untheme/schema`](../schema) fit it.

### `Extension<Ref, Sys, Rol, XRef, XSys, XRol>`

The shape `extend` accepts: required token facets (empty records are fine) keyed by the extension's own token names, optional overrides of the base's tokens, plus optional identity.

### `Diff<T>`

The shape `diff` returns: a `Patch` whose facets are always present (empty when nothing deviates), so consumers can inspect them without guards.

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime guards.
- [`@untheme/core`](../core) — the runtime theme service.
