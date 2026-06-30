import type { Template } from "@untheme/schema";

/**
 * Structural copy of a theme: fresh records at every facet, so mutating the
 * copy never reaches the original. Every value is reached through plain property
 * access and copied into a new record, so cloning a reactive proxy yields an
 * inert, plain snapshot.
 */
export const clone = <T extends Template>(theme: T): T => {
  const copy = {
    id: theme.id,
    name: theme.name,
    tokens: { ...theme.tokens },
    modifiers: { ...theme.modifiers },
    order: [...theme.order],
  };

  const source = theme.modifiers;
  const target = copy.modifiers;
  for (const modifier of Object.keys(source)) {
    target[modifier] = {};
    for (const context of Object.keys(source[modifier])) {
      target[modifier][context] = { ...source[modifier][context] };
    }
  }

  return copy as T;
};
