// Type stub for the Nuxt `#app` virtual module.

/**
 * The runtime hook signatures. The untheme runtime adds to this interface with
 * `declare module "#app"`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmented by the runtime
export interface RuntimeNuxtHooks {}

/**
 * The Nuxt app instance. The untheme runtime adds the `$untheme` service with
 * `declare module "#app"`.
 */
export interface NuxtApp {
  callHook: <K extends keyof RuntimeNuxtHooks>(
    name: K,
    ...args: Parameters<RuntimeNuxtHooks[K]>
  ) => Promise<void>;
  hook: <K extends keyof RuntimeNuxtHooks>(
    name: K,
    fn: RuntimeNuxtHooks[K],
  ) => void;
}

interface NuxtPluginDef {
  name: string;
  dependsOn?: string[];
  setup: (
    nuxtApp: NuxtApp,
  ) =>
    | void
    | { provide?: Record<string, unknown> }
    | Promise<void | { provide?: Record<string, unknown> }>;
}

export declare function defineNuxtPlugin(plugin: NuxtPluginDef): NuxtPluginDef;

export declare function useNuxtApp(): NuxtApp;
