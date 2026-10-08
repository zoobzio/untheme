# @untheme/utils

Helpers for the theme shape of untheme. The types come from [`@untheme/schema`](../schema). The guards and generic helpers come from [`objectively`](https://www.npmjs.com/package/objectively).

## Install

```sh
pnpm add @untheme/utils
```

## `merge`

`merge(theme, ...overlays)` merges overlays into a complete theme and returns a new theme. The function applies the overlays from left to right. A later overlay replaces an earlier binding of the same token or the same context. The identity and the order come from the last overlay that has them. With no overlays, the result is a copy of the theme.

```ts
import { merge } from "@untheme/utils";

merge(theme, patch); // a patch has no identity, so the identity stays
merge(theme, layer); // a layer has an id and a name, so they replace the identity
merge(theme, layer, patch); // the function applies the layer, then the patch
```

> - A token override replaces the `$value` of the slot. The slot keeps its `$type`, its description, and its other metadata.
> - The function skips an overlay key that has no base slot.

## `diff`

`diff(from, to)` makes the patch that turns `from` into `to`. The patch holds each binding of `to` that differs from `from`, for each token and for each context. For a token, the function compares and returns the `$value`. The function ignores the identity and the order.

```ts
import { diff, merge } from "@untheme/utils";

const deviation = diff(pristine, edited);
merge(pristine, deviation); // has the bindings of edited
```

> - Empty maps mean that the themes have the same bindings.
> - The patch holds added and changed bindings only. A context override that `to` drops stays in the merged result.
> - The patch has no identity, no order, and no slot metadata.

## `clone`

`clone(theme)` makes a deep copy of a theme. The function copies the identity, the tokens, the modifiers, and the order with `copy` from `objectively`. The copy shares no object with the source. A clone of a reactive proxy is a plain object. The function reads each member one time.

```ts
import { clone } from "@untheme/utils";

const snapshot = clone(theme);
```

## `delta`

`delta(from, to)` returns the entries of `to` that differ from `from`. An entry differs when its value and the value of the same key in `from` differ at any depth. The result holds copies of the values. Two objects with equal values give an empty result.

## `traverse`

`traverse(modifiers, fn)` makes a new modifiers structure. The function calls `fn` for each context of each modifier. The result has the same modifier keys and context keys. `fn` receives the function `at`. `at` reads the same modifier and context in another modifiers structure. `at` returns the overrides, or `undefined` when the other structure has no entry there. `diff` and `merge` use `traverse`.

## `isTemplate`

`isTemplate(value)` returns `true` when a value has the shape of a `Template`. A template is a record with a string `id`, a string `name`, an object `tokens`, a record `modifiers`, and an array `order`.

## Types

- `Diff<T>`: the result type of `diff`. It has a token override map and an override map for each context. A map is empty when the themes have the same bindings.

## Related

- [`@untheme/schema`](../schema): token contract types and runtime validation.
- [`@untheme/core`](../core): the runtime theme service.
