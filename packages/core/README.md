# @untheme/core

The runtime theme service of untheme. The service reads, resolves, and changes tokens in a state container that the caller owns.

[`@untheme/schema`](../schema) has the token contract and the runtime guards. The [`untheme`](../untheme) package re-exports `@untheme/core` and `@untheme/schema`.

## Install

```sh
pnpm add @untheme/core
```

## The token model

A theme is a flat map of tokens. Each token has a `$type` and a `$value`. A contract can declare **modifiers**. A modifier is an independent axis, such as color scheme or density. Each modifier has named **contexts** that override tokens. An **input** selects one context for each modifier.

A read of a token has four layers in this order:

1. The base `$value`.
2. The patch: an applied layer, merged updates, or both.
3. The selected context of each modifier, in the `order` of the contract.

## Usage

```ts
import { makeUntheme } from "@untheme/core";
import type { Contract } from "./untheme/config.mjs";

const ut = makeUntheme<Contract>(theme, {
  patch: {},
  input: { color: "dark" },
});

ut.resolve("primary"); // follows the alias chain to a raw value
ut.swap("color", "light"); // selects the light context of the color modifier
ut.update({ tokens: { background: "blue" } }); // merges a patch into the stored patch

ut.apply(midnight); // stores the layer; the active theme is the base with midnight merged in
ut.create(draftLayer); // checks a layer from outside against the contract
ut.theme(); // the active theme
```

The service has one base theme and one patch. `apply` stores a layer that the caller supplies as the patch. The caller decides where the layers come from. A layer can come from an import, a lazy load, or an API. [`@untheme/kit`](../kit) builds layers from DTCG JSON.

The kit also builds the base theme. Its `config` module exports the base `theme`, the starting `input`, and the `Contract` type. The `Contract` type names the tokens and the modifiers. Use it as `makeUntheme<Contract>(config.theme, { patch: {}, input: config.input })`. The `Contract` type gives autocomplete for token names, modifiers, and contexts. The default type argument is the root `Template` type.

## The state container

The service reads and writes the `config` container. The container holds what changed from the base theme: the `patch` and the `input`. The base theme is not in the container. A container with an empty patch is the base theme at the selection. The caller can pass a plain object for tests and Node. The caller can pass a reactive proxy, for example in Vue, to track each read and write.

The service replaces each member of the container as a whole. It merges the base theme and the patch once for each patch object. Change the patch with `apply` or `update`.

## The service

`makeUntheme<T>(theme, config, options?)` returns an `Untheme<T>`. The function copies the base theme and checks it against its own contract. `options` has `get` and `set` middleware for each field of the container.

- `config`: the state container with `patch` and `input`.
- `schema`: the guards for the token contract, from [`defineSchema`](../schema). `schema.base` is the base theme.
- `theme()`: returns the active theme: the base theme with the patch merged in.
- `modifiers()`: returns the modifiers of the contract in composition order.
- `contexts(modifier)`: returns the context names of a modifier.
- `tokens(input?)`: returns the flat token map for a selection. The default selection is the active one. `config.input` stays the same.
- `get(token)`: returns the binding of a token as an alias name or a raw value.
- `resolve(token)`: returns the value of a token with no references. The function follows a reference that is the whole value. It also replaces references in composite values. Throws `CircularAliasError` when the references form a loop.
- `swap(modifier, context)`: selects a context for a modifier.
- `delta()`: returns the difference between the baseline and the active theme. The result is a patch.
- `update(patch)`: merges a patch into the stored patch. An identity or an order in the patch replaces the stored one. Throws `InvalidPatchError` when the patch violates the contract.
- `apply(layer)`: stores a copy of the layer as the patch. Throws `InvalidLayerError` when the layer violates the contract.
- `create(layer)`: checks a layer against the contract and returns the layer. The active theme stays the same. Throws `InvalidLayerError` when the layer violates the contract.
- `extract(id, name)`: returns a copy of the active theme with a new identity.

## Baselines

The base theme is the baseline. `apply` stores a layer, and the active theme is the baseline with the layer merged in. Each active theme has the full token set. `delta()` compares the active theme with the baseline.

`extract(id, name)` gives the active theme as a theme with a new identity.

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
