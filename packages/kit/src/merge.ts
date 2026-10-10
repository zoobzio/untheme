import { record } from "objectively";

import { locate } from "./source";
import { refs } from "./util";

/**
 * Merges a fragment onto a document. Objects merge by key. Arrays concatenate,
 * the document first. Any other value of the fragment replaces the value of
 * the document. Both inputs stay as they are.
 */
export const merge = (document: unknown, fragment: unknown): unknown => {
  if (Array.isArray(document) && Array.isArray(fragment)) {
    return [...document, ...fragment];
  }
  if (record(document) && record(fragment)) {
    const result: Record<string, unknown> = { ...document };
    for (const [key, value] of Object.entries(fragment)) {
      result[key] = Object.hasOwn(document, key)
        ? merge(document[key], value)
        : value;
    }
    return result;
  }
  return fragment;
};

/** Resolves each relative `$ref` of a fragment against a base. A `#` pointer stays as it is. */
export const anchor = (fragment: unknown, base: URL): unknown => {
  return refs(fragment, (ref) =>
    ref.startsWith("#") ? ref : locate(ref, base).href,
  );
};
