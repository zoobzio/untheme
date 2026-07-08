import type { Template, Theme } from "@untheme/schema";
import type { Overlay } from "./types";

import { map } from "@untheme/common";

import { clone } from "./clone";
import { copy } from "./copy";
import { traverse } from "./traverse";

/**
 * Merges overlays over a complete theme into a fresh theme, left to right:
 * later overlays win where they bind the same token, token by token and context
 * by context. Identity and order transfer from the last overlay that carries
 * them. No input is mutated; with no overlays the result is a plain copy.
 *
 * A token override rebinds a slot's `$value` and nothing else — the slot's
 * `$type`, description, and other metadata are preserved, and the incoming
 * binding replaces the old `$value` whole rather than merging into it. An
 * overlay key with no matching base slot is skipped: there is no `$type` to
 * inherit, so no definition can be fabricated for it.
 *
 * A `Layer` overlay adopts its identity (apply semantics); a `Patch` overlay
 * has none, so the prevailing identity is preserved (update semantics).
 */
export const merge = <T extends Template>(
  theme: Theme<T>,
  ...overlays: Overlay<T>[]
): Theme<T> => {
  return overlays.reduce<Theme<T>>(
    (acc, overlay) => ({
      id: overlay.id ?? acc.id,
      name: overlay.name ?? acc.name,
      tokens: map(acc.tokens, (slot, token) => {
        const binding = overlay.tokens?.[token];
        if (binding === undefined) {
          return slot;
        }
        return { ...slot, $value: copy(binding) };
      }),
      modifiers: traverse(acc.modifiers, (overrides, at) => ({
        ...overrides,
        ...copy(at(overlay.modifiers ?? {}) ?? {}),
      })),
      order: copy(overlay.order ?? acc.order),
    }),
    clone(theme),
  );
};
