# @untheme/core

The runtime theme service of untheme. The service reads, resolves, and changes tokens in a state container that the caller owns.

[`@untheme/schema`](../schema) has the token contract and the runtime guards. The [`untheme`](../untheme) package re-exports `@untheme/core` and `@untheme/schema`.

## Install

```sh
pnpm add @untheme/core
```

## The token model

A theme is a flat map of tokens. Each token has a `$type` and a `$value`. A contract can declare **modifiers**. A modifier is an independent axis, such as color scheme or density. Each modifier has named **contexts** that override tokens. An **input** selects one context for each modifier.

A read of a token has three layers in this order:

1. The base `$value`.
2. The selected context of each modifier, in the `order` of the contract.
3. The user override.

## Usage

```ts
import { makeUntheme } from "@untheme/core";
import type { Contract } from "./untheme/config.mjs";

const ut = makeUntheme<Contract>({
  theme,
  input: { color: "dark" },
  override: {},
});

ut.resolve("primary"); // follows the alias chain to a raw value
ut.set("background", "blue"); // writes to the override
ut.swap("color", "light"); // selects the light context of the color modifier

ut.dirty(); // true when the override has an entry
ut.reset(); // removes all entries from the override

ut.apply(midnight); // makes the active theme from the layer and the baseline
ut.create(draftLayer); // checks a layer from outside against the contract
```

The service has one active theme. `apply` changes the active theme to a complete layer that the caller supplies. The caller decides where the layers come from. A layer can come from an import, a lazy load, or an API.

[`@untheme/kit`](../kit) builds the theme from DTCG JSON. Its `config` module exports the base `theme`, the starting `input`, and the `Contract` type. The `Contract` type names the tokens and the modifiers. `useUnthemeConfig(config)` from `untheme/config` makes a state container from the config. Use it as `makeUntheme<Contract>(useUnthemeConfig(config))`. The `Contract` type gives autocomplete for token names, modifiers, and contexts. The default type argument is the root `Template` type.

## The state container

The service reads and writes the `config` container. The container has the active `theme`, the `input`, and the `override` that `set` writes. The caller can pass a plain object for tests and Node. The caller can pass a reactive proxy, for example in Vue, to track each read and write.

## The service

`makeUntheme<T>(config, options?)` returns an `Untheme<T>`. The function checks the theme against its own contract. `options` has `get` and `set` middleware for each field of the container.

- `config`: the state container with `theme`, `input`, and `override`.
- `schema`: the guards for the token contract, from [`defineSchema`](../schema).
- `modifiers()`: returns the modifiers of the contract in composition order.
- `contexts(modifier)`: returns the context names of a modifier.
- `tokens(input?)`: returns the flat token map for a selection. The default selection is the active one. Each token has its binding with the override. `config.input` stays the same.
- `get(token)`: returns the binding of a token as an alias name or a raw value.
- `resolve(token)`: returns the value of a token with no references. The function follows a reference that is the whole value. It also replaces references in composite values. Throws `CircularAliasError` when the references form a loop.
- `swap(modifier, context)`: selects a context for a modifier.
- `set(token, value)`: writes a token to the user override. The function checks the value against the type of the token. If the token is unknown, or the value is not valid for the type, the function does nothing.
- `delta()`: returns the difference between the baseline and the active theme with the override in its tokens. The result is a patch.
- `dirty()`: returns `true` when the user override has an entry.
- `reset()`: removes all entries from the user override.
- `update(patch)`: merges a patch into the active theme. The identity and the override stay the same. Throws `InvalidPatchError` when the patch violates the contract.
- `apply(layer)`: makes the active theme from the layer and the baseline, and clears the override. Throws `InvalidLayerError` when the layer violates the contract.
- `create(layer)`: checks a layer against the contract and returns the layer. The active theme stays the same. Throws `InvalidLayerError` when the layer violates the contract.
- `extract(id, name)`: returns a copy of the active theme with a new identity. The copy has the unsaved edits of the override.

## Baselines

The baseline is a copy of the theme from the time of construction. `apply` resolves layers against the baseline. Each adopted theme has the full token set. `delta()` compares the active theme with the baseline. `dirty()` reports the user override and `reset()` clears it. Use them to find and revert the edits since the last `apply`.

## Errors

Each error has a name that tells which check failed. There are two groups.

**Contract violations** extend [`SchemaError`](../schema). Each error has the `issues` list.

- `InvalidThemeError`: the base theme that `makeUntheme` receives violates its own contract.
- `InvalidLayerError`: a layer that `apply` or `create` receives violates the contract.
- `InvalidPatchError`: a patch that `update` receives violates the contract.

**Resolution failures** extend `Error`. Each error holds the failed lookup.

- `UnknownModifierError`: `contexts` receives a name that is not a modifier of the contract. The `modifier` property holds the name.
- `CircularAliasError`: `resolve` finds an alias chain that returns to a token in the chain. The `chain` property holds the token names.

`set` checks a write with the same guards. It ignores a write that is not valid.

## Related

- [`@untheme/schema`](../schema): token contract types and runtime guards.
- [`@untheme/kit`](../kit): builds the theme from DTCG JSON.
- [`untheme`](../untheme): the umbrella package that re-exports core and schema.
