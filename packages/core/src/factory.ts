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

import { record, map } from "objectively";
import { defineSchema } from "@untheme/schema";
import { clone, copy, diff, merge } from "@untheme/utils";
import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownModifierError,
  reframe,
} from "./error";

/**
 * Builds the runtime {@link Untheme} service over a state container, for
 * any complete theme of a contract — an authored contract via
 * {@link defineUntheme}, or a machine-built theme (a `configure`-widened
 * preset, a merged theme) whose slot bindings only the runtime schema can
 * rule on. The theme is validated against its own contract up front either
 * way.
 *
 * Every read and write goes through `proxy`, so the caller decides whether
 * state is plain (tests, node) or a reactive proxy (Vue); `options` can
 * intercept and transform each read and write on the way through. Reads resolve
 * the active selection — base tokens overlaid with the selected context of each
 * modifier in `order` — then apply the user override on top. `set` writes only
 * the override; `swap` selects a modifier's context; `update` and `apply`
 * change the definition. Switching theme (`apply`) clears the override.
 *
 * The baseline — a snapshot of the theme at construction — is what `apply`
 * resolves layers against.
 *
 * @param config - The caller-owned container: active theme, selection, override.
 * @param options - Read/write middleware over `config`.
 * @returns An {@link Untheme} service bound to the container.
 * @throws InvalidThemeError when the theme or selection violates the contract.
 */
export const makeUntheme = <T extends Theme<T>>(
  config: Config<T>,
  options: Options<T> = {},
): Untheme<T> => {
  /**
   * The active state, fronted by get/set middleware. Reads pull the raw value
   * from the container and pipe it through the matching `options.get`
   * middleware on the way out; writes pipe the incoming value through
   * `options.set` before storing it. The container stays the source of truth;
   * a missing middleware is a passthrough.
   */
  const proxy: Config<T> = {
    get theme() {
      const through = options.get?.config?.theme;
      if (through) {
        return through(config.theme);
      }
      return config.theme;
    },
    set theme(value) {
      const through = options.set?.config?.theme;
      if (through) {
        config.theme = through(value);
        return;
      }
      config.theme = value;
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
   * Validation derived from the baseline — a complete theme is itself a valid
   * template. The theme is cloned on the way in, so `schema.base` doubles as
   * the detached baseline snapshot the merge and diff paths work from, never a
   * live reference into a reactive container.
   */
  const schema: Schema<T> = reframe(InvalidThemeError, () =>
    defineSchema(clone(proxy.theme)),
  );

  // The seed selection must name a real context for every modifier.
  reframe(InvalidThemeError, () => schema.assert.input(proxy.input));

  /**
   * The flat token map for a selection (default: active): every token bound to
   * its `$value`, overlaid with the selected context of each modifier in
   * `order`, then the user override last.
   */
  const tokens = (
    input: Input<T> = proxy.input,
  ): { [K in Token<T>]: Binding } => {
    const flat = map(proxy.theme.tokens, (slot) => slot.$value);
    for (const modifier of proxy.theme.order) {
      Object.assign(flat, proxy.theme.modifiers[modifier]?.[input[modifier]]);
    }
    Object.assign(flat, proxy.override);
    return flat;
  };

  /**
   * A token's effective binding for the active selection, override included.
   * Layers are probed from the top of the stack down — the user override,
   * then each modifier's selected context in reverse `order`, then the base
   * slot — and the first layer binding the token wins, mirroring the overlay
   * precedence of {@link tokens} without assembling the full map.
   */
  const get = (token: Token<T>): Binding => {
    const override = proxy.override[token];
    if (override !== undefined) {
      return override;
    }

    const theme = proxy.theme;
    const input = proxy.input;
    for (const modifier of [...theme.order].reverse()) {
      const bound = theme.modifiers[modifier]?.[input[modifier]]?.[token];
      if (bound !== undefined) {
        return bound;
      }
    }

    return theme.tokens[token].$value;
  };

  /**
   * Writes a token into the user override layer — the topmost resolution layer,
   * applied over the active selection. The single-entry map is validated as an
   * override, so an unknown token or a value invalid for that token's declared
   * type is a silent no-op. The override holds a detached copy of the value.
   * Tracked by `dirty`, cleared by `reset`.
   */
  const set = (token: Token<T>, value: Binding) => {
    if (!schema.check.overrides({ [token]: value })) {
      return;
    }
    proxy.override = { ...proxy.override, [token]: copy(value) };
  };

  /**
   * Replaces every reference inside a value with its target's dereferenced
   * value: a whole-value reference is followed to its token, and arrays and
   * records are rebuilt member by member so references nested in composite
   * values resolve in place. `chain` carries the tokens already being resolved
   * on this branch.
   */
  const substitute = (value: unknown, chain: Set<Token<T>>): unknown => {
    if (schema.check.reference(value)) {
      const inner = value.slice(1, -1);
      // Re-proves what `check.reference` guaranteed, narrowing the slice.
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
   * Dereferences a token's effective binding. Each hop extends a branch-local
   * copy of `chain`, so sibling references to a shared token never collide,
   * while a chain that loops back on itself throws {@link CircularAliasError}
   * instead of recursing until the call stack overflows.
   */
  const follow = (token: Token<T>, chain: Set<Token<T>>): unknown => {
    if (chain.has(token)) {
      throw new CircularAliasError([...chain, token]);
    }
    return substitute(get(token), new Set(chain).add(token));
  };

  /**
   * A token's fully dereferenced value for the active selection: no references
   * remain at any depth. The result is narrowed through `parse.value`, so
   * resolving a token outside the contract throws the schema's error rather
   * than returning undefined.
   */
  const resolve = (token: Token<T>): Values<Open>[Type] => {
    return schema.parse.value(follow(token, new Set()));
  };

  /**
   * The modifiers (axes) the contract declares, in composition order.
   */
  const modifiers = () => proxy.theme.order;

  /**
   * The context names a modifier offers. Throws {@link UnknownModifierError}
   * when the contract declares no modifier under the name.
   */
  const contexts = (modifier: Modifier<T>): string[] => {
    const axis = proxy.theme.modifiers[modifier];
    if (!axis) {
      throw new UnknownModifierError(modifier);
    }
    return Object.keys(axis);
  };

  /**
   * Selects a context for a modifier, replacing the selection so reactive reads
   * re-resolve. Throws {@link InvalidThemeError} when the context is not one
   * the modifier declares.
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
   * Merges a patch's bindings over the active theme; identity is preserved.
   * Throws {@link InvalidPatchError} when the patch steps outside the
   * contract.
   */
  const update = (patch: Patch<T>) => {
    reframe(InvalidPatchError, () => schema.assert.patch(patch));
    proxy.theme = merge<T>(proxy.theme, patch);
  };

  /**
   * Adopts a layer: becomes that theme — the layer resolved against the
   * baseline — and clears the user override. Throws {@link InvalidLayerError}
   * when the layer steps outside the contract.
   */
  const apply = (layer: Layer<T>) => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    proxy.theme = merge<T>(schema.base, layer);
    proxy.override = {};
  };

  /**
   * Proves a layer against the contract and returns it unchanged — the
   * validation gate for layers that arrive at runtime (fetched from elsewhere,
   * built by a user) before they are handed to {@link apply} or stored by the
   * caller. The active theme is not touched. Throws {@link InvalidLayerError}
   * when the layer steps outside the contract.
   */
  const create = (layer: Layer<T>): Layer<T> => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    return layer;
  };

  /**
   * Snapshots the active theme with the user override baked into its base
   * tokens, as a detached theme under a new identity. The snapshot is
   * returned, not registered. Throws {@link InvalidThemeError} when the
   * identity leaves it invalid.
   */
  const extract = (id: string, name: string): Theme<T> => {
    const snapshot = merge<T>(proxy.theme, {
      id,
      name,
      tokens: proxy.override,
    });
    reframe(InvalidThemeError, () => schema.assert.theme(snapshot));
    return snapshot;
  };

  /**
   * The effective drift from the baseline: the active theme with the user
   * override baked into its tokens, diffed against the baseline. Bindings that
   * still match the baseline drop out, leaving a patch of everything `set` /
   * `update` / `apply` changed. Identity is not compared.
   */
  const delta = (): Diff<T> => {
    return diff<T>(
      schema.base,
      merge<T>(proxy.theme, { tokens: proxy.override }),
    );
  };

  /**
   * Whether the user override holds any edits.
   */
  const dirty = () => Object.keys(proxy.override).length > 0;

  /**
   * Clears the user override, discarding the live edits.
   */
  const reset = () => {
    proxy.override = {};
  };

  return {
    config: proxy,
    schema,
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
