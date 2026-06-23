import type { Contract, Theme } from "@untheme/schema";
import type { Overlay } from "./types";

import { clone } from "./clone";

/**
 * Merges overlays over a complete theme into a fresh theme, left to right:
 * later overlays win where they bind the same token, facet by facet, mode by
 * mode. Identity transfers from the last overlay that carries one. No input
 * is mutated; with no overlays the result is a plain clone.
 *
 * A `Layer` overlay adopts its identity (apply semantics); a `Patch` overlay
 * has none, so the prevailing identity is preserved (update semantics).
 */
export const merge = <
  Ref extends string,
  Sys extends string,
  Rol extends string,
>(
  theme: Theme<Contract<Ref, Sys, Rol>>,
  ...overlays: Overlay<Contract<Ref, Sys, Rol>>[]
): Theme<Contract<Ref, Sys, Rol>> => {
  return overlays.reduce<Theme<Contract<Ref, Sys, Rol>>>(
    (acc, overlay) => ({
      id: overlay.id ?? acc.id,
      name: overlay.name ?? acc.name,
      reference: {
        ...acc.reference,
        ...(overlay.reference ?? {}),
      },
      system: {
        light: {
          ...acc.system.light,
          ...(overlay.system?.light ?? {}),
        },
        dark: {
          ...acc.system.dark,
          ...(overlay.system?.dark ?? {}),
        },
      },
      roles: {
        ...acc.roles,
        ...(overlay.roles ?? {}),
      },
    }),
    clone(theme),
  );
};
