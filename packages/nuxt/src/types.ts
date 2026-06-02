import type { Config } from "untheme";

/** Configuration options for the untheme Nuxt module. */
export interface NuxtUnthemeConfig {
  /** The key of the theme to use as the initial active theme. */
  default: string;
  /** A map of theme keys to their {@link Config} definitions. */
  themes: Record<
    string,
    Config<string, string> & { roles: Record<string, string> }
  >;
}

/** Typed configuration for the untheme Nuxt module with inferred token unions. */
export interface UnthemeConfig<
  Ref extends string,
  Sys extends string,
  Role extends string,
> {
  default: string;
  themes: Record<
    string,
    Config<Ref, Sys> & { roles: Record<Role, NoInfer<Ref | Sys>> }
  >;
}
