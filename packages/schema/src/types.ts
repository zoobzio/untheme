import type {
  COLOR_SPACES,
  DEFINITION_KEYS,
  DIMENSION_UNITS,
  DURATION_UNITS,
  FONT_WEIGHTS,
  LINE_CAPS,
  REQUIRED_DEFINITION_KEYS,
  STROKE_STYLES,
  THEME_KEYS,
  TYPES,
} from "./constant";

/**
 * A DTCG token type. A token declares one of these, and the type fixes the
 * shape its `$value` may take.
 */
export type Type = (typeof TYPES)[number];

/**
 * Reference availability per type. A `Refs` map assigns each type the string
 * form its slots accept for a reference. `Open` (authoring) admits any braced
 * name, its membership checked at runtime; `Literal` (dereferenced) admits none,
 * so a fully resolved value carries no references.
 */
export type Refs = { [Y in Type]: string };

/** Authoring references: any braced string, one per type. */
export type Open = { [Y in Type]: `{${string}}` };

/** Dereferenced values: no references admitted at any type. */
export type Literal = { [Y in Type]: never };

/**
 * A CSS Color Module color space a {@link Color} may name.
 */
export type ColorSpace = (typeof COLOR_SPACES)[number];

/**
 * A structured color: a color space, its ordered components (each a number or
 * the `"none"` sentinel), an optional alpha, and an optional hex fallback.
 */
export type Color = {
  colorSpace: ColorSpace;
  components: (number | "none")[];
  alpha?: number;
  hex?: `#${string}`;
};

/**
 * A unit a {@link Dimension} value may carry.
 */
export type DimensionUnit = (typeof DIMENSION_UNITS)[number];

/** A length with an absolute or root-relative unit. */
export type Dimension = {
  value: number;
  unit: DimensionUnit;
};

/**
 * A unit a {@link Duration} value may carry.
 */
export type DurationUnit = (typeof DURATION_UNITS)[number];

/** A time span in milliseconds or seconds. */
export type Duration = { value: number; unit: DurationUnit };

/** A single family name or an ordered fallback stack. */
export type FontFamily = string | string[];

/**
 * A named weight a {@link FontWeight} may use in place of a number.
 */
export type FontWeightKeyword = (typeof FONT_WEIGHTS)[number];

/** A numeric weight or one of the named weights. */
export type FontWeight = number | FontWeightKeyword;

/** The four control-point coordinates of a cubic Bézier easing curve. */
export type CubicBezier = [number, number, number, number];

/**
 * A keyword form a {@link StrokeStyle} may take in place of the dash object.
 */
export type StrokeStyleKeyword = (typeof STROKE_STYLES)[number];

/**
 * A line cap a {@link StrokeStyle} dash object may declare.
 */
export type LineCap = (typeof LINE_CAPS)[number];

/**
 * A stroke style: a keyword, or a dash object whose dash lengths may be
 * dimensions or references and whose caps are drawn with one of the line caps.
 */
export type StrokeStyle<R extends Refs> =
  | StrokeStyleKeyword
  | {
      dashArray: (Dimension | R["dimension"])[];
      lineCap: LineCap;
    };

/** A border: a color, a width, and a stroke style, each a value or reference. */
export type Border<R extends Refs> = {
  color: Color | R["color"];
  width: Dimension | R["dimension"];
  style: StrokeStyle<R> | R["strokeStyle"];
};

/** A transition: a duration, a delay, and a timing function. */
export type Transition<R extends Refs> = {
  duration: Duration | R["duration"];
  delay: Duration | R["duration"];
  timingFunction: CubicBezier | R["cubicBezier"];
};

/** A single drop shadow: a color and four dimensions. */
export type Shadow<R extends Refs> = {
  color: Color | R["color"];
  offsetX: Dimension | R["dimension"];
  offsetY: Dimension | R["dimension"];
  blur: Dimension | R["dimension"];
  spread: Dimension | R["dimension"];
};

/** A gradient stop: a color and a position in the unit interval. */
export type GradientStop<R extends Refs> = {
  color: Color | R["color"];
  position: number | R["number"];
};

/** A typography set: family, size, weight, letter spacing, and line height. */
export type Typography<R extends Refs> = {
  fontFamily: FontFamily | R["fontFamily"];
  fontSize: Dimension | R["dimension"];
  fontWeight: FontWeight | R["fontWeight"];
  letterSpacing: Dimension | R["dimension"];
  lineHeight: number | R["number"];
};

/**
 * The value shape for every type, parameterized by the reference availability.
 * Composite types thread `R` down to their sub-values so a slot admits a value
 * or a reference in the same position.
 */
export type Values<R extends Refs> = {
  color: Color;
  dimension: Dimension;
  duration: Duration;
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  number: number;
  cubicBezier: CubicBezier;
  strokeStyle: StrokeStyle<R>;
  border: Border<R>;
  transition: Transition<R>;
  shadow: Shadow<R> | (Shadow<R> | R["shadow"])[];
  gradient: GradientStop<R>[];
  typography: Typography<R>;
};

/**
 * Every value shape collapsed to a single union. `fontFamily`'s bare `string`
 * arm is the reason {@link Bindable} strips `string` before adding its
 * reference form — an unstripped `string` would absorb it.
 */
type AllValues = Values<Open>[Type];

/**
 * A value union with its bare `string` arm removed: literal keyword arms
 * survive as suggestions, only the absorbing wide `string` goes. `fontFamily`
 * is the one type carrying a bare string arm.
 */
type WithoutBareString<V> = V extends string
  ? string extends V
    ? never
    : V
  : V;

/**
 * The binding union over a value set: the set's own shapes with the bare
 * `string` arm stripped, a `{reference}` string, and — only where the set
 * itself admits bare strings (`fontFamily`) — the absorption-exempt escape
 * that lets plain family names through.
 */
type Bindable<V> =
  | WithoutBareString<V>
  | `{${string}}`
  | (string extends V ? string & {} : never);

/**
 * A token binding — the value type shared by every slot: any structured
 * value, a `{reference}` string, or — for `fontFamily`'s sake, whose values
 * are bare family names — any other string. Build time knows only that a
 * reference is a braced string; whether it names a real token of the right
 * type is a runtime-schema check. Deliberately token-independent: a
 * per-contract reference union at every value position was measured at ~6x
 * the whole contract's check time at preset scale, so the token union appears
 * only at override key positions, where it is bounded and cheap.
 */
export type Binding = Bindable<AllValues>;

/**
 * One authored token slot: a discriminated union with an arm per token type,
 * the declared `$type` narrowing `$value` to that type's own shape or a
 * `{reference}` string. The reference arm is the anonymous `` `{${string}}` ``
 * — build time knows a token is being referenced, not whether it exists;
 * membership and type-matching are runtime-schema checks. Where the type
 * itself admits bare strings (`fontFamily`), the absorption-exempt
 * `string & {}` escape stands in for the stripped arm. A structured value of
 * the wrong family remains a static error at the authoring site.
 */
export type Authored = {
  [Y in Type]: {
    $type: Y;
    $value: Bindable<Values<Open>[Y]>;
    $description?: string;
    $deprecated?: boolean | string;
    $extensions?: Record<string, unknown>;
  };
}[Type];

/**
 * A contract parameterized by its token union (`Tok`) and modifier structure
 * (`Mod`), for call sites that infer or widen a contract from a literal. `Tok`
 * is inferred from the `tokens` keys alone and surfaces at override key
 * positions — the one place the token union is worth its checking cost.
 * Token slots are {@link Authored}, so a slot's declared `$type` narrows its
 * `$value` statically; every arm remains assignable to the machine-side
 * {@link Definition}, so a contract flows into any `Theme` position
 * unchanged.
 */
export type Contract<
  Tok extends string,
  Mod extends Record<string, Record<string, object>>,
> = {
  id: string;
  name: string;
  tokens: { [K in Tok]: Authored };
  modifiers: Mod & {
    [M in keyof Mod]: {
      [C in keyof Mod[M]]: {
        [K in keyof Mod[M][C]]: K extends Tok ? Binding : never;
      };
    };
  };
  order: (keyof Mod & string)[];
};

/**
 * One token definition: a declared type, a bound value, and the inert
 * metadata members. Every definition shares one {@link Binding} regardless of
 * its declared type — a machine-built definition (a merged theme, a rebound
 * extension) carries a binding whose correlation with `$type` only the
 * runtime schema can rule on. The authoring counterpart, where the
 * correlation is statically knowable, is {@link Authored}.
 */
export type Definition = {
  $type: Type;
  $value: Binding;
  $description?: string;
  $deprecated?: boolean | string;
  $extensions?: Record<string, unknown>;
};

/**
 * A theme template: the contract that types and runtime validate against.
 * `tokens` is the complete base map, each entry a full definition. `modifiers`
 * map an axis name to its contexts, each carrying token overrides that rebind a
 * token's `$value` only — a context can never change a token's `$type`. `order`
 * fixes the precedence in which active contexts compose over the base.
 */
export type Template = {
  id: string;
  name: string;
  tokens: Record<string, Definition>;
  modifiers: Record<
    string,
    Record<string, Partial<Record<string, Values<Open>[Type] | `{${string}}`>>>
  >;
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
 * (`{token.name}`) — the form the spec uses for aliases and that survives into
 * CSS as `var(--token-name)`.
 */
export type Reference<T extends Template> = `{${Token<T>}}`;

/**
 * A partial set of token overrides — what a context, layer, or patch carries.
 * Each override rebinds a token's value; it never restates the token's type.
 */
export type Overrides<T extends Template> = {
  [K in Token<T>]?: Binding;
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
 * A complete instantiation of a template: every token carries a full slot,
 * every modifier's contexts each rebind a subset of tokens, and `order` lists
 * the modifiers in composition precedence.
 */
export type Theme<T extends Template> = {
  id: string;
  name: string;
  tokens: { [K in Token<T>]: Definition };
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
 * The closed set of failure kinds a rule can emit. Predicate atoms own one code
 * each; combinators emit the structural kinds (`unknown_key`, `missing_key`)
 * and the alternation kind (`no_match`).
 */
export type Code =
  | "not_string"
  | "empty"
  | "css_breakout"
  | "not_hex"
  | "not_member"
  | "not_reference"
  | "not_object"
  | "not_array"
  | "not_number"
  | "not_boolean"
  | "out_of_range"
  | "bad_length"
  | "duplicate"
  | "not_exhaustive"
  | "type_mismatch"
  | "unknown_type"
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
 * `reference`, `binding`, `definition`) sit alongside the composite kinds
 * (`overrides`, `tokens`, `modifiers`, `order`, `input`, `theme`, `layer`,
 * `patch`).
 */
export type Domain<T extends Template> = {
  modifier: Modifier<T>;
  value: Values<Open>[Type];
  token: Token<T>;
  reference: Reference<T>;
  binding: Binding;
  definition: Authored;
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
 * A reserved member a token definition may carry.
 */
export type DefinitionKey = (typeof DEFINITION_KEYS)[number];

/**
 * A member every token definition must carry.
 */
export type RequiredDefinitionKey = (typeof REQUIRED_DEFINITION_KEYS)[number];

/**
 * A member a complete theme object must carry.
 */
export type ThemeKey = (typeof THEME_KEYS)[number];

/**
 * Every set the schema consults, in one place. The contract members are read
 * off a template — its token names, its modifier axes, each axis's contexts,
 * and each token's declared type. The specification members are fixed by the
 * format itself and identical for every contract.
 */
export type Enum<T extends Template> = {
  tokens: Set<Token<T>>;
  modifiers: Set<Modifier<T>>;
  contexts: { [M in Modifier<T>]: Set<Context<T, M>> };
  types: Record<Token<T>, Type>;
  tokenTypes: Set<Type>;
  colorSpaces: Set<ColorSpace>;
  dimensionUnits: Set<DimensionUnit>;
  durationUnits: Set<DurationUnit>;
  fontWeights: Set<FontWeightKeyword>;
  strokeStyles: Set<StrokeStyleKeyword>;
  lineCaps: Set<LineCap>;
  definitionKeys: Set<DefinitionKey>;
  requiredDefinitionKeys: Set<RequiredDefinitionKey>;
  themeKeys: Set<ThemeKey>;
};

/**
 * The literal and value rules for each token type. `literal` guards a value's
 * structured form in place — a color object, a dimension, a shadow. `value`
 * accepts a reference to a token of that type or the literal, so a slot admits
 * an alias wherever it admits a value.
 */
export type Shape = {
  [Y in Type]: {
    /* The structured form itself: a color object, a dimension, a shadow. */
    literal: Rule;

    /* A reference to a token of this type, or the literal value in place. */
    value: Rule;
  };
};

/**
 * A list of {@link Rule}s per kind, composed from the atoms in `util`. A kind's
 * rules are a conjunction — a value satisfies the kind when every rule returns
 * no {@link Issue}.
 */
export type Rules = { [K in Kind]: Rule[] };

/**
 * The validation core derived from a template: the sets read off the contract,
 * the value rules for each token type, and the rule lists for each kind. The
 * three build on each other in that order, and the check / assert / parse /
 * inspect families consume the template only through this bundle.
 */
export type Meta<T extends Template> = {
  /* Every set the schema consults: contract and specification members. */
  enums: Enum<T>;

  /* The literal and value rule for each token type. */
  shape: Shape;

  /* The rules per kind that the validator families run. */
  rules: Rules;
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
  value: (v: unknown) => asserts v is Values<Open>[Type];
  token: (v: unknown) => asserts v is Token<T>;
  reference: (v: unknown) => asserts v is Reference<T>;
  binding: (v: unknown) => asserts v is Binding;
  definition: (v: unknown) => asserts v is Authored;
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
 * The bundle {@link defineSchema} returns for a template: the source
 * template, the {@link Meta} derived from it (the contract and specification
 * sets, the per-type {@link Shape} rules, and the {@link Rules} per kind),
 * and the {@link Check} / {@link Assert} / {@link Parse} / {@link Inspect}
 * families built from that core.
 */
export type Schema<T extends Template> = {
  base: T;
  meta: Meta<T>;
  check: Check<T>;
  assert: Assert<T>;
  parse: Parse<T>;
  inspect: Inspect<T>;
};
