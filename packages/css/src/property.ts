import type { Dashed, Variable } from "./types";

/**
 * Replaces each dot in a token name with a dash. The return type is {@link
 * Dashed}.
 */
export const dashed = <S extends string>(value: S): Dashed<S> => {
  return value.replace(/\./g, "-") as Dashed<S>;
};

/**
 * Returns the custom property name for a token. Dots become dashes.
 */
export const property = <K extends string>(token: K): Variable<K> => {
  return `--${dashed(token)}`;
};

/**
 * Returns the `var()` text for a `{token}` reference. The `var()` names the
 * custom property of the referenced token.
 */
export const indirection = (reference: `{${string}}`): `var(--${string})` => {
  return `var(${property(reference.slice(1, -1))})`;
};
