import type {
  Binding,
  Context,
  Input,
  Layer,
  Modifier,
  Open,
  Patch,
  Schema,
  Theme,
  Token,
  Type,
  Values,
} from "@untheme/schema";
import type { Diff } from "@untheme/utils";
import type { Config, Options, Untheme } from "./types";

import { copy, map, record } from "objectively";
import { defineSchema } from "@untheme/schema";
import { clone, diff, merge } from "@untheme/utils";
import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownModifierError,
  reframe,
} from "./error";

/**
 * Makes an {@link Untheme} service over a base theme and a state container.
 * The base theme is the contract and the baseline. The container holds the
 * patch and the selection. The service reads and writes the container through
 * the `options` middleware.
 *
 * A read gives the base tokens, then the patch, then the selected context of
 * each modifier in `order`.
 *
 * @param base - The base theme. The service copies it and checks the copy
 * against its own contract.
 * @param config - The state container.
 * @param options - The middleware for reads and writes of `config`.
 * @returns The service.
 * @throws InvalidThemeError when the base theme or the selection violates the contract.
 */
export const makeUntheme = <T extends Theme<T>>(
  base: T,
  config: Config<T>,
  options: Options<T> = {},
): Untheme<T> => {
  /**
   * The active state. A read gets the value from the container and passes it
   * to the matching `options.get` middleware. A write passes the value to the
   * matching `options.set` middleware and stores the result in the container.
   */
  const proxy: Config<T> = {
    get patch() {
      const through = options.get?.config?.patch;
      if (through) {
        return through(config.patch);
      }
      return config.patch;
    },
    set patch(value) {
      const through = options.set?.config?.patch;
      if (through) {
        config.patch = through(value);
        return;
      }
      config.patch = value;
    },
    get input() {
      const through = options.get?.config?.input;
      if (through) {
        return through(config.input);
      }
      return config.input;
    },
    set input(value) {
      const through = options.set?.config?.input;
      if (through) {
        config.input = through(value);
        return;
      }
      config.input = value;
    },
  };

  /**
   * The schema of the base theme. `schema.base` is the copy of the base theme.
   */
  const schema: Schema<T> = reframe(InvalidThemeError, () =>
    defineSchema(clone(base)),
  );

  // Checks that the initial selection names a context for each modifier.
  reframe(InvalidThemeError, () => schema.assert.input(proxy.input));

  /**
   * Returns the active theme: the base theme with the patch merged in. Each
   * call returns a new object.
   */
  const theme = (): T => merge<T>(schema.base, proxy.patch);

  /**
   * Returns the composition order: the order of the patch when it has one,
   * else the order of the base theme.
   */
  const order = (): Modifier<T>[] => proxy.patch.order ?? schema.base.order;

  /**
   * Returns the flat token map for a selection. The default selection is the
   * active one. The map binds each token to its base `$value`, then adds the
   * patch tokens, then adds the selected context of each modifier in `order`.
   * At each context, the patch overrides come after the base overrides. The
   * function reads the base theme and the patch as they are. It does not
   * merge them.
   */
  const tokens = (
    input: Input<T> = proxy.input,
  ): { [K in Token<T>]: Binding } => {
    const base = schema.base;
    const patch = proxy.patch;
    const flat = map(base.tokens, (slot) => slot.$value);
    Object.assign(flat, patch.tokens);
    for (const modifier of order()) {
      const context = input[modifier];
      Object.assign(
        flat,
        base.modifiers[modifier]?.[context],
        patch.modifiers?.[modifier]?.[context],
      );
    }
    return flat;
  };

  /**
   * Returns the binding of a token for the active selection. The function
   * checks the selected context of each modifier in reverse `order`, in the
   * patch and then in the base theme. Then it checks the patch tokens. Then it
   * checks the base slot. The first layer that binds the token gives the
   * result. This order gives the same result as {@link tokens}. The function
   * does not merge the base theme and the patch.
   */
  const get = (token: Token<T>): Binding => {
    const base = schema.base;
    const patch = proxy.patch;
    const input = proxy.input;
    for (const modifier of [...order()].reverse()) {
      const context = input[modifier];
      const bound =
        patch.modifiers?.[modifier]?.[context]?.[token] ??
        base.modifiers[modifier]?.[context]?.[token];
      if (bound !== undefined) {
        return bound;
      }
    }

    return patch.tokens?.[token] ?? base.tokens[token].$value;
  };

  /**
   * Replaces each reference in a value with the resolved value of its target.
   * The function follows a reference that is the whole value. It also replaces
   * references in the members of arrays and records. `chain` holds the tokens
   * that the current branch already resolves.
   */
  const substitute = (value: unknown, chain: Set<Token<T>>): unknown => {
    if (schema.check.reference(value)) {
      const inner = value.slice(1, -1);
      if (schema.check.token(inner)) {
        return follow(inner, chain);
      }
    }
    if (Array.isArray(value)) {
      return value.map((entry) => substitute(entry, chain));
    }
    if (record(value)) {
      return map(value, (entry) => substitute(entry, chain));
    }
    return value;
  };

  /**
   * Resolves the binding of a token. Each step adds the token to a copy of
   * `chain`. The function throws {@link CircularAliasError} when a chain
   * returns to a token that it already holds.
   */
  const follow = (token: Token<T>, chain: Set<Token<T>>): unknown => {
    if (chain.has(token)) {
      throw new CircularAliasError([...chain, token]);
    }
    return substitute(get(token), new Set(chain).add(token));
  };

  /**
   * Returns the value of a token for the active selection, with no references
   * at any depth. The function parses the result with `parse.value`. It throws
   * the schema error for a token outside the contract.
   */
  const resolve = (token: Token<T>): Values<Open>[Type] => {
    return schema.parse.value(follow(token, new Set()));
  };

  /**
   * Returns the modifiers of the contract in composition order.
   */
  const modifiers = () => [...order()];

  /**
   * Returns the context names of a modifier. The names come from the base
   * theme, because a patch cannot add a context. Throws
   * {@link UnknownModifierError} when the contract has no modifier with that
   * name.
   */
  const contexts = (modifier: Modifier<T>): string[] => {
    const axis = schema.base.modifiers[modifier];
    if (!axis) {
      throw new UnknownModifierError(modifier);
    }
    return Object.keys(axis);
  };

  /**
   * Selects a context for a modifier. The function replaces the selection
   * object. Throws {@link InvalidThemeError} when the context is not a
   * context of the modifier.
   */
  const swap = <M extends Modifier<T>, C extends Context<T, M>>(
    modifier: M,
    context: C,
  ) => {
    const input: Input<T> = { ...proxy.input, [modifier]: context };
    reframe(InvalidThemeError, () => schema.assert.input(input));
    proxy.input = input;
  };

  /**
   * Merges a patch into the stored patch. The new stored patch is the
   * difference between the base theme and the active theme with the patch
   * merged in. An identity or an order of the patch replaces the stored one.
   * Throws {@link InvalidPatchError} when the patch violates the contract.
   */
  const update = (patch: Patch<T>) => {
    reframe(InvalidPatchError, () => schema.assert.patch(patch));
    const next = merge<T>(theme(), patch);
    proxy.patch = { ...proxy.patch, ...patch, ...diff<T>(schema.base, next) };
  };

  /**
   * Stores a copy of a layer as the patch. The active theme becomes the base
   * theme with the layer merged in. Throws {@link InvalidLayerError} when the
   * layer violates the contract.
   */
  const apply = (layer: Layer<T>) => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    proxy.patch = copy(layer);
  };

  /**
   * Checks a layer against the contract and returns the layer. Use the
   * function on a layer from outside, before {@link apply}. The active theme
   * stays the same. Throws {@link InvalidLayerError} when the layer violates
   * the contract.
   */
  const create = (layer: Layer<T>): Layer<T> => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    return layer;
  };

  /**
   * Returns a copy of the active theme with a new `id` and `name`. Throws
   * {@link InvalidThemeError} when the new identity makes the theme invalid.
   */
  const extract = (id: string, name: string): Theme<T> => {
    const snapshot = merge<T>(theme(), { id, name });
    reframe(InvalidThemeError, () => schema.assert.theme(snapshot));
    return snapshot;
  };

  /**
   * Returns the difference between the base theme and the active theme. The
   * result is a patch with each binding that `update` or `apply` changed. The
   * function ignores the identity.
   */
  const delta = (): Diff<T> => {
    return diff<T>(schema.base, theme());
  };

  return {
    config: proxy,
    schema,
    theme,
    modifiers,
    contexts,
    tokens,
    get,
    resolve,
    swap,
    delta,
    update,
    apply,
    create,
    extract,
  };
};
