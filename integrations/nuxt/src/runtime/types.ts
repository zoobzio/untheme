import type { Contract } from "#build/untheme/config.mjs";
import type { Config, Input, Layer, Patch, Theme, Untheme } from "untheme";
import type { Renderer } from "untheme/css";

/**
 * The token contract of the app. This is the `Contract` that the build-time
 * `config` module declares for its token and modifier unions.
 */
export type AppUnthemeContract = Contract;

/**
 * A resolved theme with typed token keys.
 */
export type AppUnthemeTheme = Theme<AppUnthemeContract>;

/**
 * A layer of the contract. `apply` takes one.
 */
export type AppUnthemeThemeLayer = Layer<AppUnthemeContract>;

/**
 * A patch of the contract. `update` takes one, and the state holds one.
 */
export type AppUnthemePatch = Patch<AppUnthemeContract>;

/**
 * The active selection. It has one context for each modifier.
 */
export type AppUnthemeInput = Input<AppUnthemeContract>;

/**
 * The state container of the service. It holds the patch, the selection, and
 * the user override.
 */
export type AppUnthemeConfig = Config<AppUnthemeContract>;

/**
 * The runtime theme service bound to the app's contract.
 */
export type AppUntheme = Untheme<AppUnthemeContract>;

/**
 * The runtime hooks of the service, keyed by event name. The `#app`
 * augmentation and {@link UnthemeNuxtApp} use this type.
 */
export interface UnthemeHooks {
  "untheme:ready": (service: AppUntheme) => void;
  "untheme:input": (input: AppUnthemeInput) => void;
  "untheme:patch": (patch: AppUnthemePatch) => void;
}

/**
 * The part of `nuxtApp` that `makeUntheme` uses. It has the `callHook` method.
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

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RuntimeNuxtHooks extends UnthemeHooks {}
}
