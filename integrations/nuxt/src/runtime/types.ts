import type { Contract } from "#build/untheme/config.mjs";
import type { Config, Input, Layer, Theme, Untheme } from "untheme";
import type { Renderer } from "untheme/css";

/**
 * The active token contract: the `Contract` the build-time `config` module
 * declares over its token and modifier unions.
 */
export type AppUnthemeContract = Contract;

/**
 * A resolved theme instance with typed token keys.
 */
export type AppUnthemeTheme = Theme<AppUnthemeContract>;

/**
 * A partial overlay carrying identity — what `apply` swaps in at runtime.
 */
export type AppUnthemeThemeLayer = Layer<AppUnthemeContract>;

/**
 * The active selection — one context per modifier.
 */
export type AppUnthemeInput = Input<AppUnthemeContract>;

/**
 * The caller-owned state container the service operates on.
 */
export type AppUnthemeConfig = Config<AppUnthemeContract>;

/**
 * The runtime theme service bound to the app's contract.
 */
export type AppUntheme = Untheme<AppUnthemeContract>;

/**
 * The runtime hooks the service emits, keyed by event name. Shared between the
 * `#app` augmentation and {@link UnthemeNuxtApp} so the two never drift.
 */
export interface UnthemeHooks {
  "untheme:ready": (service: AppUntheme) => void;
  "untheme:input": (input: AppUnthemeInput) => void;
  "untheme:theme": (theme: AppUnthemeTheme) => void;
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
    $unthemeRenderer: Renderer<AppUnthemeContract>;
  }

  // Declaration merging: fold the shared hook map into Nuxt's runtime hooks.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RuntimeNuxtHooks extends UnthemeHooks {}
}
