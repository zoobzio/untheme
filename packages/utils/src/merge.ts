import type { Overrides, Template, Theme } from "@untheme/schema";
import type { Overlay } from "./types";

import { clone } from "./clone";

/**
 * Merges overlays over a complete theme into a fresh theme, left to right:
 * later overlays win where they bind the same token, token by token and context
 * by context. Identity and order transfer from the last overlay that carries
 * them. No input is mutated; with no overlays the result is a plain copy.
 *
 * A `Layer` overlay adopts its identity (apply semantics); a `Patch` overlay
 * has none, so the prevailing identity is preserved (update semantics).
 */
export const merge = <T extends Template>(
  theme: Theme<T>,
  ...overlays: Overlay<T>[]
): Theme<T> => {
  return overlays.reduce<Theme<T>>((acc, overlay) => {
    const next = clone(acc);
    if (overlay.id !== undefined) {
      next.id = overlay.id;
    }
    if (overlay.name !== undefined) {
      next.name = overlay.name;
    }
    if (overlay.order !== undefined) {
      next.order = overlay.order;
    }
    Object.assign(next.tokens, overlay.tokens ?? {});
    const modifiers: Record<
      string,
      Record<string, Overrides<T>>
    > = next.modifiers;
    for (const [modifier, contexts] of Object.entries(
      overlay.modifiers ?? {},
    )) {
      const target = modifiers[modifier];
      for (const [context, overrides] of Object.entries(contexts ?? {})) {
        Object.assign(target[context], overrides);
      }
    }
    return next;
  }, clone(theme));
};
