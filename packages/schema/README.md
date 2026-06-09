# @untheme/schema

Runtime [zod](https://zod.dev) schemas for untheme's token contract.

Given a theme's reference, system, and role token names as arrays, `createUnthemeSchema`
builds a bundle of zod validators that mirror untheme's three-tier model — and enforce the
relationships between tiers that the type system expresses with `NoInfer`. Use these to
validate untrusted theme objects at runtime (e.g. JSON loaded from disk) instead of the
`Untheme` instance typeguards.

## Usage

```ts
import { createUnthemeSchema } from "@untheme/schema";

const schema = createUnthemeSchema(
  ["bg", "accent-9", "radius-1"], // reference tokens
  ["surface", "solid", "text"], // system tokens
  ["brand", "danger"], // role tokens
);

const result = schema.preset.safeParse(await res.json());
if (!result.success) throw new Error(result.error.message);
```

## What it validates

The three tiers are validated by their value constraints:

- **reference** tokens hold a raw **CSS value** (`cssValue`).
- **system** tokens, per mode (`light`/`dark`), must alias a real **reference** token (`ref`).
- **role** tokens must alias a real reference **or** system token (`ref | sys`).

Reference, mode, and role records are **exhaustive**: every declared key must be present, and
unknown keys are rejected. A system token aliasing a non-reference value (a dangling alias)
fails with the exact path, e.g. `modes.dark.text`; a dangling role fails at `roles.brand`.

## `preset` vs `theme`

- `schema.preset` validates a theme **without** roles — the shape a preset ships and the shape
  of the raw theme layers swapped at runtime.
- `schema.theme` extends `preset` with the required `roles` record — a complete theme.

## CSS value validation

`cssValue` validates reference values against a union of common CSS types via
[`css-tree`](https://github.com/csstree/csstree) — colors, lengths, times, numbers,
multi-layer shadows, easing functions, and font-family lists. Structurally invalid CSS
(`#ggg`, unbalanced functions, empty strings) is rejected.

To tighten a specific token to a single CSS type, use `cssType`:

```ts
import { cssType } from "@untheme/schema";

const color = cssType("color");
color.parse("#0090ff"); // ok
color.parse("#ggg"); // throws
```

## The bundle

`createUnthemeSchema` returns:

| Field    | Schema                              | Validates                        |
| -------- | ----------------------------------- | -------------------------------- |
| `ref`    | `z.enum(reference)`                 | a reference token name           |
| `sys`    | `z.enum(system)`                    | a system token name              |
| `role`   | `z.enum(roles)`                     | a role token name                |
| `preset` | `z.object({ …, reference, modes })` | a theme definition without roles |
| `theme`  | `preset.extend({ roles })`          | a complete theme definition      |

Within them, `reference` is `z.record(ref, cssValue)`, each mode is `z.record(sys, ref)`, and
`roles` is `z.record(role, z.union([ref, sys]))`.
