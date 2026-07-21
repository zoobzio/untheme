import type {
  Binding,
  Open,
  Template,
  Token,
  Type,
  Values,
} from "@untheme/schema";

/**
 * A token name with its dots replaced by dashes — the ident-safe form a
 * custom property name is built from.
 */
export type Dashed<S extends string> = S extends `${infer Head}.${infer Tail}`
  ? `${Head}-${Dashed<Tail>}`
  : S;

/**
 * The custom property name for a token: `color.bg` becomes `--color-bg`.
 */
export type Variable<Tok extends string> = `--${Dashed<Tok>}`;

/**
 * The active declarations as data: one custom property per token, plus a
 * `-letter-spacing` sibling for each typography token. The sibling arm is
 * partial because a token union carries no declared types — which tokens
 * contribute a sibling is a runtime fact of the contract.
 */
export type Variables<Tok extends string> = Record<Variable<Tok>, string> &
  Partial<Record<`${Variable<Tok>}-letter-spacing`, string>>;

/**
 * The serializable input per token type: the type's own value shape, or a
 * whole-value reference in its place. Composite shapes carry the reference
 * arms of their nested slots through `Values<Open>`, so a reference is
 * admitted wherever a value may sit.
 */
export type Inputs = { [Y in Type]: Values<Open>[Y] | `{${string}}` };

/**
 * A static set of bindings to render, keyed by token. Each value is either a
 * token name — emitted as a `var()` alias to that token's custom property, the
 * bare form of a `{token}` reference — or a binding of the token's own type,
 * exactly as the live accessor supplies. Partial: a set may cover any subset
 * of the contract's tokens, and a token it omits emits no declaration. Passed
 * to `root` and `variables` to render a fixed snapshot instead of the source's
 * live bindings.
 */
export type Bindings<T extends Template> = Partial<
  Record<Token<T>, Token<T> | Binding>
>;

/**
 * The subset of the core service a renderer reads: pass the service itself —
 * `defineRenderer(untheme)` — or any structurally matching container. Reads
 * stay lazy: each render pulls the active theme through the config getter
 * and the bindings through the accessor, so a reactive container tracks
 * every read and re-runs the scope on change.
 */
export type Source<T extends Template> = {
  /*
   * The state container: the active theme, whose slots declare each token's
   * type and whose modifier contexts back the static sheet. The contract's
   * token union infers from this member.
   */
  config: { readonly theme: T };

  /* The active flat bindings, references intact. */
  tokens: () => { [K in Token<T>]: Binding };
};

/**
 * A CSS rendering service over a token contract. Values serialize by their
 * declared type; a `{token}` reference — whole-value or nested in a composite
 * slot — always emits as a `var()` indirection to the target's custom
 * property, so a rebind of the target cascades through the stylesheet instead
 * of being baked into each dependent.
 */
export type Renderer<T extends Template> = {
  /* The custom property name for a token: `--color-bg`. */
  property: <K extends Token<T>>(token: K) => Variable<K>;

  /* The var() accessor for a token: `var(--color-bg)`. */
  var: <K extends Token<T>>(token: K) => `var(${Variable<K>})`;

  /* One token's active binding as CSS text: a value, or its indirection. */
  value: (token: Token<T>) => string;

  /*
   * Every active declaration as data: property name to CSS text. Pass a static
   * set of bindings to render that fixed snapshot instead of the source's live
   * bindings.
   */
  variables: (bindings?: Bindings<T>) => Variables<Token<T>>;

  /*
   * The `:root` block over the active declarations, or over a static set of
   * bindings when one is passed.
   */
  root: (bindings?: Bindings<T>) => string;

  /* The static cascade: base under `:root`, contexts as attribute blocks. */
  sheet: () => string;
};
