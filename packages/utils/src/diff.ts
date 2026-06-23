import type { Contract, Theme } from "@untheme/schema";

import type { Diff } from "./types";

/**
 * The bindings in `to` that deviate from `from` within one facet: keys `to`
 * holds whose values differ.
 */
const delta = <R extends Record<string, string>>(
  from: R,
  to: R,
): Partial<R> => {
  return Object.entries(to).reduce<Partial<R>>(
    (acc, [k, v]) => (from[k] === v ? acc : { ...acc, [k]: v }),
    {},
  );
};

/**
 * Computes the patch that turns `from` into `to`: every binding `to` holds
 * that deviates from `from`, facet by facet, mode by mode. Identity is not
 * compared — a patch carries none. All-empty facets mean the themes bind
 * identically; applying the result to `from` via `merge` restores `to`.
 */
export const diff = <
  Ref extends string,
  Sys extends string,
  Rol extends string,
>(
  from: Theme<Contract<Ref, Sys, Rol>>,
  to: Theme<Contract<Ref, Sys, Rol>>,
): Diff<Contract<Ref, Sys, Rol>> => {
  return {
    reference: delta(from.reference, to.reference),
    system: {
      light: delta(from.system.light, to.system.light),
      dark: delta(from.system.dark, to.system.dark),
    },
    roles: delta(from.roles, to.roles),
  };
};
