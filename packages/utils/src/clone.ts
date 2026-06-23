import type { Contract, Theme } from "@untheme/schema";

/**
 * Structural copy of a theme: fresh records at every facet, so mutating the
 * copy never reaches the original. Reads plain property access, so cloning a
 * reactive proxy yields an inert snapshot.
 */
export const clone = <
  Ref extends string,
  Sys extends string,
  Rol extends string,
>(
  theme: Theme<Contract<Ref, Sys, Rol>>,
): Theme<Contract<Ref, Sys, Rol>> => {
  return {
    id: theme.id,
    name: theme.name,
    reference: {
      ...theme.reference,
    },
    system: {
      light: {
        ...theme.system.light,
      },
      dark: {
        ...theme.system.dark,
      },
    },
    roles: {
      ...theme.roles,
    },
  };
};
