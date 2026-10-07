import type { Issue, Rule } from "./types";

import { object, wrapped } from "objectively";

/**
 * Checks that a value is a reference. A reference is a string in `{` and `}`.
 */
const isReference = wrapped("{", "}");

/**
 * Rule builders. Each builder takes a name and parameters and returns a
 * {@link Rule}. Each predicate atom returns one failure code. Each combinator
 * runs other rules and adds `path` to the issues from them.
 */

/**
 * Adds the key to the start of the path of an issue.
 */
export const nest = (key: string, issue: Issue): Issue => ({
  ...issue,
  path: [key, ...(issue.path ?? [])],
});

/**
 * Returns the token name in a `{name}` reference. Returns `undefined` when the
 * value is not a reference.
 */
export const target = (v: unknown): string | undefined => {
  if (isReference(v)) {
    return v.slice(1, -1);
  }
  return undefined;
};

/**
 * Returns the name of each token that a value references. The function reads
 * the name from a `{name}` reference. The function reads the references in the
 * entries of an array or an object. All other values have no names.
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
 * Rejects a value that is not a string.
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
 * Rejects a string that is empty after trim.
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
 * Rejects a string that matches the breakout pattern.
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
 * Rejects a string that is not a hex color. A hex color is `#` and 3, 4, 6, or 8
 * hex digits.
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
 * Rejects a value that is not a member of the set.
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
 * Rejects a value that is not a finite number.
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
 * Rejects a number that is outside the range. The range includes `min` and
 * `max`.
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
 * Rejects a value when the predicate `ok` returns `false`.
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
 * Rejects a value that is not a member of the set of token types.
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
 * Rejects a value that is not a `{name}` reference to a member of the set.
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
 * Rejects a reference to a token of a type other than the expected type. The
 * rule accepts a value that is not a reference. The rule accepts a reference
 * to a token with no known type.
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
 * Rejects a value that is not a plain object.
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
 * Runs the rules in order and returns the first issue.
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
 * Checks a `{name}` string with the reference rule. The function checks all
 * other values with the literal rule.
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
 * Accepts a value when every rule of at least one branch passes. The rule
 * rejects a value that matches no branch.
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
 * Rejects an object that has a key outside the set. The rule checks the keys
 * only.
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
 * Rejects an object that lacks a key of the set.
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
 * Rejects an array that has a duplicate element.
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
 * Rejects an array that lacks a member of the set.
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
 * Rejects a value that is not an array. The rule applies the rules to each
 * element.
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
 * Applies the rules to each value of an object.
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
 * Applies the rules that `pick` returns for the key to each value of an
 * object.
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
 * Applies the rules to each key of an object.
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
 * Applies the rules of each named field to its value. The rule rejects a key
 * that has no rules.
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
 * Checks an object with the rules of each field. The rule rejects an object
 * that lacks a required key.
 */
export const struct = (
  name: string,
  members: Record<string, Rule[]>,
  required: Set<string>,
): Rule => all([fields(name, members), superset(name, required)]);

/**
 * Rejects an object with a reference cycle. The function reads the edges of
 * each entry with `edges`. An edge points to a token that the value of the
 * entry references. A chain of edges that returns to a token on the current
 * path is a cycle. The function visits each entry once.
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
