import type { Issue, Rule } from "./types";

import { object, wrapped } from "objectively";

/**
 * Whether a value is a reference in curly-brace syntax: a string wrapped in
 * `{` and `}`.
 */
const isReference = wrapped("{", "}");

/**
 * Type-agnostic rule builders. Each builder takes a name plus parameters and
 * returns a {@link Rule}; none of them know anything about a template or its
 * token unions. Predicate atoms each own a single failure code; combinators
 * compose other rules and attach `path` as they descend.
 */

/**
 * Prefixes a nested issue's path with the key it was found under.
 */
export const nest = (key: string, issue: Issue): Issue => ({
  ...issue,
  path: [key, ...(issue.path ?? [])],
});

/**
 * The token name inside a `{name}` reference, or `undefined` when not one.
 */
export const target = (v: unknown): string | undefined => {
  if (isReference(v)) {
    return v.slice(1, -1);
  }
  return undefined;
};

/**
 * Every token a value references, gathered by walking the whole value: a
 * `{name}` reference contributes its name, arrays and objects contribute the
 * references nested in their entries, and everything else contributes none.
 */
export const collectRefs = (v: unknown): string[] => {
  const name = target(v);
  if (name !== undefined) {
    return [name];
  }
  if (Array.isArray(v)) {
    return v.flatMap(collectRefs);
  }
  if (object(v)) {
    return Object.values(v).flatMap(collectRefs);
  }
  return [];
};

/* ── predicate atoms ─────────────────────────────────────────────────── */

/**
 * The value is a string.
 */
export const text =
  (name: string): Rule =>
  (v) => {
    if (typeof v !== "string") {
      return {
        code: "not_string",
        message: `${name} must be a string.`,
        received: v,
      };
    }
  };

/**
 * A string value is not empty once trimmed.
 */
export const filled =
  (name: string): Rule =>
  (v) => {
    if (typeof v === "string" && v.trim() === "") {
      return {
        code: "empty",
        message: `${name} must not be empty.`,
        received: v,
      };
    }
  };

/**
 * A string value contains no sequence that escapes its CSS declaration.
 */
export const breakout =
  (name: string, pattern: RegExp): Rule =>
  (v) => {
    if (typeof v === "string" && pattern.test(v)) {
      return {
        code: "css_breakout",
        message: `${name} must not contain CSS breakout sequences.`,
        expected: pattern.source,
        received: v,
      };
    }
  };

/**
 * A string value is a hex color: `#` plus 3, 4, 6, or 8 hex digits.
 */
export const hexColor =
  (name: string): Rule =>
  (v) => {
    if (
      typeof v === "string" &&
      !/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)
    ) {
      return {
        code: "not_hex",
        message: `${name} must be '#' followed by 3, 4, 6, or 8 hex digits.`,
        received: v,
      };
    }
  };

/**
 * The value is a member of the allowed set.
 */
export const member =
  (name: string, set: Set<string>): Rule =>
  (v) => {
    if (typeof v !== "string" || !set.has(v)) {
      return {
        code: "not_member",
        message: `${name} must be a member of the known set.`,
        expected: [...set],
        received: v,
      };
    }
  };

/**
 * The value is a finite number.
 */
export const numeric =
  (name: string): Rule =>
  (v) => {
    if (typeof v !== "number" || !Number.isFinite(v)) {
      return {
        code: "not_number",
        message: `${name} must be a finite number.`,
        received: v,
      };
    }
  };

/**
 * A numeric value falls within the inclusive range.
 */
export const range =
  (name: string, min: number, max: number): Rule =>
  (v) => {
    if (typeof v === "number" && (v < min || v > max)) {
      return {
        code: "out_of_range",
        message: `${name} must be between ${min} and ${max}.`,
        expected: [min, max],
        received: v,
      };
    }
  };

/**
 * The value is one the caller's predicate accepts for its declared type.
 */
export const mismatch =
  (name: string, ok: (v: unknown) => boolean): Rule =>
  (v) => {
    if (!ok(v)) {
      return {
        code: "type_mismatch",
        message: `${name} is not a valid ${name}.`,
        received: v,
      };
    }
  };

/**
 * The value is a member of the known type set.
 */
export const known =
  (name: string, set: Set<string>): Rule =>
  (v) => {
    if (typeof v !== "string" || !set.has(v)) {
      return {
        code: "unknown_type",
        message: `${name} must be a known token type.`,
        expected: [...set],
        received: v,
      };
    }
  };

/**
 * The value is a reference to a member of the set, in `{name}` form.
 */
export const reference =
  (name: string, tokens: Set<string>): Rule =>
  (v) => {
    const token = target(v);
    if (token === undefined || !tokens.has(token)) {
      return {
        code: "not_reference",
        message: `${name} must reference a known token as {name}.`,
        expected: [...tokens],
        received: v,
      };
    }
  };

/**
 * A reference names a token whose declared type matches the one expected in
 * this position. Runs only once the value is known to reference an existing
 * token; a whole-value or sub-value slot uses it to reject cross-type aliases.
 */
export const referenceType =
  (name: string, types: Record<string, string>, expected: string): Rule =>
  (v) => {
    const token = target(v);
    if (token === undefined) {
      return;
    }
    const actual = types[token];
    if (actual !== undefined && actual !== expected) {
      return {
        code: "type_mismatch",
        message: `${name} must reference a ${expected} token, but {${token}} is a ${actual} token.`,
        expected,
        received: v,
      };
    }
  };

/**
 * The value is a plain object.
 */
export const container =
  (name: string): Rule =>
  (v) => {
    if (!object(v)) {
      return {
        code: "not_object",
        message: `${name} must be an object.`,
        received: v,
      };
    }
  };

/* ── combinator atoms ────────────────────────────────────────────────── */

/**
 * Runs the rules in order and returns the first issue any of them raises.
 */
export const all =
  (rules: Rule[]): Rule =>
  (v) => {
    for (const rule of rules) {
      const issue = rule(v);
      if (issue) {
        return issue;
      }
    }
  };

/**
 * Dispatches by shape: a `{name}` string is validated as a reference, anything
 * else as a literal value. The form a slot takes — an alias to another token,
 * or a structured value in place.
 */
export const valued =
  (asReference: Rule, asLiteral: Rule): Rule =>
  (v) => {
    if (isReference(v)) {
      return asReference(v);
    }
    return asLiteral(v);
  };

/**
 * The value satisfies at least one branch — every rule in that branch passes.
 * A value that matches no branch is rejected.
 */
export const either =
  (name: string, branches: Rule[][]): Rule =>
  (v) => {
    for (const branch of branches) {
      if (branch.every((rule) => rule(v) === undefined)) {
        return;
      }
    }
    return {
      code: "no_match",
      message: `${name} did not match any allowed form.`,
      received: v,
    };
  };

/**
 * Every key must belong to the allowed set; values are not inspected.
 */
export const subset =
  (name: string, set: Set<string>): Rule =>
  (v) => {
    if (!object(v)) {
      return;
    }
    for (const key of Object.keys(v)) {
      if (!set.has(key)) {
        return {
          code: "unknown_key",
          message: `${name} contains an unknown key '${key}'.`,
          path: [key],
          expected: [...set],
          received: key,
        };
      }
    }
  };

/**
 * Every key in the required set must be present.
 */
export const superset =
  (name: string, set: Set<string>): Rule =>
  (v) => {
    if (!object(v)) {
      return;
    }
    for (const key of set) {
      if (!(key in v)) {
        return {
          code: "missing_key",
          message: `${name} is missing required key '${key}'.`,
          path: [key],
          expected: [...set],
        };
      }
    }
  };

/**
 * An array's elements are distinct — no element appears twice.
 */
export const unique =
  (name: string): Rule =>
  (v) => {
    if (!Array.isArray(v)) {
      return;
    }
    const seen = new Set<unknown>();
    for (const [index, item] of v.entries()) {
      if (seen.has(item)) {
        return {
          code: "duplicate",
          message: `${name} lists '${String(item)}' more than once.`,
          path: [String(index)],
          received: item,
        };
      }
      seen.add(item);
    }
  };

/**
 * An array lists every member of the required set.
 */
export const exhaustive =
  (name: string, set: Set<string>): Rule =>
  (v) => {
    if (!Array.isArray(v)) {
      return;
    }
    for (const key of set) {
      if (!v.includes(key)) {
        return {
          code: "not_exhaustive",
          message: `${name} is missing '${key}'.`,
          expected: [...set],
          received: v,
        };
      }
    }
  };

/**
 * The value is an array whose every element satisfies the rules.
 */
export const list =
  (name: string, rules: Rule[]): Rule =>
  (v) => {
    if (!Array.isArray(v)) {
      return {
        code: "not_array",
        message: `${name} must be an array.`,
        received: v,
      };
    }
    for (const [index, item] of v.entries()) {
      for (const rule of rules) {
        const issue = rule(item);
        if (issue) {
          return nest(String(index), issue);
        }
      }
    }
  };

/**
 * Applies a list of rules to every value; keys are not inspected.
 */
export const each =
  (rules: Rule[]): Rule =>
  (v) => {
    if (!object(v)) {
      return;
    }
    for (const [key, value] of Object.entries(v)) {
      for (const rule of rules) {
        const issue = rule(value);
        if (issue) {
          return nest(key, issue);
        }
      }
    }
  };

/**
 * Applies a set of rules to every value, chosen per key by the picker.
 */
export const keyed =
  (pick: (key: string) => Rule[]): Rule =>
  (v) => {
    if (!object(v)) {
      return;
    }
    for (const [key, value] of Object.entries(v)) {
      for (const rule of pick(key)) {
        const issue = rule(value);
        if (issue) {
          return nest(key, issue);
        }
      }
    }
  };

/**
 * Applies a list of rules to every key; values are not inspected.
 */
export const keys =
  (name: string, rules: Rule[]): Rule =>
  (v) => {
    if (!object(v)) {
      return;
    }
    for (const key of Object.keys(v)) {
      for (const rule of rules) {
        const issue = rule(key);
        if (issue) {
          return nest(key, { ...issue, message: `${name}: ${issue.message}` });
        }
      }
    }
  };

/**
 * Each named field validated by its own rules; unknown fields are rejected.
 */
export const fields =
  (name: string, members: Record<string, Rule[]>): Rule =>
  (v) => {
    if (!object(v)) {
      return;
    }
    for (const key of Object.keys(v)) {
      if (!(key in members)) {
        return {
          code: "unknown_key",
          message: `${name} contains an unknown key '${key}'.`,
          path: [key],
          received: key,
        };
      }
    }
    for (const key of Object.keys(members)) {
      const rules = members[key];
      if (rules && key in v) {
        for (const rule of rules) {
          const issue = rule(v[key]);
          if (issue) {
            return nest(key, issue);
          }
        }
      }
    }
  };

/**
 * A named object whose fields validate by their own rules and whose required
 * keys must all be present. Composes the field-shape and required-key atoms so
 * a structured value declares both in one place.
 */
export const struct = (
  name: string,
  members: Record<string, Rule[]>,
  required: Set<string>,
): Rule => all([fields(name, members), superset(name, required)]);

/**
 * The reference graph is acyclic. Each map entry contributes edges to the
 * tokens its value references, gathered by `edges`; a chain of edges that
 * returns to a token already on the current path is a cycle, which resolves to
 * nothing in CSS. Every entry is walked once.
 */
export const acyclic =
  (
    name: string,
    tokens: Set<string>,
    edges: (entry: unknown) => string[],
  ): Rule =>
  (v) => {
    if (!object(v)) {
      return;
    }
    const graph = new Map<string, string[]>();
    for (const [key, entry] of Object.entries(v)) {
      graph.set(
        key,
        edges(entry).filter((token) => tokens.has(token)),
      );
    }
    const visiting = new Set<string>();
    const settled = new Set<string>();
    const trail: string[] = [];
    let cycle: string[] | undefined;
    const walk = (node: string) => {
      visiting.add(node);
      trail.push(node);
      for (const next of graph.get(node) ?? []) {
        if (cycle) {
          return;
        }
        if (visiting.has(next)) {
          cycle = [...trail.slice(trail.indexOf(next)), next];
          return;
        }
        if (!settled.has(next)) {
          walk(next);
        }
      }
      trail.pop();
      visiting.delete(node);
      settled.add(node);
    };
    for (const key of graph.keys()) {
      if (cycle) {
        break;
      }
      if (!settled.has(key)) {
        walk(key);
      }
    }
    if (cycle) {
      return {
        code: "cycle",
        message: `${name} contains a reference cycle: ${cycle.join(" → ")}.`,
        path: cycle.slice(0, 1),
        received: cycle,
      };
    }
  };
