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
 * The state that an {@link Untheme} service reads and writes. The state has
 * the active theme, the active selection with one context for each modifier,
 * and the user override that `set` writes. The caller can pass a plain object
 * or a reactive proxy.
 *
 * A read of `theme` has the type `T`. A write of `theme` accepts any complete
 * {@link Theme} of the contract. A plain `{ theme, input, override }` object
 * satisfies both types.
 */
export type Config<T extends Template> = {
  get theme(): T;
  set theme(value: Theme<T>);
  input: Input<T>;
  override: Overrides<T>;
};

/**
 * The middleware for reads and writes of the state container. Each slot
 * receives the value of the matching `config` field and returns the value that
 * the service uses. A missing slot passes the value on.
 */
export type Options<T extends Template> = {
  get?: {
    config?: {
      theme?: (theme: T) => T;
      input?: (input: Input<T>) => Input<T>;
      override?: (override: Overrides<T>) => Overrides<T>;
    };
  };
  set?: {
    config?: {
      theme?: (theme: Theme<T>) => Theme<T>;
      input?: (input: Input<T>) => Input<T>;
      override?: (override: Overrides<T>) => Overrides<T>;
    };
  };
};

/**
 * The runtime theme service for a contract. A read gives the active selection
 * with the user override on top. `set` writes the override. `swap`, `update`,
 * and `apply` change the active state in `config`.
 */
export interface Untheme<T extends Template> {
  /**
   * The state container of the service.
   */
  config: Config<T>;

  /**
   * The validation functions for the contract.
   */
  schema: Schema<T>;

  /**
   * Returns the modifiers of the contract in composition order.
   */
  modifiers: () => Modifier<T>[];

  /**
   * Returns the context names of a modifier. Throws `UnknownModifierError`
   * when the contract has no modifier with that name.
   */
  contexts: (modifier: Modifier<T>) => string[];

  /**
   * Returns the flat token map for a selection. The default selection is the
   * active one. The map binds each token to its `$value` and adds the user
   * override. The active state stays the same.
   */
  tokens: (input?: Input<T>) => { [K in Token<T>]: Binding };

  /**
   * Returns the binding of a token. The result is the override when the token
   * has one. Otherwise the result is the value from the active selection.
   */
  get: (token: Token<T>) => Binding;

  /**
   * Returns the value of a token with no references at any depth. The function
   * follows a reference that is the whole value. It also replaces references
   * in composite values. Throws `CircularAliasError` when references form a
   * loop.
   */
  resolve: (token: Token<T>) => Values<Open>[Type];

  /**
   * Selects a context for a modifier. Throws `InvalidThemeError` when the
   * context is not a context of the modifier.
   */
  swap: <M extends Modifier<T>, C extends Context<T, M>>(
    modifier: M,
    context: C,
  ) => void;

  /**
   * Writes a token to the user override. If the token is unknown, or the value
   * is not valid for the type of the token, the function does nothing. The
   * override holds a copy of the value.
   */
  set: (token: Token<T>, value: Binding) => void;

  /**
   * Returns the difference between the baseline and the active theme with the
   * user override in its tokens. The baseline is the theme that the service
   * received. The result is a patch with each binding that `set`, `update`, or
   * `apply` changed. The function ignores the identity. `update` applies the
   * result.
   */
  delta: () => Diff<T>;

  /**
   * Returns `true` when the user override has an entry.
   */
  dirty: () => boolean;

  /**
   * Removes all entries from the user override.
   */
  reset: () => void;

  /**
   * Merges a patch into the active theme. The identity and the override stay
   * the same.
   */
  update: (patch: Patch<T>) => void;

  /**
   * Makes the active theme from a layer and the baseline, and clears the
   * override.
   */
  apply: (layer: Layer<T>) => void;

  /**
   * Checks a layer against the contract and returns the layer. The active theme
   * stays the same.
   */
  create: (layer: Layer<T>) => Layer<T>;

  /**
   * Returns a copy of the active theme with the override in its tokens.
   * Throws `InvalidThemeError` when the `id` and `name` make the theme
   * invalid.
   */
  extract: (id: string, name: string) => Theme<T>;
}
