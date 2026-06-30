# @untheme/schema

Types and runtime validation for untheme's token contract. Dependency-free.

A **template** declares the contract: which **tokens** exist, which **modifiers** (axes like `color`) exist and what **contexts** (options like `light`/`dark`) each carries, and the **order** modifiers compose in. `defineSchema` derives a validation bundle from a template, narrowed to its vocabulary. Use it to validate untrusted theme objects at runtime (e.g. JSON loaded from disk) — anything that passes is contract-bound and safe to render.

## The contract

- **tokens** — the base map: every token name to its **binding**.
- **binding** — a token's value: a literal CSS **value** (`"#0090ff"`, `"3px"`), or a **reference** to another token in curly-brace form (`"{accent}"`), which survives into CSS as `var(--accent)`.
- **modifiers** — axes of mutually exclusive **contexts**, each context carrying a partial set of token overrides (e.g. a `color` modifier with `light` and `dark` contexts).
- **order** — the precedence in which active contexts compose over the base.

## Usage

```ts
import { defineSchema } from "@untheme/schema";

const schema = defineSchema(template);

const candidate = await res.json();

// boolean predicate — narrows on `true`
if (!schema.check.theme(candidate)) throw new Error("not a valid theme");

// throws a SchemaError listing every issue
schema.assert.theme(candidate);

// throws, or returns the value narrowed — handy at trust boundaries
const theme = schema.parse.theme(candidate);

// non-throwing — returns { success, data } | { success, issues }
const result = schema.inspect.theme(candidate);
```

## Kinds

The bundle validates one **kind** at a time. Scalars:

- `value` — a containment-safe literal CSS value.
- `token` — a token name.
- `reference` — a `{token}` reference to a known token.
- `binding` — a reference or a value.
- `modifier` — a modifier (axis) name.

Composites:

- `overrides` — a partial token map (what a context, layer, or patch carries).
- `tokens` — the complete base map: every token present, each value a binding, no reference cycles.
- `modifiers` — every modifier with its full set of contexts, each a valid overrides map.
- `order` — an array of modifier names.
- `input` — a selection of one context per modifier (`{ color: "dark" }`).
- `theme` — a complete template: tokens, modifiers, and order all present and valid.
- `layer` — a partial overlay carrying identity (`id`, `name`); anything present must belong to the contract.
- `patch` — a partial, anonymous overlay (no identity).

## Value containment

`value` validates **containment, not vocabulary**. Browsers ignore invalid declarations, so a value doesn't need to be meaningful CSS — it only needs to be unable to escape the declaration it's interpolated into. Rejected:

- breakout sequences: `;`, `{`, `}`, backslash escapes, `/*`, `</`, and `url(` in any casing
- unbalanced parens and unclosed quotes
- non-strings and blank strings

Because `{` and `}` are rejected, a `{token}` reference is never a valid literal value — the two are unambiguous.

## The bundle

`defineSchema(template)` returns a `Schema<T>`:

- `base` — the source template.
- `rules` — the derived `sets` (token / modifier / per-modifier context `Set`s) and the list of rules per kind.
- `check` — boolean type predicates per kind; `true` narrows the value.
- `assert` — throwing assertions per kind; on failure throws a `SchemaError` carrying every `Issue` found (not just the first).
- `parse` — asserts and returns the value narrowed to its kind type.
- `inspect` — the non-throwing analog of `parse`: returns a `Result` (`{ success: true, data }` | `{ success: false, issues }`).

The base template is validated against the `theme` kind at construction, so a malformed contract fails fast.

## Types

- `Template` — the contract; its keys define tokens, modifiers, and contexts.
- `Token<T>` / `Modifier<T>` / `Context<T, M>` — names derived from a template.
- `Binding<T>` / `Reference<T>` / `Value` — a token's value; a `{token}` reference; a literal CSS value.
- `Overrides<T>` / `Modifiers<T>` / `Input<T>` — a partial token map; the full modifier structure; a per-modifier context selection.
- `Theme<T>` / `Layer<T>` / `Patch<T>` — the candidate shapes the kinds narrow to.
- `Contract<Tok, Mod>` — a template parameterized by its token union and modifier structure, for inference and `extend`.
- `Domain<T>` — every kind mapped to the type it narrows to; `Kind` is its key.
- `Schema<T>` — the bundle `defineSchema` returns; `Check<T>` / `Assert<T>` / `Parse<T>` / `Inspect<T>` / `Rules<T>` are its families.
- `Result<V>` — an `inspect` outcome.
- `Issue` / `Code` / `Rule` — a validation failure, its stable discriminant, and a type-agnostic rule.
- `SchemaError` — the error `assert` and `parse` throw, carrying the concrete `Issue`s.

## Related

- [`@untheme/core`](../core) — the runtime theme service built on this schema.
- [`untheme`](../untheme) — umbrella package re-exporting core and schema.
