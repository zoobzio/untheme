import type { Contract } from "@untheme/schema";
import type { Extension } from "./types";

/**
 * Widens a base theme with an {@link Extension} into a fresh, complete theme
 * over the union contract: extension bindings win where both bind a token,
 * new tokens join the contract, and identity transfers when the extension
 * carries one. Neither input is mutated; an all-empty extension yields a
 * plain copy of the base.
 *
 * Unlike `merge`, which stays within one contract, `extend` is the widening
 * primitive: the result's token unions grow to include the extension's.
 */
export const extend = <
  Ref extends string,
  Sys extends string,
  Rol extends string,
  XRef extends string,
  XSys extends string,
  XRol extends string,
>(
  base: Contract<Ref, Sys, Rol>,
  extension: Extension<
    NoInfer<Ref>,
    NoInfer<Sys>,
    NoInfer<Rol>,
    XRef,
    XSys,
    XRol
  >,
): Contract<Ref | XRef, Sys | XSys, Rol | XRol> => {
  return {
    id: extension.id ?? base.id,
    name: extension.name ?? base.name,
    reference: {
      ...base.reference,
      ...extension.reference,
    },
    system: {
      light: {
        ...base.system.light,
        ...extension.system.light,
      },
      dark: {
        ...base.system.dark,
        ...extension.system.dark,
      },
    },
    roles: {
      ...base.roles,
      ...extension.roles,
    },
  };
};
