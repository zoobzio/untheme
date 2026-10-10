import type { Issue } from "@untheme/schema";
import type { Document, Source } from "./types";

import { entries, map, record, wrapped } from "objectively";

/**
 * Whether a value is a reference in curly-brace syntax. This is a string that
 * starts with `{` and ends with `}`.
 */
export const isReference = wrapped("{", "}");

/** Whether a value is a non-empty string. */
export const isText = (value: unknown): value is string => {
  return typeof value === "string" && value !== "";
};

/**
 * Parses JSON text to a document. The function returns `undefined` when the
 * text is not JSON, or when the JSON is not an object.
 */
export const toDocument = (text: string): Document | undefined => {
  try {
    const value: unknown = JSON.parse(text);
    return record(value) ? value : undefined;
  } catch {
    return undefined;
  }
};

/** One line for a schema issue: the dotted path, then the message. */
export const line = (issue: Issue): string => {
  return `${(issue.path ?? []).join(".")}: ${issue.message}`;
};

/**
 * Names a token with its origin document, for an error message.
 */
export const cite = (token: Source): string => {
  if (token.source?.filename) {
    return `"${token.id}" (${token.source.filename})`;
  }
  return `"${token.id}"`;
};

/**
 * The braced reference form of a token id.
 */
export const braced = (id: string): `{${string}}` => {
  return `{${id}}`;
};

/**
 * Converts one node of a normalized value. The function restores partial aliases
 * from the parallel `partialAliasOf` branch. A `null` color component of
 * Terrazzo becomes the schema value `"none"`. The function drops the `inset`
 * member of a shadow when it is false and throws when it is true. The function
 * returns all other values unchanged.
 */
export const walk = (
  node: unknown,
  partial: unknown,
  token: Source,
): unknown => {
  if (typeof partial === "string") {
    return braced(partial);
  }
  if (isReference(node)) {
    return node;
  }
  if (node === null) {
    return "none";
  }
  if (Array.isArray(node)) {
    return node.map((entry, index) => {
      if (Array.isArray(partial)) {
        return walk(entry, partial[index], token);
      }
      return walk(entry, undefined, token);
    });
  }
  if (record(node)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of entries(node)) {
      if (key === "inset") {
        if (value === true) {
          throw new Error(
            `@untheme/kit: inset shadows are not representable — ${cite(token)}`,
          );
        }
        continue;
      }
      if (value === undefined) {
        continue;
      }
      if (record(partial)) {
        out[key] = walk(value, partial[key], token);
        continue;
      }
      out[key] = walk(value, undefined, token);
    }
    return out;
  }
  return node;
};

/** Maps every `$ref` below a node. */
export const refs = (node: unknown, fn: (ref: string) => string): unknown => {
  if (Array.isArray(node)) {
    return node.map((item) => refs(item, fn));
  }
  if (record(node)) {
    return rewrite(node, fn);
  }
  return node;
};

/** Returns a copy of a document with every `$ref` mapped through `fn`. */
export const rewrite = (
  document: Record<string, unknown>,
  fn: (ref: string) => string,
): Record<string, unknown> => {
  return map(document, (value, key) => {
    if (key === "$ref" && typeof value === "string") {
      return fn(value);
    }
    return refs(value, fn);
  });
};
