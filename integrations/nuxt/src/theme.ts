import type { Nuxt } from "@nuxt/schema";
import type { Template } from "untheme";
import type { UnthemeConfig } from "untheme/config";
import type { NuxtUnthemeConfig } from "./config";

import { resolve } from "node:path";

import type { Manifest } from "@untheme/kit";

import { FILENAME, loadConfig, resolveKit } from "@untheme/kit";

/**
 * The options the module runs on. Nuxt merges layer configs with an
 * array-concatenating defu before any module runs, which corrupts
 * array-valued bindings (color components, shadow lists, gradient stops,
 * `cubicBezier` tuples) and duplicates `order`. Each layer's own config
 * survives on `nuxt.options._layers`, so when more than one layer sets
 * `untheme` the closest layer's value is taken whole, never merged. A single
 * author keeps the merged options, inline module options included.
 *
 * @param options - The merged module options.
 * @param nuxt - The Nuxt instance, for its layers.
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
 * Loads the theme the module serves. With a `theme`, it is the base theme and
 * selection a kit build elsewhere generated, taken as passed. Without one, the
 * app's own kit config is built here through `@untheme/kit` — nothing is
 * written to disk — and the config and every JSON document it read join
 * Nuxt's watch list, so editing either restarts dev and builds again. A theme
 * built here also carries the manifest the kit read off its documents; one
 * passed in does not, and the emitted manifest falls back to titled ids.
 *
 * @param options - The module's configuration.
 * @param nuxt - The Nuxt instance, for the project root and the watch list.
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
