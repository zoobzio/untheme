import type { Resolver } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";
import type {
  Core,
  GenerateOptions,
  GenerateResult,
  SharedOptions,
} from "./types";

import { defineConfig, parse } from "@terrazzo/parser";
import { SchemaError, defineSchema, guard } from "untheme";
import { map } from "untheme/common";

import { FILENAME } from "./constant";
import { skeleton } from "./contexts";
import { emit } from "./emit";
import { identity, locate, request, workspace } from "./source";
import { layers } from "./themes";
import { verify } from "./verify";

/**
 * Runs a schema validation and re-frames any failure so each issue points at
 * the offending token's source document instead of a path into the assembled
 * config.
 */
export const reframe = <T>(tokens: TokenNormalizedSet, run: () => T): T => {
  try {
    return run();
  } catch (error) {
    if (!(error instanceof SchemaError)) {
      throw error;
    }
    const lines = error.issues.map((issue) => {
      const path = issue.path ?? [];
      const token = path.find((segment) => segment in tokens);
      const at = path.join(".");
      let origin = "";
      if (token !== undefined) {
        const filename = tokens[token]?.source.filename;
        if (filename) {
          origin = ` (${filename})`;
        }
      }
      return `${at}: ${issue.message}${origin}`;
    });
    throw new Error(
      `untheme terrazzo: the converted tokens violate untheme's schema —\n${lines.join("\n")}`,
      { cause: error },
    );
  }
};

/**
 * Assembles and validates the base theme from parsed sources: skeleton off
 * the resolver, structural narrowing through `guard`, then untheme's schema
 * adjudicates every binding, and the round-trip verifier proves the
 * translation against Terrazzo's own resolution.
 */
export const assemble = (
  parsed: { resolver: Resolver | undefined; tokens: TokenNormalizedSet },
  options: SharedOptions,
): Core => {
  const pieces = skeleton(parsed.resolver, parsed.tokens);
  const { id, name } = identity(options, parsed.resolver);
  const base: unknown = {
    id,
    name,
    tokens: pieces.tokens,
    modifiers: pieces.modifiers,
    order: pieces.order,
  };
  if (!guard(base)) {
    throw new Error(
      "untheme terrazzo: the assembled base is not structurally a theme — this is a bug in @untheme/terrazzo",
    );
  }
  const schema = reframe(parsed.tokens, () => defineSchema(base));
  const theme = reframe(parsed.tokens, () => schema.parse.theme(base));
  const input = reframe(parsed.tokens, () => schema.parse.input(pieces.input));
  verify(parsed.resolver, parsed.tokens, theme, input);
  const flat = map(theme.tokens, (slot) => slot.$value);
  return { schema, theme, input, flat };
};

/**
 * The programmatic entry point: loads and parses the root document (through
 * the caller's `req` when given, so authenticated remote sources work),
 * assembles and validates the config, folds in the theme catalog, and returns
 * the emitted file. No filesystem writes — the caller owns I/O.
 */
export const generate = async (
  options: GenerateOptions,
): Promise<GenerateResult> => {
  const cwd = options.cwd ?? (await workspace());
  const url = locate(options.source, cwd);
  let src: string;
  if (options.req) {
    src = await options.req(url, cwd);
  } else {
    src = await request(url);
  }
  const config = defineConfig({}, { cwd });
  const parsed = await parse([{ filename: url, src }], {
    config,
    req: options.req,
    logger: options.logger,
    skipLint: true,
  });
  const core = assemble(parsed, options);
  const catalog = await layers(options.themes ?? [], {
    config,
    base: core.flat,
    origin: url,
    req: options.req,
    logger: options.logger,
  });
  const themes = reframe(parsed.tokens, () =>
    map(catalog, (layer) => core.schema.parse.layer(layer)),
  );
  const contents = emit(
    { theme: core.theme, themes, input: core.input },
    url.href,
  );
  return { filename: options.filename ?? FILENAME, contents };
};
