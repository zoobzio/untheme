import type {
  Binding,
  Context,
  Input,
  Layer,
  Modifier,
  Open,
  Overrides,
  Patch,
  Schema,
  Template,
  Theme,
  Token,
  Type,
  Values,
} from "@untheme/schema";
import type { Diff } from "@untheme/utils";

/**
 * The caller-owned live state an {@link Untheme} service reads and writes: the
 * active theme definition, the active selection (one context per modifier), and
 * the user override layer that `set` populates. Pass a plain object for inert
 * state, or a reactive proxy to have reads and writes tracked.
 *
 * `theme` reads as the caller's own contract type but writes accept any
 * complete {@link Theme} of that contract: `update` and `apply` store merged
 * themes, which satisfy the contract without being the caller's exact type. A
 * plain `{ theme, input, override }` object satisfies both sides.
 */
export type Config<T extends Template> = {
  get theme(): T;
  set theme(value: Theme<T>);
  input: Input<T>;
  override: Overrides<T>;
};

/**
 * Read/write middleware over the state container. Each slot intercepts the
 * matching `config` field or catalog entry and transforms the value as it
 * passes through — the integration's hook for instrumenting state without the
 * service knowing about it. Omit a slot to pass the value through untouched.
 */
export type Options<T extends Template> = {
  get?: {
    config?: {
      theme?: (theme: T) => T;
      input?: (input: Input<T>) => Input<T>;
      override?: (override: Overrides<T>) => Overrides<T>;
    };
    themes?: { [key: string]: (layer: Layer<T>) => Layer<T> };
  };
  set?: {
    config?: {
      theme?: (theme: Theme<T>) => Theme<T>;
      input?: (input: Input<T>) => Input<T>;
      override?: (override: Overrides<T>) => Overrides<T>;
    };
    themes?: { [key: string]: (layer: Layer<T>) => Layer<T> };
  };
};

/**
 * A runtime theme service over a contract. Reads resolve the active selection
 * with the user override on top; `set` writes the override; switching a context
 * or applying a definition change updates the active state in `config`.
 */
export interface Untheme<T extends Template> {
  /**
   * The caller-owned live state — the single place state is read or written raw.
   */
  config: Config<T>;

  /**
   * The catalog of switchable layers `select` / `create` / `remove` operate on.
   */
  themes: Record<string, Layer<T>>;

  /**
   * The validation bundle for the contract.
   */
  schema: Schema<T>;

  /**
   * The modifiers (axes) the contract declares, in composition order.
   */
  modifiers: () => Modifier<T>[];

  /**
   * The context names a modifier offers.
   */
  contexts: (modifier: Modifier<T>) => string[];

  /**
   * The flat token map for a selection (default: the active one), each token
   * bound to its `$value`, with the user override applied on top. Does not
   * change the active state.
   */
  tokens: (input?: Input<T>) => { [K in Token<T>]: Binding<T> };

  /**
   * A token's effective binding: the override if set, else the composed value.
   */
  get: (token: Token<T>) => Binding<T>;

  /**
   * A token's fully dereferenced value: whole-value references are followed to
   * their target and references nested inside composite values resolve in
   * place, so the result carries no references at any depth. Throws
   * `CircularAliasError` on a reference loop.
   */
  resolve: (token: Token<T>) => Values<Open>[Type];

  /**
   * Selects a context for a modifier — the cheap runtime swap.
   */
  swap: <M extends Modifier<T>, C extends Context<T, M>>(
    modifier: M,
    context: C,
  ) => void;

  /**
   * Writes a token into the user override layer. A write outside the contract —
   * an unknown token, or a value invalid for that token's declared type — is a
   * silent no-op.
   */
  set: (token: Token<T>, value: Binding<T>) => void;

  /**
   * The effective drift from the baseline as a re-appliable patch: the active
   * theme with the user override baked in, diffed against the theme the service
   * was built on. Token and context bindings that match the baseline drop out;
   * what remains is everything `set` / `update` / `apply` changed. Identity is
   * not compared. Feeding the result back through `update` reproduces the drift.
   */
  delta: () => Diff<T>;

  /**
   * Whether the user override holds any edits.
   */
  dirty: () => boolean;

  /**
   * Clears the user override.
   */
  reset: () => void;

  /**
   * Merges a patch into the active theme; identity and the override are
   * unchanged.
   */
  update: (patch: Patch<T>) => void;

  /**
   * Becomes the layer resolved against the baseline, and clears the override.
   */
  apply: (layer: Layer<T>) => void;

  /**
   * Switches to the catalog layer filed under `key`, and clears the override.
   */
  select: (key: string) => void;

  /**
   * Files a layer in the catalog under its id and returns it resolved against
   * the baseline as a complete theme. The active theme is not touched.
   */
  create: (layer: Layer<T>) => Theme<T>;

  /**
   * Snapshots the active theme and override as a detached theme; not
   * registered.
   */
  extract: (id: string, name: string) => Theme<T>;

  /**
   * Drops a layer from the catalog by id; the active theme is unaffected.
   */
  remove: (id: string) => void;
}
