import type { Logger } from "@terrazzo/parser";
import type { Layer, Schema, Template, Theme } from "@untheme/schema";
import type { BuiltLayer, KitConfig, Req } from "./types";

import { defineConfig, parse } from "@terrazzo/parser";
import { SchemaError, defineSchema } from "@untheme/schema";
import { map, record } from "objectively";

import { sorted } from "./contexts";
import { binding } from "./convert";
import { entry, named } from "./describe";
import { InvalidLayerError } from "./error";
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
 * Builds one layer from its sources. The function reads each source through
 * `load`. Terrazzo parses the sources with aliases unresolved, so a reference
 * to a token of the base stays a `{name}` string and the parse needs no base
 * document. Terrazzo flattens the groups and normalizes the values. The
 * function converts each token to its binding. The result has the tokens of
 * the sources, in the order of the Terrazzo collation. A later source wins.
 *
 * The name is the `name` under the `io.zoobz.untheme` key of `$extensions` at
 * the root of the last source that has one, or the titled id. The description
 * is the `$description` at the root of the last source that has one.
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

/**
 * Builds the layers of a config against a base theme. The function reads the
 * sources of each layer through `load`, so the loader records them. It checks
 * each layer against the contract of the theme and reports every issue of
 * every layer together. The result keeps the order of the config.
 *
 * @param layers - The `layers` of the config.
 * @param theme - The base theme that the layers apply to.
 * @param base - The project root that relative sources resolve against.
 * @param load - The loader of the build.
 * @param logger - The Terrazzo logger of the build.
 * @throws InvalidLayerError when a layer violates the contract.
 */
export const buildLayers = async (
  layers: NonNullable<KitConfig["layers"]>,
  theme: Theme<Template>,
  base: URL,
  load: Req,
  logger?: Logger,
): Promise<BuiltLayer[]> => {
  const built: BuiltLayer[] = [];
  const issues: string[] = [];
  for (const [id, source] of Object.entries(layers)) {
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
