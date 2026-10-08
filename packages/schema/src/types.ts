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
 * A DTCG token type. A token declares one type. The type sets the shape of the
 * `$value` of the token.
 */
export type Type = (typeof TYPES)[number];

/**
 * The reference form for each type. A `Refs` map gives each type the string
 * form that its slots accept as a reference. `Open` accepts any braced name.
 * The runtime schema checks the name. `Literal` accepts no reference.
 */
export type Refs = { [Y in Type]: string };

/**
 * The references in authored themes. Each type accepts any braced string.
 */
export type Open = { [Y in Type]: `{${string}}` };

/**
 * The references in resolved values. No type accepts a reference.
 */
export type Literal = { [Y in Type]: never };

/**
 * A CSS Color Module color space that a {@link Color} can name.
 */
export type ColorSpace = (typeof COLOR_SPACES)[number];

/**
 * A structured color. A color has a color space and an ordered array of
 * components. Each component is a number or `"none"`. A color can have an alpha
 * and a hex value.
 */
export type Color = {
  colorSpace: ColorSpace;
  components: (number | "none")[];
  alpha?: number;
  hex?: `#${string}`;
};

/**
 * A unit that a {@link Dimension} value can use.
 */
export type DimensionUnit = (typeof DIMENSION_UNITS)[number];

/**
 * A length. The unit is absolute or relative to the root.
 */
export type Dimension = {
  value: number;
  unit: DimensionUnit;
};

/**
 * A unit that a {@link Duration} value can use.
 */
export type DurationUnit = (typeof DURATION_UNITS)[number];

/**
 * A time span in milliseconds or seconds.
 */
export type Duration = { value: number; unit: DurationUnit };

/**
 * A family name or an ordered array of family names.
 */
export type FontFamily = string | string[];

/**
 * A named weight that a {@link FontWeight} can use in place of a number.
 */
export type FontWeightKeyword = (typeof FONT_WEIGHTS)[number];

/**
 * A number or a named weight.
 */
export type FontWeight = number | FontWeightKeyword;

/**
 * The four control-point coordinates of a cubic Bézier easing curve.
 */
export type CubicBezier = [number, number, number, number];

/**
 * A keyword that a {@link StrokeStyle} can use in place of the dash object.
 */
export type StrokeStyleKeyword = (typeof STROKE_STYLES)[number];

/**
 * A line cap that a {@link StrokeStyle} dash object can declare.
 */
export type LineCap = (typeof LINE_CAPS)[number];

/**
 * A stroke style. A stroke style is a keyword or a dash object. The dash
 * object has an array of dash lengths and a line cap. Each dash length is a
 * dimension or a reference.
 */
export type StrokeStyle<R extends Refs> =
  | StrokeStyleKeyword
  | {
      dashArray: (Dimension | R["dimension"])[];
      lineCap: LineCap;
    };

/**
 * A border. A border has a color, a width, and a stroke style. Each is a value
 * or a reference.
 */
export type Border<R extends Refs> = {
  color: Color | R["color"];
  width: Dimension | R["dimension"];
  style: StrokeStyle<R> | R["strokeStyle"];
};

/**
 * A transition. A transition has a duration, a delay, and a timing function.
 */
export type Transition<R extends Refs> = {
  duration: Duration | R["duration"];
  delay: Duration | R["duration"];
  timingFunction: CubicBezier | R["cubicBezier"];
};

/**
 * A drop shadow. A drop shadow has a color and four dimensions.
 */
export type Shadow<R extends Refs> = {
  color: Color | R["color"];
  offsetX: Dimension | R["dimension"];
  offsetY: Dimension | R["dimension"];
  blur: Dimension | R["dimension"];
  spread: Dimension | R["dimension"];
};

/**
 * A gradient stop. A gradient stop has a color and a position from 0 to 1.
 */
export type GradientStop<R extends Refs> = {
  color: Color | R["color"];
  position: number | R["number"];
};

/**
 * A typography set. A typography set has a family, a size, a weight, a letter
 * spacing, and a line height.
 */
export type Typography<R extends Refs> = {
  fontFamily: FontFamily | R["fontFamily"];
  fontSize: Dimension | R["dimension"];
  fontWeight: FontWeight | R["fontWeight"];
  letterSpacing: Dimension | R["dimension"];
  lineHeight: number | R["number"];
};

/**
 * The value shape for each type. The parameter `R` sets the reference form.
 * Each composite type passes `R` to its sub-values. A slot accepts a value or a
 * reference.
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
 * The union of all value shapes. The `fontFamily` shape has a bare `string`
 * arm. {@link Bindable} removes the `string` arm before it adds the reference
 * form.
 */
type AllValues = Values<Open>[Type];

/**
 * The literal keyword arms of a value union. The type removes the bare
 * `string` arm. Only the `fontFamily` type has a bare `string` arm.
 */
type WithoutBareString<V> = V extends string
  ? string extends V
    ? never
    : V
  : V;

/**
 * The binding union for a value set. The union has the literal shapes of
 * the set and a `{reference}` string. When the set has a bare `string` arm
 * (`fontFamily`), the union also has `string & {}`, which accepts plain
 * family names.
 */
type Bindable<V> =
  | WithoutBareString<V>
  | `{${string}}`
  | (string extends V ? string & {} : never);

/**
 * A token binding. Every slot has this value type. A binding is a structured
 * value, a `{reference}` string, or any other string for `fontFamily`. The
 * type treats a reference as a braced string. The runtime schema checks that
 * the reference names a token of the right type. The type is the same for all
 * templates. The token union appears only at override key positions.
 */
export type Binding = Bindable<AllValues>;

/**
 * An authored token slot. The type is a discriminated union with one arm for
 * each token type. The declared `$type` narrows `$value` to the shape of that
 * type or to a `{reference}` string. The reference arm is `` `{${string}}` ``.
 * The runtime schema checks that the token exists and has the right type. The
 * `fontFamily` arm uses `string & {}` to accept plain family names. A
 * structured value of the wrong type is a static error where the author
 * writes it.
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
 * A contract with the token union `Tok` and the modifier structure `Mod`. The
 * compiler infers a contract from a literal. The compiler infers `Tok` from the
 * keys of `tokens`. `Tok` appears at override key positions. Token slots are
 * {@link Authored}, so the declared `$type` of a slot narrows its `$value`.
 * Every arm is assignable to {@link Definition}. A contract is valid in any
 * `Theme` position.
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
 * A token definition. A definition has a declared type, a bound value, and
 * metadata members. Every definition uses {@link Binding} for the value, for
 * all declared types. The runtime schema checks that the value matches
 * `$type`. {@link Authored} is the type for authored definitions. The compiler
 * checks `$value` against `$type` in an authored definition.
 */
export type Definition = {
  $type: Type;
  $value: Binding;
  $description?: string;
  $deprecated?: boolean | string;
  $extensions?: Record<string, unknown>;
};

/**
 * A theme template. The types and the runtime schema validate against the
 * template. `tokens` is the complete base map. Each entry is a full
 * definition. `modifiers` maps the name of an axis to its contexts. Each
 * context has token overrides. An override sets the `$value` of a token. `order`
 * sets the precedence of the active contexts over the base.
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

/**
 * The name of a token in a template.
 */
export type Token<T extends Template> = keyof T["tokens"] & string;

/**
 * The name of a modifier (axis) in a template.
 */
export type Modifier<T extends Template> = keyof T["modifiers"] & string;

/**
 * The name of a context in the modifier `M` of a template.
 */
export type Context<
  T extends Template,
  M extends Modifier<T>,
> = keyof T["modifiers"][M] & string;

/**
 * A reference to a token in the contract. A reference uses curly braces, as in
 * `{token.name}`. The specification uses this form for aliases. In CSS, a
 * reference becomes `var(--token-name)`.
 */
export type Reference<T extends Template> = `{${Token<T>}}`;

/**
 * A partial set of token overrides. A context, a layer, and a patch hold
 * overrides. Each override sets the value of a token.
 */
export type Overrides<T extends Template> = {
  [K in Token<T>]?: Binding;
};

/**
 * The contexts of each modifier. Each context holds token overrides.
 */
export type Modifiers<T extends Template> = {
  [M in Modifier<T>]: { [C in Context<T, M>]: Overrides<T> };
};

/**
 * The active context for each modifier.
 */
export type Input<T extends Template> = {
  [M in Modifier<T>]: Context<T, M>;
};

/**
 * A complete theme for a template. Every token has a full definition. Each
 * context of each modifier overrides a subset of the tokens. `order` lists the
 * modifiers by precedence.
 */
export type Theme<T extends Template> = {
  id: string;
  name: string;
  tokens: { [K in Token<T>]: Definition };
  modifiers: Modifiers<T>;
  order: Modifier<T>[];
};

/**
 * A partial overlay of a theme. All members are optional. Each member must
 * belong to the contract. A token binding replaces the `$value` of the slot. A
 * context override replaces the same binding of the context. An identity or an
 * order replaces the one of the theme.
 */
export type Patch<T extends Template> = {
  id?: string;
  name?: string;
  tokens?: Overrides<T>;
  modifiers?: { [M in Modifier<T>]?: { [C in Context<T, M>]?: Overrides<T> } };
  order?: Modifier<T>[];
};

/**
 * A {@link Patch} with an identity. A layer is a theme that a caller applies as
 * a whole.
 */
export type Layer<T extends Template> = Patch<T> & {
  id: string;
  name: string;
};

/**
 * The failure codes of a rule. Each predicate atom returns one code. The
 * combinators return the structural codes `unknown_key` and `missing_key` and
 * the alternation code `no_match`.
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
 * A validation failure. `code` identifies the failure. `message` is readable
 * text. `path` holds the keys from the root to the failure, which the
 * combinators add. `expected` holds the value that the contract requires.
 * `received` holds the value that failed.
 */
export type Issue = {
  code: Code;
  message: string;
  path?: string[];
  expected?: unknown;
  received?: unknown;
};

/**
 * A validation rule. The rule returns an {@link Issue} for an invalid value.
 * The rule returns `undefined` for a valid value.
 */
export type Rule = (v: unknown) => Issue | undefined;

/**
 * The kinds of a template. Each kind maps to the type that a value of the kind
 * narrows to. The scalar kinds are `modifier`, `value`, `token`, `reference`,
 * `binding`, and `definition`. The composite kinds are `overrides`, `tokens`,
 * `modifiers`, `order`, `input`, `theme`, `layer`, and `patch`.
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

/**
 * The name of a kind. A kind is a key of {@link Domain}.
 */
export type Kind = keyof Domain<Template>;

/**
 * A reserved member of a token definition.
 */
export type DefinitionKey = (typeof DEFINITION_KEYS)[number];

/**
 * A member that every token definition must have.
 */
export type RequiredDefinitionKey = (typeof REQUIRED_DEFINITION_KEYS)[number];

/**
 * A member that a complete theme object must have.
 */
export type ThemeKey = (typeof THEME_KEYS)[number];

/**
 * The sets that the schema reads. The contract members come from the template.
 * They are the token names, the modifier axes, the contexts of each axis, and
 * the declared type of each token. The specification members are the same for
 * all templates.
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
 * The literal rule and the value rule for each token type. `literal` checks
 * the structured form, such as a color object, a dimension, or a shadow.
 * `value` accepts a reference to a token of that type or the literal.
 */
export type Shape = {
  [Y in Type]: {
    /* The structured form, such as a color object, a dimension, or a shadow. */
    literal: Rule;

    /* A reference to a token of this type, or the literal value. */
    value: Rule;
  };
};

/**
 * A list of {@link Rule}s for each kind. The lists use the atoms in `util`. A
 * value is valid for a kind when every rule of the kind returns no
 * {@link Issue}.
 */
export type Rules = { [K in Kind]: Rule[] };

/**
 * The validation core of a template. The core has the sets from the contract,
 * the rules for each token type, and the rule lists for each kind. Each part
 * uses the part before it. The check, assert, parse, and inspect bundles read
 * the template through the core.
 */
export type Meta<T extends Template> = {
  /* The sets of the contract members and the specification members. */
  enums: Enum<T>;

  /* The literal rule and the value rule for each token type. */
  shape: Shape;

  /* The rules for each kind. */
  rules: Rules;
};

/**
 * A boolean type predicate for each kind. A `true` result narrows the value to
 * the type of the kind. Use {@link Assert} or {@link Parse} to get the issues.
 */
export type Check<T extends Template> = {
  [K in Kind]: (v: unknown) => v is Domain<T>[K];
};

/**
 * An assertion function for each kind. The function returns when the value is
 * valid for the kind. The function throws a {@link SchemaError} with every
 * {@link Issue} when the value is not valid.
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
 * A parse function for each kind. The function returns the value narrowed to
 * the type of the kind. The {@link SchemaError} from {@link Assert} propagates
 * to the caller. Use the functions at trust boundaries, as in
 * `const theme = parse.theme(await res.json())`.
 */
export type Parse<T extends Template> = {
  [K in Kind]: (v: unknown) => Domain<T>[K];
};

/**
 * The outcome of an {@link Inspect}. A success result holds the value narrowed
 * to the type of the kind. A failure result holds the {@link Issue}s.
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
 * An inspect function for each kind. The function returns a {@link Result}. A
 * success result holds the narrowed value. A failure result holds the issues.
 */
export type Inspect<T extends Template> = {
  [K in Kind]: (v: unknown) => Result<Domain<T>[K]>;
};

/**
 * The bundle that {@link defineSchema} returns for a template. The bundle has
 * the base template and the {@link Meta} of the template. `meta` holds the
 * sets, the {@link Shape} rules for each type, and the {@link Rules} for each
 * kind. The bundle also has the {@link Check}, {@link Assert}, {@link Parse},
 * and {@link Inspect} bundles.
 */
export type Schema<T extends Template> = {
  base: T;
  meta: Meta<T>;
  check: Check<T>;
  assert: Assert<T>;
  parse: Parse<T>;
  inspect: Inspect<T>;
};
