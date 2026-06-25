import type {
  ReferenceToken,
  RoleToken,
  SystemToken,
} from "#build/types/untheme.d.ts";
import type { Config, Contract, Layer, Mode, Theme, Untheme } from "untheme";

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
export type AppThemes = Record<string, AppThemeLayer>;

/**
 * The caller-owned state container the service operates on.
 */
export type AppConfig = Config<AppContract>;

/**
 * The runtime theme service bound to the app's contract.
 */
export type AppUntheme = Untheme<AppContract>;

/**
 * The runtime hooks the service emits, keyed by event name. Shared between the
 * `#app` augmentation and {@link UnthemeNuxtApp} so the two never drift.
 */
export interface UnthemeHooks {
  "untheme:ready": (service: AppUntheme) => void;
  "untheme:mode": (mode: Mode) => void;
  "untheme:theme": (theme: AppTheme) => void;
}

/**
 * The minimal `nuxtApp` surface the instrumentation needs. Typing against this
 * instead of `NuxtApp` keeps `makeUntheme` off the `NuxtApp.$untheme` →
 * `AppUntheme` → `makeUntheme` cycle that otherwise makes the augmentation
 * recursive.
 */
export interface UnthemeNuxtApp {
  callHook<H extends keyof UnthemeHooks>(
    name: H,
    ...args: Parameters<UnthemeHooks[H]>
  ): unknown;
}

declare module "#app" {
  interface NuxtApp {
    $untheme: AppUntheme;
  }

  // Declaration merging: fold the shared hook map into Nuxt's runtime hooks.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RuntimeNuxtHooks extends UnthemeHooks {}
}
