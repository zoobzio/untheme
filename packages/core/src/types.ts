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
 * A change of the selection. `before` and `after` are the stored selections
 * around the write.
 */
export type InputChange<T extends Template> = {
  field: "input";
  before: Input<T>;
  after: Input<T>;
};

/**
 * A change of the patch. `before` and `after` are the stored patches around
 * the write. `diff` is the difference between the active theme before the
 * write and the active theme after it: each binding that the write changed,
 * for each token and for each context. It is the patch that `update` would
 * take to make the same change over the old theme. The diff holds added and
 * changed bindings. A context override that the write removed shows as the
 * base binding when the base theme has one, and is absent otherwise.
 */
export type PatchChange<T extends Template> = {
  field: "patch";
  before: Patch<T>;
  after: Patch<T>;
  diff: Diff<T>;
};

/**
 * A change of the state. `field` tells which member of the container the
 * write replaced.
 */
export type Change<T extends Template> = InputChange<T> | PatchChange<T>;

/**
 * The events of an {@link Untheme} service, keyed by name. Each value is the
 * argument list of a listener. The service emits each event after the write
 * lands in the container, so a listener reads the new state.
 *
 * - `input`: the selection changed with `swap`. The listener receives the
 *   {@link InputChange}.
 * - `patch`: the patch changed with `update` or `apply`. The listener receives
 *   the {@link PatchChange}.
 * - `change`: the selection or the patch changed. The listener receives the
 *   same {@link Change} object as the event of the field. The service emits
 *   `change` after `input` or `patch`.
 */
export type Events<T extends Template> = {
  input: [change: InputChange<T>];
  patch: [change: PatchChange<T>];
  change: [change: Change<T>];
};

/**
 * The name of an event of an {@link Untheme} service.
 */
export type Event<T extends Template> = keyof Events<T>;

/**
 * A listener for one event of an {@link Untheme} service.
 */
export type Listener<T extends Template, E extends Event<T>> = (
  ...args: Events<T>[E]
) => void;

/**
 * The runtime theme service for a contract. A read gives the active selection.
 * `swap`, `update`, and `apply` change the active state in `config`. Each
 * write emits an event. `on` subscribes to one.
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
   * Returns the active theme: the base theme with the patch merged in. Each
   * call returns a new object.
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

  /**
   * Subscribes a listener to an event. The service calls the listeners of an
   * event in subscription order, after the write lands in the container. A
   * write through `config` or through `swap`, `update`, or `apply` emits. A
   * write to the container itself does not. An error in a listener propagates
   * to the caller of the write. Returns a function that removes the listener.
   */
  on: <E extends Event<T>>(event: E, listener: Listener<T, E>) => () => void;
}
