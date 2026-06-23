# @untheme/core

Runtime theme service for the untheme design token system.

Provides the service that reads, resolves, and mutates tokens over a caller-owned state container. The token contract and its runtime guards live in [`@untheme/schema`](../schema); most apps depend on both transitively through the [`untheme`](../untheme) umbrella package.

## Token tiers

untheme models tokens in three tiers:

- **Reference** — raw values with no semantic meaning (`"#6366f1"`, `"16px"`).
- **System** — semantic names aliasing reference tokens, per color mode (`background` → `white` in light, `black` in dark).
- **Role** — component-level aliases pointing at a reference or system token (`primary` → `foreground`).

## Usage

```ts
import { defineUntheme } from "@untheme/core";

const ut = defineUntheme({ mode: "dark", theme });

ut.resolve("primary"); // follow the alias chain to a raw value
ut.set("background", "blue"); // tier-aware mutation, active mode only
ut.config.mode = "light"; // switch modes

ut.dirty(); // true — bindings deviate from the theme's pristine state
ut.reset(); // back to the pristine state
```

Presets built with [`@untheme/kit`](../kit) produce the config for you: `defineUntheme(preset.use("dark"))`.

## The state container

The service is pure behavior: every read and write goes through `config`, the caller-owned container holding the active `theme` and `mode`. Pass a plain object for inert state (tests, node), or a reactive proxy (Vue) to have every service read and write tracked — reactivity threads through property access on the container, never through the service itself.

## The service

`defineUntheme(config, themes?)` returns an `Untheme<T>`:

- `config` — the caller-owned container; the single place state is read or written raw.
- `themes` — the registry of applicable theme layers handed to `defineUntheme` (optional second argument; defaults to empty).
- `schema` — guard vocabulary for the theme's token contract, from [`defineSchema`](../schema).
- `tokens(mode?)` — the flat token map for a mode (default: the active one), without touching `config.mode`.
- `get(token)` — the token's current binding (alias name or raw value), unresolved.
- `resolve(token)` — recursively follows the alias chain to a raw value; throws `CircularAliasError` on a looping chain.
- `set(token, value)` — guarded single-token write: roles take aliases, system tokens take references (current mode only), references take containment-safe values. Invalid writes are silent no-ops.
- `update(patch)` — merges a patch of token overrides; theme identity is unchanged. Throws `InvalidPatchError` outside the contract.
- `apply(layer)` — becomes that theme: the layer resolved against the baseline, cached as that id's pristine state. Throws `InvalidLayerError` outside the contract.
- `create(layer)` — resolves a layer against the baseline into a complete, detached theme; the active theme is untouched. Throws `InvalidLayerError` outside the contract.
- `extract(id, name)` — snapshots the active theme, including unsaved edits, as a detached theme under a new identity.
- `dirty()` — whether any active binding deviates from the active theme's pristine state.
- `reset()` — restores the active theme to its pristine state, discarding edits made since it was applied.

## Baselines

The service keeps a snapshot of the theme it was created with — the baseline — plus a per-id cache of every applied theme's pristine state. `apply` and `create` resolve layers against the baseline, so every theme carries the full token set; `dirty` (powered by [`diff`](../utils)) and `reset` work against the active id's cache entry, so unsaved experiments (`set`, `update`) are detectable and revertible per theme, and never leak into derived ones.

## Errors

Every input boundary validates against the [`@untheme/schema`](../schema) guards and throws a semantic error — all subclasses of `UnthemeError`, so one `catch` covers them:

- `InvalidThemeError` — the theme handed to `defineUntheme` violates its own contract.
- `InvalidLayerError` — a layer (registry entry, `apply`, `create`) steps outside the contract.
- `InvalidPatchError` — a patch handed to `update` steps outside the contract.
- `CircularAliasError` — `resolve` hit an alias chain that loops back on itself.

`set` is the deliberate exception: as the hot-path interactive write it validates with the same guards but treats invalid writes as silent no-ops rather than throwing.

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime guards.
- [`@untheme/kit`](../kit) — authoring tool for reusable presets.
- [`untheme`](../untheme) — umbrella package re-exporting core and schema.
