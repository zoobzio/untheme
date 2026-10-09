import type { Nuxt } from "@nuxt/schema";
import type { BuiltLayer, Manifest } from "@untheme/kit";
import type { Input, Layer, Template, Theme } from "untheme";
import type { NuxtUnthemeConfig } from "./config";

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { tryResolveModule } from "@nuxt/kit";
import { FILENAME, loadConfig, resolveKit } from "@untheme/kit";
import { record } from "objectively";

/**
 * What the module serves: the base theme, the boot selection, the manifest
 * when a build supplies one, and the layers of the build. The layers are empty
 * when the build has none.
 */
export interface LoadedTheme {
  theme: Theme<Template>;
  input: Input<Template>;
  manifest?: Manifest;
  layers: BuiltLayer[];
}

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

/** Whether a value is a list of layer entries, each with an id and a name. */
const entries = (
  value: unknown,
): value is { id: string; name: string; description?: string }[] => {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        record(entry) &&
        typeof entry.id === "string" &&
        typeof entry.name === "string",
    )
  );
};

/**
 * Loads the kit build that a package exports: `config`, `manifest`, `layers`,
 * and each `layers/<id>.json`. The package resolves from the project root.
 *
 * @param name - The package name.
 * @param root - The project root that the package resolves from.
 * @throws When the package lacks an export, or an export has the wrong shape.
 */
export const loadPreset = async (
  name: string,
  root: string,
): Promise<LoadedTheme> => {
  const from = pathToFileURL(join(root, "package.json"));
  const locate = async (subpath: string): Promise<string> => {
    const path = await tryResolveModule(`${name}/${subpath}`, from);
    if (path === undefined) {
      throw new Error(
        `untheme: the preset "${name}" does not export "./${subpath}" — a preset is a package that exports a kit build (from ${root})`,
      );
    }
    return path;
  };
  const load = async (subpath: string): Promise<Record<string, unknown>> => {
    const path = await locate(subpath);
    return import(pathToFileURL(path).href) as Promise<Record<string, unknown>>;
  };

  const config = await load("config");
  if (!record(config.theme) || !record(config.input)) {
    throw new Error(
      `untheme: "${name}/config" must export the theme and input of a kit build`,
    );
  }
  const { manifest } = await load("manifest");
  if (!Array.isArray(manifest)) {
    throw new Error(`untheme: "${name}/manifest" must export a manifest`);
  }
  const listed = (await load("layers")).layers;
  if (!entries(listed)) {
    throw new Error(`untheme: "${name}/layers" must export a list of layers`);
  }
  const layers = await Promise.all(
    listed.map(async (entry): Promise<BuiltLayer> => {
      const path = await locate(`layers/${entry.id}.json`);
      const layer: unknown = JSON.parse(await readFile(path, "utf8"));
      if (!record(layer) || layer.id !== entry.id) {
        throw new Error(
          `untheme: "${name}/layers/${entry.id}.json" is not the layer "${entry.id}"`,
        );
      }
      return { entry, layer: layer as Layer<Template> };
    }),
  );
  return {
    theme: config.theme as Theme<Template>,
    input: config.input as Input<Template>,
    manifest: manifest as Manifest,
    layers,
  };
};

/**
 * Loads the theme that the module serves: the `theme` and `input` options, the
 * `preset` package, or the kit config of the app. A kit config is built here,
 * and the function watches it and each document that the kit read.
 *
 * @param options - The configuration of the module.
 * @param nuxt - The Nuxt instance.
 * @throws When the options have only one of `theme` and `input`.
 */
export const loadTheme = async (
  options: NuxtUnthemeConfig,
  nuxt: Nuxt,
): Promise<LoadedTheme> => {
  if (options.theme || options.input) {
    if (!options.theme || !options.input) {
      throw new Error(
        "untheme: `theme` and `input` are passed together — the config a kit build emits — or not at all",
      );
    }
    return { theme: options.theme, input: options.input, layers: [] };
  }

  const root = nuxt.options.rootDir;
  if (options.preset !== undefined) {
    if (typeof options.preset !== "string" || options.preset === "") {
      throw new Error("untheme: `preset` must be a package name");
    }
    return loadPreset(options.preset, root);
  }

  const path = resolve(root, options.config ?? FILENAME);
  nuxt.options.watch.push(path);
  const kit = await resolveKit(await loadConfig(path), { cwd: root });
  nuxt.options.watch.push(...kit.documents);
  return {
    theme: kit.theme,
    input: kit.input,
    manifest: kit.manifest,
    layers: kit.layers,
  };
};
