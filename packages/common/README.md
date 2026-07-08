# @untheme/common

Basic type helpers shared across untheme packages. No dependencies.

## Exports

### `keys(obj)` / `values(obj)` / `entries(obj)`

`Object.keys` / `Object.values` / `Object.entries`, typed to the object's own
key and value unions instead of `string` / widened values. Each asserts the
object holds no keys beyond those in its type — safe for literals built in
place, a lie for objects that arrive with extra keys.

```ts
import { entries, keys, values } from "@untheme/common";

keys({ a: 1, b: 2 }); // ("a" | "b")[]
values({ a: 1, b: "x" }); // (number | string)[]
entries({ a: 1, b: "x" }); // (["a", number] | ["b", string])[]
```

### `reduce(obj, fn, init)`

Object-shaped reduce: folds the entries into an accumulator, with each key and
value carrying its own type. The accumulator type is whatever the caller seeds
and returns.

```ts
import { reduce } from "@untheme/common";

reduce(tokens, (acc, key) => acc + key.length, 0);
```

### `map(obj, fn)`

Maps every value through the callback, preserving the object's keys. The
callback sees the union of value types, not the type of the specific key.

```ts
import { map } from "@untheme/common";

map({ a: 1, b: 2 }, (value) => String(value)); // { a: string, b: string }
```

### `remap(obj, fn)`

Rebuilds an object into an explicitly named result shape: same keys, each
value produced by the callback. Unlike `map`, the result type is given
explicitly as `remap<Source, Result>(obj, fn)`, so the value type can vary per
key. The signature alone doesn't tie a key to its own slot in `Result` —
write the callback as a generic function over the key to get that pairing
checked.

```ts
import { keys, remap } from "@untheme/common";

const source = { mode: { light: 1, dark: 2 }, density: { compact: 3 } };
type Names = {
  [K in keyof typeof source]: (keyof (typeof source)[K] & string)[];
};

const names = <K extends keyof typeof source & string>(
  value: (typeof source)[K],
): (keyof (typeof source)[K] & string)[] => keys(value);

remap<typeof source, Names>(source, names);
// { mode: ["light", "dark"], density: ["compact"] }
```

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime validation.
- [`@untheme/utils`](../utils) — structural helpers for untheme's theme shape.
