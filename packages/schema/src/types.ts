/**
 * The runtime theme contract. A schema turns a theme config into runtime types:
 * the `tokens` keys define the `Token` union the rest of the runtime is typed
 * against.
 *
 * A token's value may be a literal CSS value or a reference to another token in
 * the same contract. References serialize to `var()`-to-`var()` indirection, so
 * switching a context swaps values without regenerating CSS. `modifiers` group
 * token overrides into axes of mutually exclusive contexts (e.g. a `color`
 * modifier with `light` and `dark` contexts), composed at runtime in
 * `order`.
 */

/** A literal CSS value string. */
export type Value = string & {};

/**
 * A theme template: the contract that types and runtime validate against.
 * `tokens` is the complete base map. `modifiers` map an axis name to its
 * contexts, each carrying token overrides. `order` fixes the
 * precedence in which active contexts compose over the base.
 */
export type Template = {
  id: string;
  name: string;
  tokens: Record<string, string>;
  modifiers: Record<string, Record<string, Partial<Record<string, string>>>>;
  order: string[];
};

/** Any token name defined by a template. */
export type Token<T extends Template> = keyof T["tokens"] & string;

/** Any modifier (axis) name defined by a template. */
export type Modifier<T extends Template> = keyof T["modifiers"] & string;

/** Any context name defined by a template's modifier `M`. */
export type Context<
  T extends Template,
  M extends Modifier<T>,
> = keyof T["modifiers"][M] & string;

/**
 * A reference to another token in the contract, in curly-brace syntax
 * (`{token-name}`) — the form that survives into CSS as `var(--token-name)`.
 */
export type Reference<T extends Template> = `{${Token<T>}}`;

/**
 * A token binding: a {@link Reference} to another token, or a literal value.
 * The `string & {}` arm accepts any literal value while keeping the reference
 * forms in editor autocomplete — a bare `string` would absorb and erase them.
 */
export type Binding<T extends Template> = Reference<T> | Value;

/**
 * A partial set of token overrides — what a context, layer, or patch carries.
 */
export type Overrides<T extends Template> = {
  [K in Token<T>]?: Binding<T>;
};

/** Every context of every modifier, each carrying its token overrides. */
export type Modifiers<T extends Template> = {
  [M in Modifier<T>]: { [C in Context<T, M>]: Overrides<T> };
};

/** The active context selected for each modifier. */
export type Input<T extends Template> = {
  [M in Modifier<T>]: Context<T, M>;
};

/**
 * A complete instantiation of a template: every token carries a base binding,
 * every modifier's contexts each rebind a subset of tokens, and
 * `order` lists the modifiers in composition precedence.
 */
export type Theme<T extends Template> = {
  id: string;
  name: string;
  tokens: { [K in Token<T>]: Binding<T> };
  modifiers: Modifiers<T>;
  order: Modifier<T>[];
};

/**
 * A partial overlay that carries identity: applying it changes which theme is
 * active. Anything present must belong to the contract; everything is optional.
 */
export type Layer<T extends Template> = {
  id: string;
  name: string;
  tokens?: Overrides<T>;
  modifiers?: { [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> } };
  order?: Modifier<T>[];
};

/**
 * A partial overlay without identity: applying it changes values, not which
 * theme is active.
 */
export type Patch<T extends Template> = {
  tokens?: Overrides<T>;
  modifiers?: { [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> } };
};

/**
 * A template parameterized by its token union (`Tok`) and modifier structure
 * (`Mod`), for call sites that infer or widen a contract from a literal — the
 * form `extend` returns. `NoInfer` anchors inference on the key positions so
 * reference values name existing tokens rather than widening the contract.
 */
export type Contract<
  Tok extends string,
  Mod extends Record<
    string,
    Record<string, Partial<Record<NoInfer<Tok>, `{${NoInfer<Tok>}}` | Value>>>
  >,
> = {
  id: string;
  name: string;
  tokens: { [K in Tok]: `{${NoInfer<Tok>}}` | Value };
  modifiers: {
    [M in keyof Mod & (string & {})]: {
      [V in keyof Mod[M] & (string & {})]: {
        [K in NoInfer<Tok>]?: `{${NoInfer<Tok>}}` | Value;
      };
    };
  };
  order: (keyof Mod & (string & {}))[];
};

/**
 * The closed set of failure kinds a rule can emit. Predicate atoms own one
 * code each; combinators emit the structural kinds (`unknown_key`,
 * `missing_key`) and the alternation kind (`no_match`).
 */
export type Code =
  | "not_string"
  | "empty"
  | "css_breakout"
  | "unbalanced"
  | "not_member"
  | "not_reference"
  | "not_object"
  | "not_array"
  | "unknown_key"
  | "missing_key"
  | "no_match"
  | "cycle";

/**
 * A validation failure. `code` is a stable discriminant callers branch on,
 * `message` is human-readable, `path` is filled in by combinators as they
 * descend, and `expected`/`received` carry the contract and offending values.
 */
export type Issue = {
  code: Code;
  message: string;
  path?: string[];
  expected?: unknown;
  received?: unknown;
};

/**
 * A type-agnostic validation rule: returns an {@link Issue} describing what is
 * wrong, or `undefined` when the value satisfies the rule.
 */
export type Rule = (v: unknown) => Issue | undefined;

/**
 * The validation vocabulary for a template: every kind mapped to the type a
 * value of that kind narrows to. Scalar kinds (`modifier`, `value`, `token`,
 * `reference`, `binding`) sit alongside the composite kinds (`overrides`,
 * `tokens`, `modifiers`, `order`, `input`, `theme`, `layer`,
 * `patch`).
 */
export type Domain<T extends Template> = {
  modifier: Modifier<T>;
  value: Value;
  token: Token<T>;
  reference: Reference<T>;
  binding: Binding<T>;
  overrides: Overrides<T>;
  tokens: Theme<T>["tokens"];
  modifiers: Modifiers<T>;
  order: Theme<T>["order"];
  input: Input<T>;
  theme: Theme<T>;
  layer: Layer<T>;
  patch: Patch<T>;
};

/** The name of a kind — a key of {@link Domain}. */
export type Kind = keyof Domain<Template>;

/**
 * The runtime vocabulary derived from a template: the token, modifier, and
 * per-modifier context {@link Set}s used for membership and completeness
 * checks, plus a list of {@link Rule}s per kind. A kind's rules are a
 * conjunction — a value satisfies the kind when every rule returns no {@link
 * Issue}.
 */
export type Rules<T extends Template> = {
  sets: {
    tokens: Set<Token<T>>;
    modifiers: Set<Modifier<T>>;
    contexts: Record<string, Set<string>>;
  };
  rules: { [K in Kind]: Rule[] };
};

/**
 * Boolean type predicates per kind: `true` narrows the value to its kind type,
 * `false` says nothing more. Use when a yes/no answer is enough; reach for
 * {@link Assert} or {@link Parse} when you need the reasons.
 */
export type Check<T extends Template> = {
  [K in Kind]: (v: unknown) => v is Domain<T>[K];
};

/**
 * Assertion functions per kind: return when the value satisfies the kind, or
 * throw a {@link SchemaError} carrying every {@link Issue} found. Spelled out
 * per kind rather than mapped, since `asserts` predicates cannot be produced by
 * a mapped type.
 */
export type Assert<T extends Template> = {
  modifier: (v: unknown) => asserts v is Modifier<T>;
  value: (v: unknown) => asserts v is Value;
  token: (v: unknown) => asserts v is Token<T>;
  reference: (v: unknown) => asserts v is Reference<T>;
  binding: (v: unknown) => asserts v is Binding<T>;
  overrides: (v: unknown) => asserts v is Overrides<T>;
  tokens: (v: unknown) => asserts v is Theme<T>["tokens"];
  modifiers: (v: unknown) => asserts v is Modifiers<T>;
  order: (v: unknown) => asserts v is Theme<T>["order"];
  input: (v: unknown) => asserts v is Input<T>;
  theme: (v: unknown) => asserts v is Theme<T>;
  layer: (v: unknown) => asserts v is Layer<T>;
  patch: (v: unknown) => asserts v is Patch<T>;
};

/**
 * Parse functions per kind: return the value narrowed to its kind type, or let
 * the {@link SchemaError} from {@link Assert} propagate. The throwing analog of
 * {@link Check}, handy at trust boundaries
 * (`const theme = parse.theme(await res.json())`).
 */
export type Parse<T extends Template> = {
  [K in Kind]: (v: unknown) => Domain<T>[K];
};

/**
 * The outcome of an {@link Inspect}: either the value narrowed to its kind
 * type, or the {@link Issue}s explaining why it failed.
 */
export type Result<V> =
  | {
      success: true;
      data: V;
    }
  | {
      success: false;
      issues: Issue[];
    };

/**
 * Inspect functions per kind: return a {@link Result} — success with the
 * narrowed value, or failure with the issues — rather than throwing. The
 * non-throwing analog of {@link Parse}.
 */
export type Inspect<T extends Template> = {
  [K in Kind]: (v: unknown) => Result<Domain<T>[K]>;
};

/**
 * The bundle {@link defineSchema} returns for a template: the source template,
 * the derived {@link Rules}, and the {@link Check} / {@link Assert} /
 * {@link Parse} / {@link Inspect} families built from it.
 */
export type Schema<T extends Template> = {
  base: T;
  rules: Rules<T>;
  check: Check<T>;
  assert: Assert<T>;
  parse: Parse<T>;
  inspect: Inspect<T>;
};
