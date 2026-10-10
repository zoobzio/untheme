import type { Logger } from "@terrazzo/parser";
import type { Definition, Schema, Template, Theme } from "@untheme/schema";
import type { Loader } from "./loader";
import type {
  BuiltLayer,
  Entry,
  KitConfig,
  LayerSources,
  Preset,
  Req,
} from "./types";

import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { defineConfig, parse } from "@terrazzo/parser";
import { SchemaError, defineSchema } from "@untheme/schema";
import { collect, copy, entries, equals, keys, map, record } from "objectively";

import { sorted } from "./contexts";
import { binding } from "./convert";
import { entry, named } from "./describe";
import { InvalidLayerError } from "./error";
import { locate } from "./source";

/** A layer before the check. `types` has the declared `$type` of each token. */
interface Candidate {
  entry: Entry;
  layer: unknown;
  types: Record<string, string>;
}

/** The root of one source document of a layer, as authored. */
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
 * `resolveAliases` off. A reference stays a `{name}` string. A later source
 * wins. The name is the `name` in the untheme extension at the root of the
 * last source that has one, or the titled id. The description is the
 * `$description` at the root of the last source that has one.
 */
const build = async (
  id: string,
  sources: (string | URL)[],
  base: URL,
  load: Req,
  logger: Logger | undefined,
): Promise<Candidate> => {
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
  const listed = entry(id, name, description);
  return {
    entry: listed,
    layer: { id, name: listed.name, tokens: map(tokens, binding) },
    types: map(tokens, (token) => token.$type),
  };
};

/** The layer of the base. It holds the tokens that the config changed. */
const own = (
  theme: Theme<Template>,
  pristine: LayerSources["pristine"],
  description: unknown,
): Candidate => {
  const tokens: Record<string, Definition["$value"]> = {};
  for (const [token, slot] of entries(theme.tokens)) {
    const was = pristine?.[token];
    if (was !== undefined && !equals(was.$value, slot.$value)) {
      tokens[token] = copy(slot.$value);
    }
  }
  const layer: Record<string, unknown> = { id: theme.id, name: theme.name };
  if (keys(tokens).length > 0) {
    layer.tokens = tokens;
  }
  return { entry: entry(theme.id, theme.name, description), layer, types: {} };
};

/**
 * Reads a layer file of the preset.
 *
 * @throws Error when the file is missing or is not the listed layer.
 */
const inherit = async (
  source: Preset["layers"][number],
  load: Req,
): Promise<Candidate> => {
  const { entry: listed, url } = source;
  let layer: unknown;
  try {
    layer = JSON.parse(await load(url, url));
  } catch (error) {
    throw new Error(
      `@untheme/kit: cannot read the layer "${listed.id}" at ${url.href}`,
      { cause: error },
    );
  }
  if (!record(layer) || layer.id !== listed.id) {
    throw new Error(
      `@untheme/kit: ${url.href} is not the layer "${listed.id}"`,
    );
  }
  return { entry: listed, layer, types: {} };
};

/** One issue for each token whose declared `$type` is not the type in the contract. */
const typed = (
  id: string,
  types: Record<string, string>,
  theme: Theme<Template>,
): string[] => {
  const issues: string[] = [];
  for (const [token, type] of entries(types)) {
    const slot = theme.tokens[token];
    if (slot !== undefined && slot.$type !== type) {
      issues.push(
        `layers.${id}: tokens.${token} declares type "${type}", the contract has "${slot.$type}"`,
      );
    }
  }
  return issues;
};

/** The extension of a layer document in a layers directory. */
const EXTENSION = ".json";

/**
 * Lists the layer documents of a local directory. Each `.json` file is one
 * layer. The id is the file name without the extension. The result is in name
 * order.
 *
 * @param directory - The directory, as a URL with a trailing slash.
 * @throws Error when the directory is not local or cannot be listed.
 */
const list = async (directory: URL): Promise<Record<string, URL>> => {
  if (directory.protocol !== "file:") {
    throw new Error(
      `@untheme/kit: layers must be a local directory — cannot list ${directory.href}`,
    );
  }
  const path = fileURLToPath(directory);
  let entries: string[];
  try {
    entries = await readdir(path);
  } catch (error) {
    throw new Error(`@untheme/kit: cannot list the layers in ${path}`, {
      cause: error,
    });
  }
  const names = entries.filter((name) => name.endsWith(EXTENSION)).sort();
  return collect(names, (name) => [
    name.slice(0, -EXTENSION.length),
    new URL(name, directory),
  ]);
};

/**
 * Expands the `layers` of a config to the sources of each layer, by id. An
 * object is returned as it is. A path or URL names a directory: the function
 * lists it with {@link list} and records the directory in `documents`, so a
 * watcher sees a new file.
 */
const expand = async (
  layers: KitConfig["layers"],
  base: URL,
  documents: string[],
): Promise<Record<string, string | URL | (string | URL)[]>> => {
  if (layers === undefined) {
    return {};
  }
  if (typeof layers !== "string" && !(layers instanceof URL)) {
    return layers;
  }
  const located = locate(layers, base);
  const directory = new URL(`${located.href.replace(/\/+$/, "")}/`);
  const sources = await list(directory);
  const path = fileURLToPath(directory).replace(/[\\/]+$/, "");
  if (!documents.includes(path)) {
    documents.push(path);
  }
  return sources;
};

/**
 * Builds the layers of a build against its base theme. The base is the first
 * layer. The inherited layers follow, then the configured layers. A configured
 * layer with the id of an earlier one takes its place. The function checks
 * each layer against the contract and reports every issue together.
 *
 * @param sources - The configured layers, the inherited layers, and the base.
 * @param theme - The base theme that the layers apply to.
 * @param base - The project root that relative sources resolve against.
 * @param loader - The loader of the build. The directory joins its documents.
 * @param logger - The Terrazzo logger of the build.
 * @throws InvalidLayerError when a layer violates the contract.
 * @throws Error when the layers directory is not local or cannot be listed.
 */
export const buildLayers = async (
  sources: LayerSources,
  theme: Theme<Template>,
  base: URL,
  loader: Loader,
  logger?: Logger,
): Promise<BuiltLayer[]> => {
  const { load, documents } = loader;
  const all = new Map<string, Candidate>();
  all.set(theme.id, own(theme, sources.pristine, sources.description));
  for (const source of sources.inherited) {
    all.set(source.entry.id, await inherit(source, load));
  }
  const configured = await expand(sources.configured, base, documents);
  for (const [id, source] of entries(configured)) {
    all.set(id, await build(id, [source].flat(), base, load, logger));
  }
  const schema: Schema<Theme<Template>> = defineSchema(theme);
  const issues: string[] = [];
  const built: BuiltLayer[] = [];
  for (const { entry: listed, layer, types } of all.values()) {
    issues.push(...typed(listed.id, types, theme));
    try {
      schema.assert.layer(layer);
      built.push({ entry: listed, layer });
    } catch (error) {
      if (!(error instanceof SchemaError)) {
        throw error;
      }
      for (const issue of error.issues) {
        const at = (issue.path ?? []).join(".");
        issues.push(`layers.${listed.id}: ${at}: ${issue.message}`);
      }
    }
  }
  if (issues.length > 0) {
    throw new InvalidLayerError(issues);
  }
  return built;
};
