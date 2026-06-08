// Typecheck-only stub for the Nuxt `#app` virtual module.
interface NuxtPluginDef {
  name: string;
  setup: () => void | Promise<void>;
}

export declare function defineNuxtPlugin(plugin: NuxtPluginDef): NuxtPluginDef;
