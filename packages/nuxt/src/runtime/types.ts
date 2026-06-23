import type {
  ReferenceToken,
  RoleToken,
  SystemToken,
  ThemeKey,
} from "#build/types/untheme.d.ts";
import type {
  Config,
  Contract,
  Layer,
  Mode,
  Patch,
  Theme,
  Token,
  Untheme,
} from "untheme";

/**
 * The active token contract, derived from the build-time template.
 */
export type AppContract = Contract<ReferenceToken, SystemToken, RoleToken>;

/**
 * A resolved theme instance with typed token keys.
 */
export type AppTheme = Theme<AppContract>;

/**
 * A theme without its roles — the portion swapped at runtime.
 */
export type AppThemeLayer = Layer<AppContract>;

/**
 * The build-time catalog of switchable layers, keyed by its known theme keys.
 */
export type AppThemes = Record<ThemeKey, AppThemeLayer>;

/**
 * The caller-owned state container the service operates on.
 */
export type AppConfig = Config<AppContract>;

/**
 * The runtime theme service bound to the app's contract.
 */
export type AppUntheme = Untheme<AppContract>;

declare module "#app" {
  interface NuxtApp {
    $untheme: AppUntheme;
  }

  interface RuntimeNuxtHooks {
    "untheme:ready": (theme: AppTheme) => void;
    "untheme:mode": (mode: Mode) => void;
    "untheme:set": (token: Token<AppContract>, value: string) => void;
    "untheme:update": (patch: Patch<AppContract>) => void;
    "untheme:apply": (theme: AppTheme) => void;
    "untheme:reset": () => void;
    "untheme:create": (theme: AppTheme) => void;
    "untheme:extract": (theme: AppTheme) => void;
  }
}
