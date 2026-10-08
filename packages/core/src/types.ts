import type {
  Binding,
  Context,
  Input,
  Layer,
  Modifier,
  Open,
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
 * the patch over the base theme and the selection with one context for each
 * modifier. The base theme is not in the state. The patch can be a layer that
 * `apply` stored or the bindings that `update` merged. An empty patch is the
 * base theme. The container can be a plain object or a reactive proxy. The
 * service replaces each member as a whole.
 */
export type Config<T extends Template> = {
  patch: Patch<T>;
  input: Input<T>;
};

/**
 * The middleware for reads and writes of the state container. Each slot
 * receives the value of the matching `config` field and returns the value that
 * the service uses. A missing slot passes the value on.
 */
export type Options<T extends Template> = {
  get?: {
    config?: {
      patch?: (patch: Patch<T>) => Patch<T>;
      input?: (input: Input<T>) => Input<T>;
    };
  };
  set?: {
    config?: {
      patch?: (patch: Patch<T>) => Patch<T>;
      input?: (input: Input<T>) => Input<T>;
    };
  };
};

/**
 * The runtime theme service for a contract. A read gives the active selection.
 * `swap`, `update`, and `apply` change the active state in `config`.
 */
export interface Untheme<T extends Template> {
  /**
   * The state container of the service.
   */
  config: Config<T>;

  /**
   * The validation functions for the contract. `schema.base` is the base
   * theme.
   */
  schema: Schema<T>;

  /**
   * Returns the active theme: the base theme with the patch merged in. The
   * service keeps the merged theme until the patch object changes.
   */
  theme: () => T;

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
   * active one. The map binds each token to its `$value`, then adds the
   * selected context of each modifier. The active state stays the same.
   */
  tokens: (input?: Input<T>) => { [K in Token<T>]: Binding };

  /**
   * Returns the binding of a token for the active selection.
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
   * Returns the difference between the base theme and the active theme. The
   * result is a patch with each binding that `update` or `apply` changed. The
   * function ignores the identity. `update` applies the result.
   */
  delta: () => Diff<T>;

  /**
   * Merges a patch into the stored patch. An identity or an order of the
   * patch replaces the stored one.
   */
  update: (patch: Patch<T>) => void;

  /**
   * Stores a copy of a layer as the patch. The active theme becomes the base
   * theme with the layer merged in.
   */
  apply: (layer: Layer<T>) => void;

  /**
   * Checks a layer against the contract and returns the layer. The active theme
   * stays the same.
   */
  create: (layer: Layer<T>) => Layer<T>;

  /**
   * Returns a copy of the active theme with a new `id` and `name`. Throws
   * `InvalidThemeError` when the `id` and `name` make the theme invalid.
   */
  extract: (id: string, name: string) => Theme<T>;
}
