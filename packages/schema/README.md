# @untheme/schema

Types and runtime guards for untheme's token contract. Dependency-free.

A **template** declares the token contract: which reference, system, and role tokens exist. `defineSchema` derives a bundle of type guards from a template, narrowed to its token vocabulary. Use them to validate untrusted theme objects at runtime (e.g. JSON loaded from disk) — anything that passes is contract-bound and safe to render.

## Token tiers

- **reference** tokens hold a raw CSS **value** (`"#0090ff"`, `"3px"`).
- **system** tokens alias a **reference** token, per color mode (`light`/`dark`).
- **role** tokens alias a **reference or system** token.

## Usage

```ts
import { defineSchema } from "@untheme/schema";

const schema = defineSchema(template);

const candidate = await res.json();
if (!schema.theme(candidate)) throw new Error("not a valid theme");
```

## The guard chain

The structural guards build on each other:

- `template` — shape: identity strings plus token records keyed by known token names. Per-tier key placement is not checked yet.
- `layer` — a template whose keys all belong to their own tier and whose values satisfy each tier's rule: reference holds containment-safe values, system aliases references, roles alias either. Tokens may be omitted.
- `theme` — a layer that is also complete: every contract token present, with light and dark structurally identical.

`patch` stands apart: an anonymous set of overrides where every facet (and each mode) is optional, but anything present must stay within the contract. Unlike a layer, a patch carries no identity.

## Value containment

`value` validates **containment, not vocabulary**. Browsers ignore invalid declarations, so a value doesn't need to be meaningful CSS — it only needs to be unable to escape the declaration it's interpolated into. Rejected:

- breakout sequences: `;`, `{`, `}`, backslash escapes, `/*`, `</`, and `url(` in any casing
- unbalanced parens and unclosed quotes
- non-strings and blank strings

## The bundle

`defineSchema(template)` returns a `Schema<T>` of type guards:

| Guard       | Checks                                                       |
| ----------- | ------------------------------------------------------------ |
| `mode`      | a supported color mode (`"light"` \| `"dark"`)               |
| `value`     | a containment-safe CSS value                                 |
| `reference` | a reference token name                                       |
| `system`    | a system token name (either mode)                            |
| `role`      | a role token name                                            |
| `alias`     | a name a role may point to: reference or system              |
| `token`     | any token name                                               |
| `tokens`    | a record of known token names holding aliases or raw values  |
| `template`  | a template-shaped object                                     |
| `patch`     | a partial, contract-bound set of overrides                   |
| `layer`     | a contract-bound overlay (tokens may be omitted)             |
| `theme`     | a complete, mode-balanced instantiation of the template      |

## Types

- `Template` — the token contract; its keys define which tokens exist.
- `Contract<Ref, Sys, Rol>` — a template parameterized by its token name unions, for call sites that infer the contract from a literal theme. `NoInfer` keeps system and role values anchored to names declared elsewhere in the contract.
- `Layer<T>` / `Theme<T>` / `Patch<T>` — the candidate shapes the guards narrow to.
- `Reference<T>` / `System<T>` / `Role<T>` / `Alias<T>` / `Token<T>` — token name unions derived from a template.
- `Tokens<T>` — the flat token map for a template.
- `Mode` / `Value` — a color mode; a raw CSS value.

## Related

- [`@untheme/core`](../core) — the runtime theme service built on these guards.
- [`untheme`](../untheme) — umbrella package re-exporting core and schema.
