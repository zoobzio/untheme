import type {
  Binding,
  Open,
  Template,
  Token,
  Type,
  Values,
} from "@untheme/schema";

/**
 * A token name with each dot replaced by a dash.
 */
export type Dashed<S extends string> = S extends `${infer Head}.${infer Tail}`
  ? `${Head}-${Dashed<Tail>}`
  : S;

/**
 * The custom property name for a token. `color.bg` becomes `--color-bg`.
 */
export type Variable<Tok extends string> = `--${Dashed<Tok>}`;

/**
 * The active declarations as data. The record has one custom property for each
 * token. It has an optional `-letter-spacing` property for each typography
 * token.
 */
export type Variables<Tok extends string> = Record<Variable<Tok>, string> &
  Partial<Record<`${Variable<Tok>}-letter-spacing`, string>>;

/**
 * The serializable input for each token type. An input is a value of the type
 * or a whole-value reference. A reference can also fill a slot in a composite
 * value.
 */
export type Inputs = { [Y in Type]: Values<Open>[Y] | `{${string}}` };

/**
 * A static set of bindings to render, keyed by token. Each value is a token
 * name or a binding of the type of the token. A token name renders as a `var()`
 * alias to the custom property of that token. The set can cover any subset of
 * the tokens. A token that the set omits has no declaration. Pass the set to
 * `root` and `variables` to render a fixed snapshot.
 */
export type Bindings<T extends Template> = Partial<
  Record<Token<T>, Token<T> | Binding>
>;

/**
 * The part of the core service that a renderer reads. Pass the service, as in
 * `defineRenderer(untheme)`, or any container with the same members. Each
 * render reads the active theme from `theme` and the bindings from `tokens`. A
 * reactive container tracks each read and runs the scope again on change.
 */
export type Source<T extends Template> = {
  /*
   * The active theme. Its slots declare the type of each token. Its modifier
   * contexts give the static sheet.
   */
  theme: () => T;

  /*
   * The active flat bindings. A reference stays a reference.
   */
  tokens: () => { [K in Token<T>]: Binding };
};

/**
 * A CSS rendering service for a token contract. The service serializes each
 * value by its declared type. A `{token}` reference emits as a `var()` to the
 * custom property of the target token. This applies to a whole-value reference
 * and to a reference in a composite slot.
 */
export type Renderer<T extends Template> = {
  /* The custom property name for a token: `--color-bg`. */
  property: <K extends Token<T>>(token: K) => Variable<K>;

  /* The var() accessor for a token: `var(--color-bg)`. */
  var: <K extends Token<T>>(token: K) => `var(${Variable<K>})`;

  /*
   * Returns the active binding of a token as CSS text, a value or a `var()`
   * reference.
   */
  value: (token: Token<T>) => string;

  /*
   * Returns each active declaration as a record of property name to CSS text.
   * With a static set of bindings, the function renders that set.
   */
  variables: (bindings?: Bindings<T>) => Variables<Token<T>>;

  /*
   * Returns the `:root` block for the active declarations, or for a static set
   * of bindings.
   */
  root: (bindings?: Bindings<T>) => string;

  /*
   * Returns the base bindings under `:root`, then each context as an attribute
   * block.
   */
  sheet: () => string;
};
