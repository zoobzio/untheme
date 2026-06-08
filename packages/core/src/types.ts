/** The supported color modes for a theme. */
export type ColorMode = "light" | "dark";

/** A theme configuration preset mapping reference and system tokens. */
export interface Theme<
  Ref extends string,
  Sys extends string,
  Role extends string,
> {
  preset: string;
  key: string;
  /** A human-readable name for the config. */
  label: string;
  /** Reference tokens mapping token names to raw color values. */
  reference: { [K in Ref]: string };
  /** System tokens mapped to reference tokens for each color mode. */
  modes: {
    [M in ColorMode]: { [K in Sys]: NoInfer<Ref> };
  };
  /** Role tokens mapping semantic names to reference or system token aliases. */
  roles: {
    [K in Role]: NoInfer<Ref | Sys>;
  };
}

/**
 * Resolves the value type for a token based on its tier.
 *
 * - Reference tokens hold raw `string` values.
 * - System tokens hold a reference token alias.
 * - Role tokens hold a reference or system token alias.
 */
export type TokenValue<
  Ref extends string,
  Sys extends string,
  Role extends string,
  T extends Ref | Sys | Role,
> = T extends Ref
  ? string
  : T extends Sys
    ? Ref
    : T extends Role
      ? Ref | Sys
      : never;

/** A runtime theme instance providing token access, mutation, and mode toggling. */
export interface Untheme<
  Ref extends string,
  Sys extends string,
  Role extends string,
> {
  /** The underlying theme definition. */
  theme: Theme<Ref, Sys, Role>;
  /** The active color mode. */
  mode: ColorMode;
  /** A flat record of all resolved tokens for the active mode. */
  tokens: Record<Ref | Sys | Role, string>;
  /** Recursively resolves a token through its alias chain to a raw value. */
  resolve: <T extends Ref | Sys | Role>(token: T) => string;
  /** Sets a single token value, respecting tier constraints. */
  update: <T extends Ref | Sys | Role>(
    token: T,
    value: TokenValue<Ref, Sys, Role, T>,
  ) => void;
  /** Checks if a value is a reference token name. */
  isRef: (token: string) => token is Ref;
  /** Checks if a value is a system token name. */
  isSys: (token: string) => token is Sys;
  /** Checks if a value is a role token name. */
  isRole: (token: string) => token is Role;
  /** Checks if a value is any token name (reference, system, or role). */
  isToken: (token: string) => token is Ref | Sys | Role;
}

/** Factory signature for {@link defineUntheme}. */
export interface UnthemeFactory {
  <Ref extends string, Sys extends string, Role extends string>(
    theme: Theme<Ref, Sys, Role>,
    mode: ColorMode,
  ): Untheme<Ref, Sys, Role>;
}
