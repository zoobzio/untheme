import type { Issue, Rule } from "./types";

/**
 * Type-agnostic rule builders. Each builder takes a name plus parameters and
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

/** The token name inside a `{name}` reference, or `undefined` when not one. */
const target = (v: unknown): string | undefined => {
  if (typeof v === "string" && v.startsWith("{") && v.endsWith("}")) {
    return v.slice(1, -1);
  }
  return undefined;
};

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

/** The value is a reference to a member of the set, in `{name}` form. */
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

/**
 * The value satisfies at least one branch — every rule in that branch passes.
 * The form a binding takes: a known token name, or a literal value. A value that
 * matches no branch is rejected.
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
      message: `${name} must be a known token reference or a valid value.`,
      received: v,
    };
  };

/** Every key must belong to the allowed set; values are not inspected. */
export const subset =
  (name: string, set: Set<string>): Rule =>
  (v) => {
    if (!record(v)) {
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

/** Every key in the required set must be present. */
export const superset =
  (name: string, set: Set<string>): Rule =>
  (v) => {
    if (!record(v)) {
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

/** The value is an array whose every element satisfies the rules. */
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

/**
 * The reference graph is acyclic. A key whose value names another token in the
 * set forms an edge; a chain that returns to a key already on the path is a
 * cycle, which resolves to nothing in CSS. Each key is walked once.
 */
export const acyclic =
  (name: string, tokens: Set<string>): Rule =>
  (v) => {
    if (!record(v)) {
      return;
    }
    const settled = new Set<string>();
    for (const start of Object.keys(v)) {
      if (settled.has(start)) {
        continue;
      }
      const path = new Set<string>();
      const trail: string[] = [];
      let cursor: string | undefined = start;
      while (cursor !== undefined && !settled.has(cursor)) {
        if (path.has(cursor)) {
          const cycle = [...trail.slice(trail.indexOf(cursor)), cursor];
          return {
            code: "cycle",
            message: `${name} contains a reference cycle: ${cycle.join(" → ")}.`,
            path: [cursor],
            received: cycle,
          };
        }
        path.add(cursor);
        trail.push(cursor);
        const token = target(v[cursor]);
        if (token !== undefined && tokens.has(token)) {
          cursor = token;
        } else {
          cursor = undefined;
        }
      }
      for (const key of path) {
        settled.add(key);
      }
    }
  };
