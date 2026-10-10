import type { Issue } from "@untheme/schema";
import type { Document, Source } from "./types";

import { map, record, wrapped } from "objectively";

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
