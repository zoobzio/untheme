import type {
  ReferenceToken,
  RoleToken,
  SystemToken,
} from "#build/types/untheme.d.ts";
import type { Theme } from "untheme";

/**
 * A resolved theme instance with typed token keys derived from the build-time
 * template.
 */
export type AppTheme = Theme<ReferenceToken, SystemToken, RoleToken>;

export type AppThemeLayer = Omit<AppTheme, "roles">;

export type AppThemeOption = {
  key: string;
  label: string;
};

export interface ThemeClient {
  get: (id: string) => Promise<AppTheme>;
}
