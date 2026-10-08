import type { Patch, Template } from "@untheme/schema";

import { copy, map } from "objectively";

import { clone } from "./clone";
import { traverse } from "./traverse";

/**
 * Merges overlays into a complete theme and returns a new theme of the same
 * type. The function
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
 * An overlay with an identity sets the identity of the result. An overlay with
 * no identity leaves the identity of the theme as it is. A `Layer` is a patch
 * with an identity.
 */
export const merge = <T extends Template>(
  theme: T,
  ...overlays: Patch<T>[]
): T => {
  return overlays.reduce<T>(
    (acc, overlay) => ({
      ...acc,
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
