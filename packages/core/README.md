# @untheme/core

Core types and runtime for the untheme design token system.

Defines the token contract and provides the runtime instance that resolves, mutates, and reads tokens. Most apps depend on this transitively through the [`untheme`](../untheme) umbrella package.

## Token tiers

untheme models tokens in three tiers:

- **Reference** — raw values with no semantic meaning (`"#6366f1"`, `"16px"`).
- **System** — semantic names mapped to reference tokens, per color mode (`primary` → `indigo` in light, `violet` in dark).
- **Role** — component-level aliases pointing at a reference or system token (`button-bg` → `primary`).

## Exports

### `Theme<Ref, Sys, Role>`

The theme contract: `reference` values, per-mode `modes` mappings, and `roles` aliases, parameterized by the token names available at each tier.

### `defineUntheme(theme, mode)`

Creates a runtime [`Untheme`](#unthemeref-sys-role) instance from a theme definition and an initial color mode.

```ts
import { defineUntheme } from "@untheme/core";

const ut = defineUntheme(theme, "dark");

ut.tokens; // flat record of all tokens resolved for the active mode
ut.resolve("button-bg"); // follow the alias chain to a raw value
ut.update("primary", "violet"); // tier-aware mutation
ut.mode = "light"; // switch modes
```

### `Untheme<Ref, Sys, Role>`

The runtime instance: token access (`tokens`, `resolve`), tier-aware mutation (`update`), the active `mode`, and the `isRef`/`isSys`/`isRole`/`isToken` guards.

### `TokenValue<Ref, Sys, Role, T>`

Resolves the value type a token accepts based on its tier (raw string for reference, an alias for system/role).

### `ColorMode`

Union type: `"light" | "dark"`.

## Related

- [`@untheme/kit`](../kit) — authoring tool for reusable presets.
- [`untheme`](../untheme) — umbrella package re-exporting core, plus `untheme/css`.
