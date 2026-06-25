# @untheme/schema

Types and runtime validation for untheme's token contract. Dependency-free.

A **template** declares the token contract: which reference, system, and role tokens exist. `defineSchema` derives a validation bundle from a template, narrowed to its token vocabulary. Use it to validate untrusted theme objects at runtime (e.g. JSON loaded from disk) — anything that passes is contract-bound and safe to render.

## Token tiers

- **reference** tokens hold a raw CSS **value** (`"#0090ff"`, `"3px"`).
- **system** tokens alias a **reference** token, per color mode (`light`/`dark`).
- **role** tokens alias a **reference or system** token.

## Usage

```ts
import { defineSchema } from "@untheme/schema";

const schema = defineSchema(template);

const candidate = await res.json();

// boolean predicate — narrows on `true`
if (!schema.guard.theme(candidate)) throw new Error("not a valid theme");

// throws a SchemaError listing every issue
schema.assert.theme(candidate);

// throws, or returns the value narrowed — handy at trust boundaries
const theme = schema.parse.theme(candidate);
```

## The structural tiers

The composite tiers build on each other, validating progressively more of the contract:

- `tokens` — the flat token map: a record keyed by token names where each value is checked against its key's tier (a reference key holds a value, a system key holds a reference name, a role key holds an alias name). Keys must be known; completeness is not required.
- `patch` — a nested, anonymous set of overrides: `reference`, `system` (per mode), and `roles` facets, each optional, but anything present must stay within the contract. A patch carries no identity.
- `layer` — a full-structured overlay: identity (`id`, `name`) plus both `system` modes present, all keys belonging to their own tier and all values satisfying that tier's rule. Individual tokens may be omitted.
- `theme` — a `layer` that is also complete: every contract token present, with light and dark structurally identical.

## Value containment

`value` validates **containment, not vocabulary**. Browsers ignore invalid declarations, so a value doesn't need to be meaningful CSS — it only needs to be unable to escape the declaration it's interpolated into. Rejected:

- breakout sequences: `;`, `{`, `}`, backslash escapes, `/*`, `</`, and `url(` in any casing
- unbalanced parens and unclosed quotes
- non-strings and blank strings

## The bundle

`defineSchema(template)` returns a `Schema<T>`:

- `base` — the source template.
- `lexicon` — the derived token-name `Set`s and the list of rules per tier.
- `guard` — boolean type predicates per tier; `true` narrows the value.
- `assert` — throwing assertions per tier; on failure throws a `SchemaError` carrying every `Issue` found (not just the first).
- `parse` — asserts and returns the value narrowed to its tier type.

Each of `guard`, `assert`, and `parse` has one entry per tier:

| Tier        | Validates                                                     |
| ----------- | ------------------------------------------------------------- |
| `mode`      | a supported color mode (`"light"` \| `"dark"`)                |
| `value`     | a containment-safe CSS value                                  |
| `reference` | a reference token name                                        |
| `system`    | a system token name (defined in either mode)                  |
| `role`      | a role token name                                             |
| `alias`     | a name a role may point to: reference or system               |
| `token`     | any token name (reference, system, or role)                   |
| `tokens`    | a flat map keyed by token name, each value valid for its tier |
| `patch`     | a partial, contract-bound set of overrides (no identity)      |
| `layer`     | a full-structured overlay (individual tokens may be omitted)  |
| `theme`     | a complete, mode-balanced instantiation of the template       |

## Types

- `Template` — the token contract; its keys define which tokens exist.
- `Contract<Ref, Sys, Rol>` — a template parameterized by its token name unions, for call sites that infer the contract from a literal theme. `NoInfer` keeps system and role values anchored to names declared elsewhere in the contract.
- `Layer<T>` / `Theme<T>` / `Patch<T>` / `Tokens<T>` — the candidate shapes the tiers narrow to.
- `Reference<T>` / `System<T>` / `Role<T>` / `Alias<T>` / `Token<T>` — token name unions derived from a template.
- `Domain<T>` — every tier mapped to the type it narrows to; `Tier` is its key.
- `Schema<T>` — the bundle `defineSchema` returns; `Guard<T>` / `Assert<T>` / `Parse<T>` / `Lexicon<T>` are its families.
- `Issue` / `Code` / `Rule` — a validation failure, its stable discriminant, and a type-agnostic rule.
- `Mode` / `Value` / `Section` — a color mode; a raw CSS value; a template key.
- `SchemaError` — the error `assert` and `parse` throw, carrying the concrete `Issue`s.

## Related

- [`@untheme/core`](../core) — the runtime theme service built on this schema.
- [`untheme`](../untheme) — umbrella package re-exporting core and schema.
