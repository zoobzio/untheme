import type { Template, Theme } from "@untheme/schema";
import type { Overlay } from "./types";

import { copy, map } from "objectively";

import { clone } from "./clone";
import { traverse } from "./traverse";

/**
 * Merges overlays into a complete theme and returns a new theme. The function
 * applies the overlays from left to right. A later overlay replaces an earlier
 * binding of the same token or the same context. The identity and the order
 * come from the last overlay that has them. With no overlays, the result is a
 * copy of the theme.
 *
 * A token override replaces the `$value` of the slot. The slot keeps its
 * `$type`, its description, and its other metadata. The new binding replaces
 * the old `$value` as a whole. The function skips an overlay key that has no
 * base slot.
 *
 * A `Layer` overlay has an identity and sets the identity of the result. A
 * `Patch` overlay has no identity, so the identity of the theme stays.
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
