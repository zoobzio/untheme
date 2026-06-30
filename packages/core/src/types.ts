import type {
  Binding,
  Context,
  Input,
  Layer,
  Modifier,
  Overrides,
  Patch,
  Schema,
  Template,
  Theme,
  Token,
} from "@untheme/schema";

/**
 * The caller-owned live state an {@link Untheme} service reads and writes: the
 * active theme definition, the active selection (one context per modifier), and
 * the user override layer that `set` populates. Pass a plain object for inert
 * state, or a reactive proxy to have reads and writes tracked.
 */
export type Config<T extends Template> = {
  theme: T;
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
      theme?: (theme: T) => T;
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
   * The catalog of switchable themes `select` / `create` / `remove` operate on.
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
   * The flat token map for a selection (default: the active one), with the user
   * override applied on top. Does not change the active state.
   */
  tokens: (input?: Input<T>) => { [K in Token<T>]: Binding<T> };

  /**
   * A token's effective binding: the override if set, else the composed value.
   */
  get: <K extends Token<T>>(token: K) => Binding<T>;

  /**
   * Follows a token's reference chain to a literal value; throws
   * `CircularAliasError` on a loop.
   */
  resolve: <K extends Token<T>>(token: K) => string;

  /**
   * Selects a context for a modifier — the cheap runtime swap.
   */
  swap: <M extends Modifier<T>, C extends Context<T, M>>(
    modifier: M,
    context: C,
  ) => void;

  /**
   * Writes a token into the user override layer.
   */
  set: <K extends Token<T>>(token: K, value: Binding<T>) => void;

  /**
   * The effective drift from the baseline as a re-appliable patch: the active
   * theme with the user override baked in, diffed against the theme the service
   * was built on. Token and context bindings that match the baseline drop out;
   * what remains is everything `set` / `update` / `apply` changed. Identity is
   * not compared. Feeding the result back through `update` reproduces the drift.
   */
  delta: () => Patch<T>;

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
   * Switches to the catalog theme filed under `key`, and clears the override.
   */
  select: (key: string) => void;

  /**
   * Resolves a layer against the baseline into the catalog under its id.
   */
  create: (layer: Layer<T>) => Theme<T>;

  /**
   * Snapshots the active theme and override as a detached theme; not
   * registered.
   */
  extract: (id: string, name: string) => Theme<T>;

  /**
   * Drops a theme from the catalog by id; the active theme is unaffected.
   */
  remove: (id: string) => void;
}
