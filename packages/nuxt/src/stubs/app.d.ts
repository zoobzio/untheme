interface NuxtPluginDef {
  name: string;
  setup: () => void | Promise<void>;
}

export declare function defineNuxtPlugin(plugin: NuxtPluginDef): NuxtPluginDef;
