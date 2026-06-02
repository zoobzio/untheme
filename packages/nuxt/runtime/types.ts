import type {
  ReferenceToken,
  RoleToken,
  SystemToken,
} from "#build/types/untheme.d.ts";

/** A resolved theme instance with typed token keys derived from the build-time template. */
export type AppTheme = {
  label: string;
  reference: Record<ReferenceToken, string>;
  modes: {
    light: Record<SystemToken, ReferenceToken>;
    dark: Record<SystemToken, ReferenceToken>;
  };
  roles: Record<RoleToken, ReferenceToken | SystemToken>;
};
