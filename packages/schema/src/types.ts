import type { COLOR_MODES, SECTIONS } from "./constant";

/**
 * A supported color mode.
 */
export type Mode = (typeof COLOR_MODES)[number];

/**
 * A key of a theme {@link Template}.
 */
export type Section = (typeof SECTIONS)[number];

/**
 * A theme template: the token contract that layers and themes are validated
 * against. Its keys define which reference, system, and role tokens exist;
 * its values are the baseline assignments.
 */
export type Template = {
  id: string;
  name: string;
  reference: Record<string, string>;
  system: { [M in Mode]: Record<string, string> };
  roles: Record<string, string>;
};

/**
 * A raw CSS value held by a reference token.
 */
export type Value = string;

/**
 * Union of reference token names defined by a template.
 */
export type Reference<T extends Template> = keyof T["reference"] & string;

/**
 * Union of system token names defined by a template.
 */
export type System<T extends Template> = keyof T["system"][Mode] & string;

/**
 * Union of role token names defined by a template.
 */
export type Role<T extends Template> = keyof T["roles"] & string;

/**
 * A token name a role may point to: reference or system.
 */
export type Alias<T extends Template> = Reference<T> | System<T>;

/**
 * Any token name defined by a template.
 */
export type Token<T extends Template> = Reference<T> | System<T> | Role<T>;

/**
 * The flat token map for a template: reference tokens hold raw values,
 * system tokens hold reference aliases, role tokens hold reference or
 * system aliases.
 */
export type Tokens<T extends Template> = {
  [K in Reference<T>]: Value;
} & {
  [K in System<T>]: Reference<T>;
} & { [K in Role<T>]: Alias<T> };

/**
 * An anonymous set of token overrides: every facet and token is optional, but
 * anything present must stay within the contract. Unlike a {@link Layer}, a
 * patch carries no identity — applying one changes values, not which theme
 * you are.
 */
export type Patch<T extends Template> = {
  reference?: { [K in Reference<T>]?: Value };
  system?: { [M in Mode]?: { [K in System<T>]?: Reference<T> } };
  roles?: { [K in Role<T>]?: Alias<T> };
};

/**
 * A partial overlay of a template. Every token present must belong to the
 * contract and satisfy its tier's value rule, but tokens may be omitted.
 */
export type Layer<T extends Template> = {
  id: string;
  name: string;
  reference: { [K in Reference<T>]?: string };
  system: { [M in Mode]: { [K in System<T>]?: Reference<T> } };
  roles: { [K in Role<T>]?: Alias<T> };
};

/**
 * A complete instantiation of a template: every contract token is present,
 * and both modes carry an identical token structure.
 */
export type Theme<T extends Template> = {
  id: string;
  name: string;
  reference: { [K in Reference<T>]: string };
  system: { [M in Mode]: { [K in System<T>]: NoInfer<Reference<T>> } };
  roles: { [K in Role<T>]: NoInfer<Reference<T> | System<T>> };
};

/**
 * A {@link Template} parameterized by its token name unions, for call sites
 * that infer the contract from a literal theme. `NoInfer` keeps inference
 * anchored on the key positions: system and role values must alias names
 * declared elsewhere in the contract, never widen it.
 */
export type Contract<
  Ref extends string,
  Sys extends string,
  Rol extends string,
> = {
  id: string;
  name: string;
  reference: { [K in Ref]: Value };
  system: { [M in Mode]: { [K in Sys]: NoInfer<Ref> } };
  roles: { [K in Rol]: NoInfer<Ref | Sys> };
};

/**
 * The full validation vocabulary for a template: every tier mapped to the type
 * a value of that tier narrows to. The scalar tiers (`mode`, `value`, the
 * token-name tiers) sit alongside the composite shapes (`tokens`, `patch`,
 * `layer`, `theme`).
 */
export type Domain<T extends Template> = {
  mode: Mode;
  value: Value;
  reference: Reference<T>;
  system: System<T>;
  role: Role<T>;
  alias: Alias<T>;
  token: Token<T>;
  tokens: Tokens<T>;
  patch: Patch<T>;
  layer: Layer<T>;
  theme: Theme<T>;
};

/**
 * The name of a tier — a key of {@link Domain}. Used to index the rule, guard,
 * assert, and parse bundles uniformly.
 */
export type Tier = keyof Domain<Template>;

/**
 * The closed set of failure kinds the rule atoms can emit. Predicate atoms own
 * one code each; combinators emit the structural codes (`unknown_key`,
 * `missing_key`).
 */
export type Code =
  | "not_string"
  | "empty"
  | "css_breakout"
  | "unbalanced"
  | "not_member"
  | "not_object"
  | "unknown_key"
  | "missing_key";

/**
 * A detailed validation failure. `code` is a stable discriminant callers can
 * branch on, `message` is human-readable text, and `path` is filled in by
 * combinator rules as they descend into nested structure. `expected` and
 * `received` carry the contract value and the offending value when useful.
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
 * The runtime vocabulary derived from a template: the token-name {@link Set}s
 * used for membership and completeness checks, plus a list of {@link Rule}s per
 * tier. A tier's rules are a conjunction — a value satisfies the tier when
 * every rule returns no {@link Issue}.
 */
export type Lexicon<T extends Template> = {
  tokens: {
    reference: Set<Reference<T>>;
    system: Set<System<T>>;
    role: Set<Role<T>>;
    alias: Set<Alias<T>>;
    all: Set<Token<T>>;
  };
  rules: {
    [K in Tier]: Rule[];
  };
};

/**
 * Boolean type predicates per tier: `true` narrows the value to its tier type,
 * `false` says nothing more. Use when a yes/no answer is enough; reach for
 * {@link Assert} or {@link Parse} when you need the reasons.
 */
export type Guard<T extends Template> = {
  [K in Tier]: (v: unknown) => v is Domain<T>[K];
};

/**
 * Assertion functions per tier: return when the value satisfies the tier, or
 * throw a {@link SchemaError} carrying every {@link Issue} found. Spelled out
 * per tier (rather than mapped) because `asserts` predicates cannot be produced
 * by a mapped type.
 */
export type Assert<T extends Template> = {
  mode: (v: unknown) => asserts v is Mode;
  value: (v: unknown) => asserts v is Value;
  reference: (v: unknown) => asserts v is Reference<T>;
  system: (v: unknown) => asserts v is System<T>;
  role: (v: unknown) => asserts v is Role<T>;
  alias: (v: unknown) => asserts v is Alias<T>;
  token: (v: unknown) => asserts v is Token<T>;
  tokens: (v: unknown) => asserts v is Tokens<T>;
  patch: (v: unknown) => asserts v is Patch<T>;
  layer: (v: unknown) => asserts v is Layer<T>;
  theme: (v: unknown) => asserts v is Theme<T>;
};

/**
 * Parse functions per tier: return the value narrowed to its tier type, or
 * throw a {@link SchemaError}. The throwing analog of {@link Guard}, handy at
 * trust boundaries (`const theme = parse.theme(await res.json())`).
 */
export type Parse<T extends Template> = {
  [K in Tier]: (v: unknown) => Domain<T>[K];
};

/**
 * The bundle {@link defineSchema} returns for a template: the source
 * template, the derived {@link Lexicon}, and the {@link Guard}/{@link Assert}/
 * {@link Parse} families built from it.
 */
export type Schema<T extends Template> = {
  base: T;
  lexicon: Lexicon<T>;
  guard: Guard<T>;
  assert: Assert<T>;
  parse: Parse<T>;
};
