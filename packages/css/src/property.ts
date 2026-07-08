import type { Dashed, Variable } from "./types";

/**
 * A token name with its dots replaced by dashes. The cast asserts the runtime
 * replacement mirrors the type-level {@link Dashed} transform; safe because
 * both rewrite every `.` to `-` and touch nothing else.
 */
export const dashed = <S extends string>(value: S): Dashed<S> => {
  return value.replace(/\./g, "-") as Dashed<S>;
};

/**
 * The custom property name for a token: dots become dashes, since a custom
 * property is a dashed ident and `.` cannot appear in one.
 */
export const property = <K extends string>(token: K): Variable<K> => {
  return `--${dashed(token)}`;
};

/**
 * The `var()` indirection for a `{token}` reference: the referenced token's
 * custom property, wrapped. Emitting the indirection rather than the target's
 * value keeps edits cascading — a rebind of the target propagates through the
 * custom-property graph instead of being baked into each dependent.
 */
export const indirection = (reference: `{${string}}`): `var(--${string})` => {
  return `var(${property(reference.slice(1, -1))})`;
};
