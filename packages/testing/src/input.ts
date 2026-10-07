import type { Input, Template } from "untheme";
import type { Selection } from "./types";

import { defineSchema } from "untheme";

import { InvalidSpecError } from "./error";

/**
 * Returns a boot selection for a theme. Each modifier is at its first
 * context, in the order of the theme. A pinned context replaces the first
 * context of its modifier. The schema of the theme checks the selection, so a
 * context that the theme lacks fails here.
 *
 * @param theme - The theme to select over.
 * @param selection - The contexts to pin.
 * @throws InvalidSpecError when a modifier has no context to boot at.
 * @throws SchemaError when a pinned context does not belong to its modifier.
 */
export const mockInput = <T extends Template>(
  theme: T,
  selection: Selection<T> = {},
): Input<T> => {
  const pinned: Partial<Record<string, string>> = selection;
  const input: Record<string, string> = {};
  for (const modifier of theme.order) {
    const chosen = pinned[modifier];
    if (chosen !== undefined) {
      input[modifier] = chosen;
      continue;
    }
    const [first] = Object.keys(theme.modifiers[modifier] ?? {});
    if (first === undefined) {
      throw new InvalidSpecError(
        `modifier "${modifier}" of "${theme.id}" has no context to boot at`,
      );
    }
    input[modifier] = first;
  }
  return defineSchema(theme).parse.input(input);
};
