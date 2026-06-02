/** The supported color modes for a theme. */
export type ThemeMode = "light" | "dark";

/** Base template structure that defines the shape of a theme's tokens. */
export interface ThemeTemplate {
  /** A human-readable name for the theme template. */
  label: string;
  /** Reference tokens mapping token names to raw color values (e.g. hex codes). */
  reference: Record<string, string>;
  /** System tokens that map to reference tokens per color mode. */
  modes: {
    [M in ThemeMode]: Record<string, string>;
  };
  /** Role tokens that assign semantic meaning to reference or system tokens. */
  roles: Record<string, string>;
}

/** Extracts the reference token keys from a {@link ThemeTemplate}. */
export type RefToken<T extends ThemeTemplate> = keyof T["reference"];
/** Extracts the system token keys from a {@link ThemeTemplate}. */
export type SysToken<T extends ThemeTemplate> = keyof T["modes"]["light"];
/** Extracts the role token keys from a {@link ThemeTemplate}. */
export type RoleToken<T extends ThemeTemplate> = keyof T["roles"];

/** A fully resolved theme derived from a {@link ThemeTemplate}. */
export type Theme<T extends ThemeTemplate> = {
  /** A human-readable name for the theme. */
  label: string;
  /** Reference tokens mapping token names to raw color values. */
  reference: { [K in RefToken<T>]: string };
  /** System tokens mapped to reference tokens for each color mode. */
  modes: {
    [M in ThemeMode]: { [K in SysToken<T>]: RefToken<T> };
  };
  /** Role tokens mapped to reference or system tokens. */
  roles: {
    [K in RoleToken<T>]: RefToken<T> | SysToken<T>;
  };
};
