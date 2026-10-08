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

import { copy, entries, map, record } from "objectively";
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
 * Merges a patch into a layer and returns a new layer. The identity of the
 * layer stays. A token of the patch replaces the same token of the layer. A
 * context override of the patch replaces the same override of the layer. The
 * result holds copies of the values of the patch.
 */
const fold = <T extends Theme<T>>(
  layer: Layer<T>,
  patch: Patch<T>,
): Layer<T> => {
  const next: Layer<T> = { id: layer.id, name: layer.name };
  if (layer.tokens || patch.tokens) {
    next.tokens = { ...layer.tokens, ...copy(patch.tokens ?? {}) };
  }
  if (layer.modifiers || patch.modifiers) {
    const modifiers: Record<string, Record<string, unknown>> = {};
    const own: Record<string, unknown> = layer.modifiers ?? {};
    for (const [modifier, contexts] of entries(own)) {
      modifiers[modifier] = record(contexts) ? { ...contexts } : {};
    }
    const added: Record<string, unknown> = patch.modifiers ?? {};
    for (const [modifier, contexts] of entries(added)) {
      const axis = (modifiers[modifier] ??= {});
      if (!record(contexts)) {
        continue;
      }
      for (const [context, overrides] of entries(contexts)) {
        if (!record(overrides)) {
          continue;
        }
        const current = axis[context];
        axis[context] = {
          ...(record(current) ? current : {}),
          ...copy(overrides),
        };
      }
    }
    next.modifiers = modifiers as Layer<T>["modifiers"];
  }
  if (layer.order) {
    next.order = copy(layer.order);
  }
  return next;
};

/**
 * Makes an {@link Untheme} service over a base theme and a state container.
 * The base theme is the contract and the baseline. The container holds the
 * applied layer, the selection, and the user override. The service reads and
 * writes the container through the `options` middleware.
 *
 * A read gives the base tokens, then the applied layer, then the selected
 * context of each modifier in `order`, then the user override. The service
 * merges the base theme and the layer once for each layer object.
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
    get layer() {
      const through = options.get?.config?.layer;
      if (through) {
        return through(config.layer);
      }
      return config.layer;
    },
    set layer(value) {
      const through = options.set?.config?.layer;
      if (through && value !== undefined) {
        config.layer = through(value);
        return;
      }
      config.layer = value;
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
    get override() {
      const through = options.get?.config?.override;
      if (through) {
        return through(config.override);
      }
      return config.override;
    },
    set override(value) {
      const through = options.set?.config?.override;
      if (through) {
        config.override = through(value);
        return;
      }
      config.override = value;
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
   * The last merge of the base theme and a layer.
   */
  let merged: { layer: Layer<T>; theme: T } | undefined;

  /**
   * Returns the active theme. With no layer, the result is the base theme.
   * With a layer, the result is the base theme with the layer merged in. The
   * function merges once for each layer object.
   */
  const theme = (): T => {
    const layer = proxy.layer;
    if (layer === undefined) {
      return schema.base;
    }
    if (merged === undefined || merged.layer !== layer) {
      merged = { layer, theme: merge<T>(schema.base, layer) as T };
    }
    return merged.theme;
  };

  /**
   * Returns the flat token map for a selection. The default selection is the
   * active one. The map binds each token to its `$value`, then adds the
   * selected context of each modifier in `order`, then adds the user override.
   */
  const tokens = (
    input: Input<T> = proxy.input,
  ): { [K in Token<T>]: Binding } => {
    const active = theme();
    const flat = map(active.tokens, (slot) => slot.$value);
    for (const modifier of active.order) {
      Object.assign(flat, active.modifiers[modifier]?.[input[modifier]]);
    }
    Object.assign(flat, proxy.override);
    return flat;
  };

  /**
   * Returns the binding of a token for the active selection. The function
   * checks the user override first. Then it checks the selected context of
   * each modifier in reverse `order`. Then it checks the base slot. The first
   * layer that binds the token gives the result. This order gives the same
   * result as {@link tokens}.
   */
  const get = (token: Token<T>): Binding => {
    const override = proxy.override[token];
    if (override !== undefined) {
      return override;
    }

    const active = theme();
    const input = proxy.input;
    for (const modifier of [...active.order].reverse()) {
      const bound = active.modifiers[modifier]?.[input[modifier]]?.[token];
      if (bound !== undefined) {
        return bound;
      }
    }

    return active.tokens[token].$value;
  };

  /**
   * Writes a token to the user override. The function checks the entry as an
   * override. If the token is unknown, or the value is not valid for the type
   * of the token, the function does nothing. The override holds a copy of the
   * value. `dirty` reports the override and `reset` clears it.
   */
  const set = (token: Token<T>, value: Binding) => {
    if (!schema.check.overrides({ [token]: value })) {
      return;
    }
    proxy.override = { ...proxy.override, [token]: copy(value) };
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
  const modifiers = () => theme().order;

  /**
   * Returns the context names of a modifier. Throws {@link UnknownModifierError}
   * when the contract has no modifier with that name.
   */
  const contexts = (modifier: Modifier<T>): string[] => {
    const axis = theme().modifiers[modifier];
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
   * Merges the bindings of a patch into the applied layer. With no layer, the
   * patch becomes a layer with the identity of the base theme. The override
   * stays the same. Throws {@link InvalidPatchError} when the patch violates
   * the contract.
   */
  const update = (patch: Patch<T>) => {
    reframe(InvalidPatchError, () => schema.assert.patch(patch));
    const current = proxy.layer ?? {
      id: schema.base.id,
      name: schema.base.name,
    };
    proxy.layer = fold<T>(current, patch);
  };

  /**
   * Stores a copy of a layer as the applied layer and clears the user
   * override. Throws {@link InvalidLayerError} when the layer violates the
   * contract.
   */
  const apply = (layer: Layer<T>) => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    proxy.layer = copy(layer);
    proxy.override = {};
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
   * Returns a copy of the active theme with a new `id` and `name`. The copy
   * has the user override in its base tokens. Throws {@link InvalidThemeError}
   * when the new identity makes the theme invalid.
   */
  const extract = (id: string, name: string): Theme<T> => {
    const snapshot = merge<T>(theme(), {
      id,
      name,
      tokens: proxy.override,
    });
    reframe(InvalidThemeError, () => schema.assert.theme(snapshot));
    return snapshot;
  };

  /**
   * Returns the difference between the base theme and the active theme with
   * the user override in its tokens. The result is a patch with each binding
   * that `set`, `update`, or `apply` changed. The function ignores the
   * identity.
   */
  const delta = (): Diff<T> => {
    return diff<T>(schema.base, merge<T>(theme(), { tokens: proxy.override }));
  };

  /**
   * Returns `true` when the user override has an entry.
   */
  const dirty = () => Object.keys(proxy.override).length > 0;

  /**
   * Removes all entries from the user override.
   */
  const reset = () => {
    proxy.override = {};
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
    set,
    delta,
    dirty,
    reset,
    update,
    apply,
    create,
    extract,
  };
};
