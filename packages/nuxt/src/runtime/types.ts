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

/** A theme without its roles — the portion fetched and swapped at runtime. */
export type AppThemeLayer = Omit<AppTheme, "roles">;

/** A selectable theme entry: its key and human-readable label. */
export type AppThemeOption = {
  key: string;
  label: string;
};

/** Fetches resolved themes by key for runtime theme switching. */
export interface ThemeClient {
  get: (id: string) => Promise<AppTheme>;
}
