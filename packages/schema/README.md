# @untheme/schema

Types and runtime validation for the untheme token contract. The validation
uses the guards of [`objectively`](https://www.npmjs.com/package/objectively).

## Install

```sh
pnpm add @untheme/schema
```

## The contract

A **template** declares the contract. It names the **tokens**, the
**modifiers**, the **contexts** of each modifier, and the **order** of the
modifiers. A modifier is an axis, such as `color`. A context is an option of a
modifier, such as `light` or `dark`.

- **tokens** is the base map. It maps each token name to its **binding**.
- A **binding** is a literal CSS **value**, such as `"#0090ff"` or `"3px"`. A
  binding can also be a **reference** to another token, such as `"{accent}"`.
  A reference renders in CSS as `var(--accent)`.
- **modifiers** are axes of exclusive **contexts**. Each context holds a
  partial set of token overrides.
- **order** is the sequence in which the active contexts compose over the base.

## defineSchema

`defineSchema(template)` returns a `Schema<T>`. The schema validates untrusted
data against the vocabulary of the template. Data that passes is bound to the
contract.

```ts
import { defineSchema } from "@untheme/schema";

const schema = defineSchema(template);

const candidate = await res.json();

// Returns a boolean. The type of the value narrows on `true`.
if (!schema.check.theme(candidate)) throw new Error("not a valid theme");

// Throws a SchemaError that lists every issue.
schema.assert.theme(candidate);

// Throws on an invalid value. Returns the value with its narrowed type.
const theme = schema.parse.theme(candidate);

// Returns { success: true, data } or { success: false, issues }.
const result = schema.inspect.theme(candidate);
```

The function checks the template against the `theme` kind. An invalid template
throws when you call `defineSchema`.

The `Schema<T>` has these members:

- `base` is the template.
- `meta` is the validation core. It has `enums`, the sets of the contract and
  the specification. It has `shape`, the literal rule and the value rule of
  each token type. It has `rules`, the rule list of each kind.
- `check` has one boolean predicate for each kind.
- `assert` has one assertion for each kind. A failed assertion throws a
  `SchemaError` that holds every `Issue`.
- `parse` asserts a value and returns it with the type of its kind.
- `inspect` returns a `Result` for each kind.

## Kinds

Each member of `check`, `assert`, `parse`, and `inspect` validates one **kind**.

The scalar kinds are:

- `value` is a literal that matches a shape of a token type.
- `token` is a token name.
- `reference` is a `{token}` reference to a known token.
- `binding` is a reference or a value.
- `definition` is a full token definition. It requires `$type` and `$value`.
  It accepts `$description`, `$deprecated`, and `$extensions`. The `$value`
  must match the shape of the declared `$type`.
- `modifier` is a modifier name.

The composite kinds are:

- `overrides` is a partial token map. A context, a layer, or a patch holds it.
- `tokens` is the complete base map. Each token is present and each value is a
  binding. The references form no cycle.
- `modifiers` holds every modifier with its full set of contexts. Each context
  is a valid overrides map.
- `order` is an array of modifier names.
- `input` selects one context for each modifier, such as `{ color: "dark" }`.
- `theme` is a complete template. It holds valid tokens, modifiers, and order.
- `layer` is a partial overlay with an identity, `id` and `name`. Each part
  that is present must belong to the contract.
- `patch` is a partial overlay with no identity.

## Value validation

The `value` kind checks the shape of a literal. A literal passes when it
matches at least one of the 13 DTCG type shapes. The types are `color`,
`dimension`, `duration`, `fontFamily`, `fontWeight`, `number`, `cubicBezier`,
`strokeStyle`, `border`, `transition`, `shadow`, `gradient`, and `typography`.

The schema rejects a token name or a font-family string that contains one of
these sequences:

- `;`, `{`, `}`, or a backslash
- `/*` or `</`
- `url(` in any letter case

A `{token}` reference matches the `reference` kind. A token name and a
font-family string reject the `{` and `}` characters.

## Types

- `Template` is the contract. Its keys define the tokens, the modifiers, and
  the contexts.
- `Token<T>`, `Modifier<T>`, and `Context<T, M>` are names from a template.
- `Binding<T>` is the value of a token. `Reference<T>` is a `{token}`
  reference. `Values<R>` is the value shape of each DTCG type. The parameter
  `R` is `Open` or `Literal`. `Open` admits a `{token}` string for each type.
  `Literal` admits no reference.
- `Overrides<T>` is a partial token map. `Modifiers<T>` is the full modifier
  structure. `Input<T>` is a selection of one context for each modifier.
- `Theme<T>`, `Layer<T>`, and `Patch<T>` are the shapes that the kinds narrow
  to.
- `Contract<Tok, Mod>` is a template with a token union and a modifier
  structure as parameters. The declarations that
  [`@untheme/kit`](../kit) generates use it to name a built theme.
- `Domain<T>` maps each kind to the type that the kind narrows to. `Kind` is
  the union of its keys.
- `Schema<T>` is the bundle that `defineSchema` returns. `Check<T>`,
  `Assert<T>`, `Parse<T>`, and `Inspect<T>` are its families of functions.
  `Rules` is the shape of the rule lists.
- `Result<V>` is the outcome of `inspect`.
- `Issue` is a validation failure. `Code` is the discriminant of an issue.
  `Rule` is a function that checks a value and returns an issue.
- `SchemaError` is the error that `assert` and `parse` throw. It holds the
  `Issue` list.

## Related

- [`@untheme/core`](../core) is the runtime theme service that uses this
  schema.
- [`untheme`](../untheme) re-exports core and schema.
