import type { Nuxt } from "@nuxt/schema";
import type { Template } from "untheme";
import type { UnthemeConfig } from "untheme/config";
import type { NuxtUnthemeConfig } from "./config";

import { resolve } from "node:path";

import type { Manifest } from "@untheme/kit";

import { FILENAME, loadConfig, resolveKit } from "@untheme/kit";

/**
 * Returns the options that the module uses. When more than one Nuxt layer
 * sets `untheme`, the function returns the value of the closest layer as a
 * whole. Otherwise the function returns the merged options.
 *
 * @param options - The merged module options.
 * @param nuxt - The Nuxt instance. The function reads its layers.
 */
export const closest = (
  options: NuxtUnthemeConfig,
  nuxt: Nuxt,
): NuxtUnthemeConfig => {
  const authored = (nuxt.options._layers ?? [])
    .map(
      (layer) =>
        (layer.config as { untheme?: NuxtUnthemeConfig } | null)?.untheme,
    )
    .filter((config) => config !== undefined);
  if (authored.length > 1 && authored[0]) {
    return authored[0];
  }
  return options;
};

/**
 * Loads the theme that the module serves. When the options have a `theme`,
 * the function returns that theme and its `input`. Otherwise the function
 * builds the kit config of the app with `@untheme/kit`. The function adds the
 * config file and each JSON document that the kit read to the watch list of
 * Nuxt. A change to one of these files restarts the dev server. A theme built
 * here also has the manifest that the kit read from its documents. When the
 * options have no manifest, the emitted manifest uses the titled ids.
 *
 * @param options - The configuration of the module.
 * @param nuxt - The Nuxt instance. The function reads the project root and
 * the watch list.
 * @throws When the options have only one of `theme` and `input`.
 */
export const loadTheme = async (
  options: NuxtUnthemeConfig,
  nuxt: Nuxt,
): Promise<UnthemeConfig<Template> & { manifest?: Manifest }> => {
  if (options.theme || options.input) {
    if (!options.theme || !options.input) {
      throw new Error(
        "untheme: `theme` and `input` are passed together — the config a kit build emits — or not at all",
      );
    }
    return { theme: options.theme, input: options.input };
  }

  const root = nuxt.options.rootDir;
  const path = resolve(root, options.config ?? FILENAME);
  nuxt.options.watch.push(path);
  const kit = await resolveKit(await loadConfig(path), { cwd: root });
  nuxt.options.watch.push(...kit.documents);
  return { theme: kit.theme, input: kit.input, manifest: kit.manifest };
};
