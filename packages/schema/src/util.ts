import type { Issue, Rule } from "./types";

/**
 * Type-agnostic rule builders. Each util accepts a name plus parameters and
 * returns a {@link Rule}; none of them know anything about a template or its
 * token unions. Predicate atoms each own a single failure code; combinators
 * compose other rules and attach `path` as they descend.
 */

/** Narrows to a plain, non-array object so combinators can index it. */
const record = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Prefixes a nested issue's path with the key it was found under. */
const nest = (key: string, issue: Issue): Issue => ({
  ...issue,
  path: [key, ...(issue.path ?? [])],
});

/* ── predicate atoms ─────────────────────────────────────────────────── */

/** The value is a string. */
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

/** A string value is not empty once trimmed. */
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

/** A string value contains no sequence that escapes its CSS declaration. */
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

/** A string value keeps its parentheses and quotes balanced. */
export const balanced =
  (name: string): Rule =>
  (v) => {
    if (typeof v !== "string") {
      return;
    }
    let depth = 0;
    let quote = "";
    for (const c of v) {
      if (quote) {
        if (c === quote) {
          quote = "";
        }
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === "(") {
        depth += 1;
      } else if (c === ")") {
        depth -= 1;
        if (depth < 0) {
          break;
        }
      }
    }
    if (depth !== 0 || quote !== "") {
      return {
        code: "unbalanced",
        message: `${name} must keep its parentheses and quotes balanced.`,
        received: v,
      };
    }
  };

/** The value is a member of the allowed set. */
export const member =
  (name: string, tokens: Set<string>): Rule =>
  (v) => {
    if (typeof v !== "string" || !tokens.has(v)) {
      return {
        code: "not_member",
        message: `${name} must be a member of the known set.`,
        expected: [...tokens],
        received: v,
      };
    }
  };

/** The value is a plain object. */
export const container =
  (name: string): Rule =>
  (v) => {
    if (!record(v)) {
      return {
        code: "not_object",
        message: `${name} must be an object.`,
        received: v,
      };
    }
  };

/* ── combinator atoms ────────────────────────────────────────────────── */

/** Every key must belong to the allowed set; values are not inspected. */
export const subset =
  (name: string, tokens: Set<string>): Rule =>
  (v) => {
    if (!record(v)) {
      return;
    }
    for (const key of Object.keys(v)) {
      if (!tokens.has(key)) {
        return {
          code: "unknown_key",
          message: `${name} contains an unknown key '${key}'.`,
          path: [key],
          expected: [...tokens],
          received: key,
        };
      }
    }
  };

/** Applies a list of rules to every value; keys are not inspected. */
export const each =
  (rules: Rule[]): Rule =>
  (v) => {
    if (!record(v)) {
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

/** Each named field validated by its own rules; unknown fields are rejected. */
export const shape =
  (name: string, fields: Record<string, Rule[]>): Rule =>
  (v) => {
    if (!record(v)) {
      return;
    }
    for (const key of Object.keys(v)) {
      if (!(key in fields)) {
        return {
          code: "unknown_key",
          message: `${name} contains an unknown key '${key}'.`,
          path: [key],
          received: key,
        };
      }
    }
    for (const key of Object.keys(fields)) {
      const rules = fields[key];
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

/** Every key in the required set must be present. */
export const superset =
  (name: string, tokens: Set<string>): Rule =>
  (v) => {
    if (!record(v)) {
      return;
    }
    for (const key of tokens) {
      if (!(key in v)) {
        return {
          code: "missing_key",
          message: `${name} is missing required key '${key}'.`,
          path: [key],
          expected: [...tokens],
        };
      }
    }
  };

/**
 * A map whose value-rule is chosen by which set the key belongs to. The
 * heterogeneous companion to {@link each}, used for the flat tokens map where
 * a reference key holds a value, a system key holds a reference, and a role
 * key holds an alias. A key matching no route is rejected.
 */
export const dispatch =
  (name: string, routes: { set: Set<string>; rules: Rule[] }[]): Rule =>
  (v) => {
    if (!record(v)) {
      return;
    }
    for (const [key, value] of Object.entries(v)) {
      const route = routes.find((r) => r.set.has(key));
      if (!route) {
        return {
          code: "unknown_key",
          message: `${name} contains an unknown key '${key}'.`,
          path: [key],
          received: key,
        };
      }
      for (const rule of route.rules) {
        const issue = rule(value);
        if (issue) {
          return nest(key, issue);
        }
      }
    }
  };
