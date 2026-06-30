import type {
  Contract,
  Layer,
  Patch,
  Schema,
  Theme,
  Token,
  Value,
  Binding,
  Modifier,
  Context,
  Input,
} from "@untheme/schema";
import type { Config, Options, Untheme } from "./types";

import { defineSchema } from "@untheme/schema";
import { clone, diff, merge } from "@untheme/utils";
import {
  CircularAliasError,
  InvalidLayerError,
  InvalidPatchError,
  InvalidThemeError,
  UnknownThemeError,
  reframe,
} from "./error";

/**
 * Creates a runtime {@link Untheme} service over a state container.
 *
 * Every read and write goes through `config`, so the caller decides whether
 * state is plain (tests, node) or a reactive proxy (Vue); `options` can
 * intercept and transform each read and write on the way through. Reads resolve
 * the active selection — base tokens overlaid with the selected context of each
 * modifier in `order` — then apply the user override on top. `set` writes only
 * the override; `swap` selects a modifier's context; `update` / `apply` /
 * `select` change the definition. Switching theme (`apply` / `select`) clears
 * the override.
 *
 * The baseline — a snapshot of the theme at construction — is what `apply` and
 * `create` resolve layers against.
 *
 * @param state - The caller-owned container: active theme, selection, override.
 * @param registry - The catalog of switchable layers, validated up front; the
 *   target of `select`, `create`, and `remove`.
 * @param options - Read/write middleware over `config` and `themes`.
 * @returns An {@link Untheme} service bound to the container.
 * @throws InvalidThemeError when the theme or selection violates the contract.
 * @throws InvalidLayerError when a registry layer steps outside the contract.
 */
export const defineUntheme = <
  Tok extends string,
  Mod extends Record<
    string,
    Record<string, Partial<Record<NoInfer<Tok>, `{${Tok}}` | Value>>>
  >,
>(
  state: Config<Contract<Tok, Mod>>,
  registry: Record<string, Layer<Contract<Tok, Mod>>> = {},
  options: Options<Contract<Tok, Mod>> = {},
): Untheme<Contract<Tok, Mod>> => {
  type T = Contract<Tok, Mod>;

  /**
   * The active state, fronted by get/set middleware. Reads pull the raw value
   * from the container and pipe it through the matching `options.get`
   * middleware on the way out; writes pipe the incoming value through
   * `options.set` before storing it. The container stays the source of truth;
   * a missing middleware is a passthrough.
   */
  const config: Config<T> = {
    get theme() {
      const through = options.get?.config?.theme;
      if (through) {
        return through(state.theme);
      }
      return state.theme;
    },
    set theme(value) {
      const through = options.set?.config?.theme;
      if (through) {
        state.theme = through(value);
        return;
      }
      state.theme = value;
    },
    get input() {
      const through = options.get?.config?.input;
      if (through) {
        return through(state.input);
      }
      return state.input;
    },
    set input(value) {
      const through = options.set?.config?.input;
      if (through) {
        state.input = through(value);
        return;
      }
      state.input = value;
    },
    get override() {
      const through = options.get?.config?.override;
      if (through) {
        return through(state.override);
      }
      return state.override;
    },
    set override(value) {
      const through = options.set?.config?.override;
      if (through) {
        state.override = through(value);
        return;
      }
      state.override = value;
    },
  };

  /**
   * The registry, fronted by per-key get/set middleware with the same
   * passthrough semantics as {@link config}. A Proxy rather than fixed properties
   * because `create` and `remove` add and drop keys at runtime; deletes pass
   * straight through to the container.
   */
  const themes: Record<string, Layer<T>> = new Proxy(registry, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      if (typeof key === "string") {
        const through = options.get?.themes?.[key];
        if (through) {
          return through(value);
        }
      }
      return value;
    },
    set(target, key, value, receiver) {
      if (typeof key === "string") {
        const through = options.set?.themes?.[key];
        if (through) {
          return Reflect.set(target, key, through(value), receiver);
        }
      }
      return Reflect.set(target, key, value, receiver);
    },
  });

  /**
   * The baseline: a snapshot of the full theme at creation containing all available tokens.
   */
  const base = clone(config.theme);

  /**
   * Validation derived from the baseline — a complete theme is itself a valid
   * template.
   */
  const schema: Schema<T> = reframe(InvalidThemeError, () =>
    defineSchema(base),
  );

  // The seed selection must name a real context for every modifier.
  reframe(InvalidThemeError, () => schema.assert.input(config.input));

  // Fail fast on a malformed seed registry. This is an early check only —
  // `apply` (and so `select`) still re-validates every layer at the call
  // site, since the registry can be mutated after construction.
  reframe(InvalidLayerError, () => {
    for (const layer of Object.values(themes)) {
      schema.assert.layer(layer);
    }
  });

  /**
   * The flat token map for a selection (default: active): base tokens, then the
   * selected context of each modifier in `order`, then the user override last.
   */
  const tokens = (
    input: Input<T> = config.input,
  ): { [K in Token<T>]: Binding<T> } => {
    const map = { ...config.theme.tokens };
    const modifiers = config.theme.modifiers;
    const selection = input;
    for (const modifier of config.theme.order) {
      Object.assign(map, modifiers[modifier]?.[selection[modifier]]);
    }
    Object.assign(map, config.override);
    return map;
  };

  /**
   * A token's effective binding for the active selection, override included.
   */
  const get = <K extends Token<T>>(token: K): Binding<T> => {
    return tokens()[token];
  };

  /**
   * Writes a token into the user override layer — the topmost resolution layer,
   * applied over the active selection. A write outside the contract is a silent
   * no-op. Tracked by `dirty`, cleared by `reset`.
   */
  const set = <K extends Token<T>>(token: K, value: Binding<T>) => {
    if (!schema.check.token(token) || !schema.check.binding(value)) {
      return;
    }
    config.override = { ...config.override, [token]: value };
  };

  /**
   * Follows a token's reference chain to a literal value. A binding in `{name}`
   * form is a reference; its target is followed until a literal is reached.
   * Visited tokens accumulate in `chain`, so a chain that loops back on itself
   * throws {@link CircularAliasError} instead of recursing until the call stack
   * overflows.
   */
  const resolve = <K extends Token<T>>(
    token: K,
    chain: Set<Token<T>> = new Set(),
  ): string => {
    if (chain.has(token)) {
      throw new CircularAliasError([...chain, token]);
    }
    const binding = get(token);
    if (schema.check.reference(binding)) {
      const inner = binding.slice(1, -1);
      if (schema.check.token(inner)) {
        return resolve(inner, chain.add(token));
      }
    }
    return binding;
  };

  /**
   * The modifiers (axes) the contract declares, in composition order.
   */
  const modifiers = () => config.theme.order;

  /**
   * The context names a modifier offers.
   */
  const contexts = (modifier: Modifier<T>): string[] => {
    return Object.keys(config.theme.modifiers[modifier]);
  };

  /**
   * Selects a context for a modifier, replacing the selection so reactive reads
   * re-resolve.
   */
  const swap = <M extends Modifier<T>, C extends Context<T, M>>(
    modifier: M,
    context: C,
  ) => {
    config.input = { ...config.input, [modifier]: context };
  };

  /**
   * Merges a patch's bindings over the active theme; identity is preserved.
   * Throws {@link InvalidPatchError} when the patch steps outside the
   * contract.
   */
  const update = (patch: Patch<T>) => {
    reframe(InvalidPatchError, () => schema.assert.patch(patch));
    config.theme = merge(config.theme, patch);
  };

  /**
   * Adopts a layer: becomes that theme — the layer resolved against the
   * baseline — and clears the user override. Throws {@link InvalidLayerError}
   * when the layer steps outside the contract.
   */
  const apply = (layer: Layer<T>) => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    config.theme = merge(base, layer);
    config.override = {};
  };

  /**
   * Switches to the registry layer filed under `key`: resolves it from the
   * registry and hands it to {@link apply}, which validates it like any other
   * layer. Throws {@link UnknownThemeError} when no theme is registered under
   * `key`.
   */
  const select = (key: string) => {
    const layer = themes[key];
    if (!layer) {
      throw new UnknownThemeError(key);
    }
    apply(layer);
  };

  /**
   * Resolves a layer against the baseline into a complete theme — the layer's
   * identity and bindings, gaps backfilled from the baseline — and files it in
   * the registry under its id, where {@link select} can switch to it. The
   * active theme is not touched. Throws {@link InvalidLayerError} when the
   * layer steps outside the contract.
   */
  const create = (layer: Layer<T>): Theme<T> => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    const theme = merge(base, layer);
    themes[theme.id] = theme;
    return theme;
  };

  /**
   * Snapshots the active theme with the user override baked into its base
   * tokens, as a detached theme under a new identity. The snapshot is returned,
   * not registered.
   */
  const extract = (id: string, name: string): Theme<T> => {
    return merge(config.theme, { id, name, tokens: config.override });
  };

  /**
   * Drops a theme from the registry by id; a no-op when nothing is filed
   * under it. The active theme is independent of the registry, so removing
   * the live theme's entry leaves it standing — it just can no longer be
   * reached by {@link select}.
   */
  const remove = (id: string) => {
    delete themes[id];
  };

  /**
   * The effective drift from the baseline: the active theme with the user
   * override baked into its tokens, diffed against the baseline. Bindings that
   * still match the baseline drop out, leaving a patch of everything `set` /
   * `update` / `apply` changed. Identity is not compared.
   */
  const delta = (): Patch<T> => {
    return diff(base, merge(config.theme, { tokens: config.override }));
  };

  /**
   * Whether the user override holds any edits.
   */
  const dirty = () => Object.keys(config.override).length > 0;

  /**
   * Clears the user override, discarding the live edits.
   */
  const reset = () => {
    config.override = {};
  };

  return {
    config,
    themes,
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
    select,
    create,
    extract,
    remove,
  };
};
