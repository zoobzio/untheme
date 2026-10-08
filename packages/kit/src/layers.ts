import type { Logger } from "@terrazzo/parser";
import type { Layer, Schema, Template, Theme } from "@untheme/schema";
import type { Loader } from "./loader";
import type { BuiltLayer, KitConfig, LayerSources, Req } from "./types";

import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { defineConfig, parse } from "@terrazzo/parser";
import { SchemaError, defineSchema } from "@untheme/schema";
import { map, record } from "objectively";

import { sorted } from "./contexts";
import { binding } from "./convert";
import { entry, named } from "./describe";
import { NPM } from "./constant";
import { InvalidConfigError, InvalidLayerError } from "./error";
import { installedDirectory } from "./loader";
import { locate } from "./source";

/**
 * The root of one source document of a layer, as authored. The name and the
 * description of the layer come from it.
 */
const root = (
  src: string,
): { $description?: unknown; $extensions?: unknown } => {
  try {
    const document: unknown = JSON.parse(src);
    if (record(document)) {
      return document;
    }
  } catch {
    // The parser reports a malformed document.
  }
  return {};
};

/**
 * Builds one layer from its sources. Terrazzo parses the sources with
 * `resolveAliases` off. It flattens the groups and normalizes the values. A
 * reference stays a `{name}` string. The function converts each token to its
 * binding and sorts the tokens with the Terrazzo collation. A later source
 * wins.
 *
 * The name is the `name` in the untheme extension at the root of the last
 * source that has one, or the titled id. The description is the
 * `$description` at the root of the last source that has one.
 */
const build = async (
  id: string,
  sources: (string | URL)[],
  base: URL,
  load: Req,
  logger: Logger | undefined,
): Promise<{ layer: BuiltLayer; types: Record<string, string> }> => {
  const inputs: { filename: URL; src: string }[] = [];
  let name: string | undefined;
  let description: unknown;
  for (const source of sources) {
    const filename = locate(source, base);
    const src = await load(filename, base);
    inputs.push({ filename, src });
    const authored = root(src);
    name = named(authored) ?? name;
    description = authored.$description ?? description;
  }
  const parsed = await parse(inputs, {
    config: defineConfig({ alphabetize: false }, { cwd: base }),
    req: load,
    logger,
    skipLint: true,
    resolveAliases: false,
  });
  const tokens = sorted(parsed.tokens);
  const layer: Layer<Template> = {
    id,
    name: name ?? entry(id).name,
    tokens: map(tokens, binding) as Layer<Template>["tokens"],
  };
  return {
    layer: { entry: entry(id, name, description), layer },
    types: map(tokens, (token) => token.$type),
  };
};

/**
 * Checks a built layer against the contract. The function returns one issue
 * for each token whose declared `$type` is not the type of the token in the
 * contract, and one issue for each failure of the layer schema. Each issue
 * names the layer and the token.
 */
const check = (
  built: BuiltLayer,
  types: Record<string, string>,
  theme: Theme<Template>,
): string[] => {
  const { id } = built.layer;
  const issues: string[] = [];
  for (const [token, type] of Object.entries(types)) {
    const slot = theme.tokens[token];
    if (slot !== undefined && slot.$type !== type) {
      issues.push(
        `layers.${id}: tokens.${token} declares type "${type}", the contract has "${slot.$type}"`,
      );
    }
  }
  const schema: Schema<Theme<Template>> = defineSchema(theme);
  try {
    schema.assert.layer(built.layer);
  } catch (error) {
    if (!(error instanceof SchemaError)) {
      throw error;
    }
    for (const issue of error.issues) {
      const at = (issue.path ?? []).join(".");
      issues.push(`layers.${id}: ${at}: ${issue.message}`);
    }
  }
  return issues;
};

/** The extension of a layer document in a layers directory. */
const EXTENSION = ".json";

/**
 * Lists the layer documents of a directory. Each `.json` file is one layer.
 * The id is the file name without the extension. The result is in name order.
 * A `file:` directory is read as it is. An `npm:/` directory is found through
 * the package, and each file keeps its `npm:/` form, so the package must
 * export it. The function returns the directory on disk with the sources.
 *
 * @param directory - The directory, as a URL with a trailing slash.
 * @param root - The project root that packages resolve from.
 * @throws Error when the directory is remote or cannot be listed.
 */
const list = async (
  directory: URL,
  root: string,
): Promise<{ path: string; sources: Record<string, URL> }> => {
  let path: string;
  if (directory.protocol === "file:") {
    path = fileURLToPath(directory);
  } else if (directory.protocol === NPM) {
    path = installedDirectory(directory, root);
  } else {
    throw new Error(
      `@untheme/kit: layers must be a local or an installed directory — cannot list ${directory.href}`,
    );
  }
  let entries: string[];
  try {
    entries = await readdir(path);
  } catch (error) {
    throw new Error(`@untheme/kit: cannot list the layers in ${path}`, {
      cause: error,
    });
  }
  const names = entries.filter((name) => name.endsWith(EXTENSION)).sort();
  return {
    path: path.replace(/[\\/]+$/, ""),
    sources: Object.fromEntries(
      names.map((name) => [
        name.slice(0, -EXTENSION.length),
        new URL(name, directory),
      ]),
    ),
  };
};

/**
 * Expands the `layers` of a config to the sources of each layer, by id. Each
 * item is an object, returned as it is, or a directory, listed with
 * {@link list}. A listed directory joins `documents`, so a watcher sees a new
 * file. The items apply in order, and an id can appear once.
 *
 * @throws InvalidConfigError when an id appears twice.
 */
const expand = async (
  layers: KitConfig["layers"],
  base: URL,
  documents: string[],
): Promise<Record<string, string | URL | (string | URL)[]>> => {
  const items: LayerSources[] = layers === undefined ? [] : [layers].flat();
  const root = fileURLToPath(base);
  const sources: Record<string, string | URL | (string | URL)[]> = {};
  const issues: string[] = [];
  for (const item of items) {
    let found: Record<string, string | URL | (string | URL)[]>;
    if (typeof item === "string" || item instanceof URL) {
      const located = locate(item, base);
      const directory = new URL(`${located.href.replace(/\/+$/, "")}/`);
      const listed = await list(directory, root);
      if (!documents.includes(listed.path)) {
        documents.push(listed.path);
      }
      found = listed.sources;
    } else {
      found = item;
    }
    for (const [id, source] of Object.entries(found)) {
      if (id in sources) {
        issues.push(`layers: the id "${id}" appears twice`);
        continue;
      }
      sources[id] = source;
    }
  }
  if (issues.length > 0) {
    throw new InvalidConfigError(issues);
  }
  return sources;
};

/**
 * Builds the layers of a config against a base theme. Each `layers` directory
 * is listed first, and each `.json` file in it is one layer. The function reads
 * the sources of each layer through the loader. It checks each layer against
 * the contract of the theme and reports every issue of every layer together.
 * The result keeps the order of the config, with the name order of each
 * directory.
 *
 * @param layers - The `layers` of the config.
 * @param theme - The base theme that the layers apply to.
 * @param base - The project root that relative sources resolve against.
 * @param loader - The loader of the build. The directory joins its documents.
 * @param logger - The Terrazzo logger of the build.
 * @throws InvalidConfigError when an id appears twice.
 * @throws InvalidLayerError when a layer violates the contract.
 * @throws Error when a layers directory is remote or cannot be listed.
 */
export const buildLayers = async (
  layers: KitConfig["layers"],
  theme: Theme<Template>,
  base: URL,
  loader: Loader,
  logger?: Logger,
): Promise<BuiltLayer[]> => {
  const { load, documents } = loader;
  const sources = await expand(layers, base, documents);
  const built: BuiltLayer[] = [];
  const issues: string[] = [];
  for (const [id, source] of Object.entries(sources)) {
    const { layer, types } = await build(
      id,
      [source].flat(),
      base,
      load,
      logger,
    );
    issues.push(...check(layer, types, theme));
    built.push(layer);
  }
  if (issues.length > 0) {
    throw new InvalidLayerError(issues);
  }
  return built;
};
