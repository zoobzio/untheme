# @untheme/core

Runtime theme service for the untheme design token system.

Provides the service that reads, resolves, and mutates tokens over a caller-owned state container. The token contract and its runtime guards live in [`@untheme/schema`](../schema); most apps depend on both transitively through the [`untheme`](../untheme) umbrella package.

## The token model

A theme is a flat map of tokens, each holding a `$type` and `$value`. On top of the base tokens, the contract declares any number of **modifiers** — independent axes like color scheme or density — each offering named **contexts** that override tokens for that axis. An **input** selects one context per modifier. Reading a token composes three layers in order: the base `$value`, then the selected context of each modifier (in the contract's `order`), then the user override last.

## Usage

```ts
import { defineUntheme } from "@untheme/core";

const ut = defineUntheme({ theme, input: { color: "dark" }, override: {} });

ut.resolve("primary"); // follow the alias chain to a raw value
ut.set("background", "blue"); // write to the override layer
ut.swap("color", "light"); // switch the color modifier's context

ut.dirty(); // true — the override holds edits
ut.reset(); // clears the override

ut.apply(midnight); // become another theme: the layer over the baseline
ut.create(draftLayer); // validate a runtime-built layer against the contract
```

The service holds no theme collection: it knows one active theme at a time, and `apply` switches between complete layers the caller supplies. Where alternative themes live — statically imported, lazy-loaded, fetched from an API — is the caller's concern, which keeps every theme except the active one out of the running state.

Presets built with [`@untheme/kit`](../kit) produce the config for you: `defineUntheme(preset.use({ color: "dark" }))`. A `configure`-widened preset's theme is machine-built rather than authored, so it boots through the factory instead: `makeUntheme(app.use({ color: "dark" }))` — the same service, accepting any complete theme of a contract.

## The state container

The service is pure behavior: every read and write goes through `config`, the caller-owned container holding the active `theme`, the `input` (one selected context per modifier), and the `override` layer that `set` populates. Pass a plain object for inert state (tests, node), or a reactive proxy (Vue) to have every service read and write tracked — reactivity threads through property access on the container, never through the service itself.

## The service

`defineUntheme(config, options?)` returns an `Untheme<T>`:

- `config` — the caller-owned container: `theme`, `input`, `override`.
- `schema` — guard vocabulary for the theme's token contract, from [`defineSchema`](../schema).
- `modifiers()` — the modifier axes the contract declares, in composition order.
- `contexts(modifier)` — the context names a modifier offers.
- `tokens(input?)` — the flat token map for a selection (default: the active one): every token's effective binding, override included, without touching `config.input`.
- `get(token)` — a token's effective binding (alias name or raw value), unresolved.
- `resolve(token)` — a token's fully dereferenced value: a whole-value reference is followed to its target, and references nested inside composite values resolve in place too. Throws `CircularAliasError` on a looping chain.
- `swap(modifier, context)` — selects a context for a modifier.
- `set(token, value)` — writes a token into the user override layer; validated against the token's declared type. A write outside the contract — an unknown token, or a value invalid for that token's type — is a silent no-op.
- `delta()` — the drift from the baseline as a re-appliable patch: the active theme with the override baked in, diffed against the baseline.
- `dirty()` — whether the user override holds any edits.
- `reset()` — clears the user override.
- `update(patch)` — merges a patch into the active theme; identity and the override are unchanged. Throws `InvalidPatchError` outside the contract.
- `apply(layer)` — becomes that theme: the layer resolved against the baseline, and clears the override. Throws `InvalidLayerError` outside the contract.
- `create(layer)` — validates a layer against the contract and returns it unchanged; the active theme is untouched. Throws `InvalidLayerError` outside the contract.
- `extract(id, name)` — snapshots the active theme, including unsaved edits, as a detached theme under a new identity.

## Baselines

The service keeps exactly one baseline: a snapshot of the theme it was constructed with, captured once at creation. `apply` resolves layers against this baseline, so every theme adopted this way carries the full token set, and `delta()` diffs the active theme against it. `dirty()` and `reset()` work directly on the user override — `dirty()` is true whenever the override holds any keys, `reset()` clears it — so edits made since the last `apply` are detectable and revertible.

## Errors

Every boundary throws a semantic error rather than a bare `Error`, in two families.

**Contract violations** — subclasses of [`SchemaError`](../schema), carrying the underlying `issues` so callers can react to each failure:

- `InvalidThemeError` — the baseline theme handed to `defineUntheme` violates its own contract.
- `InvalidLayerError` — a layer handed to `apply` or `create` steps outside the contract.
- `InvalidPatchError` — a patch handed to `update` steps outside the contract.

**Resolution failures** — subclasses of plain `Error`, carrying the offending lookup:

- `UnknownModifierError` — `contexts` was handed a name the contract declares no `modifier` under.
- `CircularAliasError` — `resolve` hit an alias `chain` that loops back on itself; detected by tracking visited tokens, so the stack never overflows.

`set` is the deliberate exception: as the hot-path interactive write it validates with the same guards but treats invalid writes as silent no-ops rather than throwing.

## Related

- [`@untheme/schema`](../schema) — token contract types and runtime guards.
- [`@untheme/kit`](../kit) — authoring tool for reusable presets.
- [`untheme`](../untheme) — umbrella package re-exporting core and schema.
