import type {
  Contract,
  Layer,
  Mode,
  Patch,
  Schema,
  Theme,
  Token,
  Tokens,
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
 * The service is pure behavior: every read and write goes through `config`,
 * so the caller decides whether state is plain (tests, node) or a reactive
 * proxy (Vue) — reactivity threads through property access on the container,
 * never through the service itself.
 *
 * Alongside the live state, the service keeps the creation baseline plus a
 * per-id cache of every applied theme's pristine state: `create` resolves
 * against the baseline, while `dirty` and `reset` work against the active
 * id's cache entry.
 *
 * The `themes` argument is a mutable catalog of switchable layers: `select`
 * switches to an entry by key, `create` files resolved themes into it, and
 * `remove` drops them.
 *
 * Inputs are validated against the contract at every boundary; violations
 * throw from the semantic error stable in `error.ts`, never a bare `Error`.
 *
 * @param config - The caller-owned container holding the active theme and mode.
 * @param themes - The catalog of applicable layers, validated up front; the
 *   target of `select`, `create`, and `remove`.
 * @param options - Read/write middleware: `get`/`set` transform values as they
 *   pass in and out of `config` and `themes`.
 * @returns An {@link Untheme} service bound to the container.
 * @throws InvalidThemeError when the theme violates its own contract.
 * @throws InvalidLayerError when a registry layer steps outside the contract.
 */
export const defineUntheme = <
  Ref extends string,
  Sys extends string,
  Rol extends string,
>(
  state: Config<Contract<Ref, Sys, Rol>>,
  registry: Record<string, Layer<Contract<Ref, Sys, Rol>>> = {},
  options: Options<Contract<Ref, Sys, Rol>> = {},
): Untheme<Contract<Ref, Sys, Rol>> => {
  type T = Contract<Ref, Sys, Rol>;

  /**
   * The active state, fronted by get/set middleware. Reads pull the raw value
   * from the container and pipe it through the matching `options.get`
   * middleware on the way out; writes pipe the incoming value through
   * `options.set` before storing it. The container stays the source of truth;
   * a missing middleware is a passthrough.
   */
  const config: Config<T> = {
    get mode() {
      const through = options.get?.config?.mode;
      if (through) {
        return through(state.mode);
      }
      return state.mode;
    },
    set mode(value) {
      const through = options.set?.config?.mode;
      if (through) {
        state.mode = through(value);
        return;
      }
      state.mode = value;
    },
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
   * Per-id baselines: each applied theme's pristine state, keyed by id.
   * `dirty` and `reset` work against the active id's entry.
   */
  const cache: Record<string, Theme<T>> = {
    [base.id]: clone(base),
  };

  /**
   * Guards derived from the baseline — a complete theme is itself a valid
   * template.
   */
  const schema: Schema<T> = reframe(InvalidThemeError, () =>
    defineSchema(base),
  );

  // Fail fast on a malformed seed registry. This is an early check only —
  // `apply` (and so `select`) still re-validates every layer at the call
  // site, since the registry can be mutated after construction.
  reframe(InvalidLayerError, () => {
    for (const layer of Object.values(themes)) {
      schema.assert.layer(layer);
    }
  });

  /**
   * Flat token map for `mode` (default: active): roles shadow system, system
   * shadows reference on name collision.
   */
  const tokens = (mode: Mode = config.mode): Tokens<T> => {
    return {
      ...config.theme.reference,
      ...config.theme.system[mode],
      ...config.theme.roles,
    };
  };

  /**
   * One-hop read: the token's current binding (alias name or raw value),
   * unresolved.
   */
  const get = <K extends Token<T>>(token: K) => {
    return tokens(config.mode)[token];
  };

  /**
   * Guarded write: roles take aliases, system tokens take references (current
   * mode only), references take containment-safe values. Anything else is a
   * silent no-op.
   */
  const set = <K extends Token<T>>(token: K, value: Tokens<T>[K]) => {
    if (schema.guard.role(token) && schema.guard.alias(value)) {
      config.theme.roles[token] = value;
      return;
    }
    if (schema.guard.system(token) && schema.guard.reference(value)) {
      config.theme.system[config.mode][token] = value;
      return;
    }
    if (schema.guard.reference(token) && schema.guard.value(value)) {
      config.theme.reference[token] = value;
      return;
    }
  };

  /**
   * Follows the alias chain to a raw value. Any value equal to a token name is
   * treated as an alias and followed. Visited tokens accumulate in `chain`, so
   * a chain that loops back on itself throws {@link CircularAliasError} instead
   * of recursing until the call stack overflows.
   */
  const resolve = <K extends Token<T>>(
    token: K,
    chain: Set<Token<T>> = new Set(),
  ): string => {
    if (chain.has(token)) {
      throw new CircularAliasError([...chain, token]);
    }
    const value = get(token);
    if (schema.guard.token(value)) {
      return resolve(value, chain.add(token));
    }
    return value;
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
   * baseline — and caches the result as the id's pristine state. Throws
   * {@link InvalidLayerError} when the layer steps outside the contract.
   */
  const apply = (layer: Layer<T>) => {
    reframe(InvalidLayerError, () => schema.assert.layer(layer));
    config.theme = merge(base, layer);
    cache[config.theme.id] = clone(config.theme);
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
   * Snapshots the active theme — including unsaved edits — as a detached
   * theme under a new identity.
   */
  const extract = (id: string, name: string): Theme<T> => {
    return merge(config.theme, { id, name });
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
   * Whether any active binding deviates from the active theme's baseline —
   * the cached state it was applied with.
   */
  const dirty = () => {
    const deviation = diff(cache[config.theme.id] ?? base, config.theme);
    return [
      deviation.reference,
      deviation.system.light,
      deviation.system.dark,
      deviation.roles,
    ].some((facet) => Object.keys(facet).length > 0);
  };

  /**
   * Restores the active theme to its cached baseline, discarding edits made
   * since it was applied. An id with no cache entry falls back to the base.
   */
  const reset = () => {
    config.theme = merge(base, cache[config.theme.id] ?? {});
  };

  return {
    config,
    themes,
    schema,
    tokens,
    get,
    set,
    resolve,
    update,
    apply,
    select,
    create,
    extract,
    remove,
    dirty,
    reset,
  };
};
