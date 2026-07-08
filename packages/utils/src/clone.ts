import type { Template } from "@untheme/schema";

import { isEqual } from "@untheme/common";
import { copy } from "./copy";

/**
 * Deep copy of a theme, facet by facet: identity, tokens, modifiers, and order
 * are each rebuilt through {@link copy}, so no definition object, nested
 * `$value` structure, or override map is shared with the source. Mutating the
 * clone at any depth never reaches the original.
 *
 * Because {@link copy} reaches every value through plain property access,
 * cloning a reactive proxy yields an inert, plain snapshot.
 */
export const clone = <T extends Template>(theme: T): T => {
  const result = {
    id: theme.id,
    name: theme.name,
    tokens: copy(theme.tokens),
    modifiers: copy(theme.modifiers),
    order: copy(theme.order),
  };

  if (!isEqual(theme, result)) {
    throw new TypeError("unable to clone a theme");
  }

  return result;
};
