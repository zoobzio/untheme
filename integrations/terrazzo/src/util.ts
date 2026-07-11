import type { Source } from "./types";

import { isRecord, isReference } from "untheme/common";

import { IDENTIFIER } from "./constant";

/**
 * A token named with its origin document, for error messages that point at
 * the user's JSON rather than this package's internals.
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
 * Serializes one value as TypeScript source, deterministically: insertion
 * order, double quotes, two-space indent, keys quoted only when they must be.
 */
export const serialize = (value: unknown, indent: string): string => {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    const inner = `${indent}  `;
    const items = value
      .map((entry) => `${inner}${serialize(entry, inner)}`)
      .join(",\n");
    return `[\n${items},\n${indent}]`;
  }
  if (typeof value === "object" && value !== null) {
    const members = Object.entries(value);
    if (members.length === 0) {
      return "{}";
    }
    const inner = `${indent}  `;
    const body = members
      .map(([key, entry]) => {
        let name = key;
        if (!IDENTIFIER.test(key)) {
          name = JSON.stringify(key);
        }
        return `${inner}${name}: ${serialize(entry, inner)}`;
      })
      .join(",\n");
    return `{\n${body},\n${indent}}`;
  }
  throw new Error(
    `untheme terrazzo: cannot serialize a ${typeof value} into the generated config`,
  );
};

/**
 * Converts one node of a normalized value structurally, restoring partial
 * aliases from the parallel `partialAliasOf` branch. Terrazzo's `null` color
 * components become the schema's `"none"` sentinel; a shadow's `inset` member
 * is dropped when false and rejected when true, since untheme's shadow shape
 * carries no inset. Everything else passes through for the schema to
 * adjudicate.
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
  if (isRecord(node)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "inset") {
        if (value === true) {
          throw new Error(
            `untheme terrazzo: inset shadows are not representable — ${cite(token)}`,
          );
        }
        continue;
      }
      if (value === undefined) {
        continue;
      }
      if (isRecord(partial)) {
        out[key] = walk(value, partial[key], token);
        continue;
      }
      out[key] = walk(value, undefined, token);
    }
    return out;
  }
  return node;
};
