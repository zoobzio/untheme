import type { Resolver } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";
import type { Core, KitConfig } from "./types";

import { SchemaError, defineSchema } from "@untheme/schema";
import { isTemplate } from "@untheme/utils";

import { skeleton } from "./contexts";
import { describe } from "./describe";
import { identity } from "./identity";
import { line } from "./util";
import { verify } from "./verify";

/**
 * Runs a schema validation. When it fails, the function throws an error that
 * names the source document of the token for each issue.
 */
export const reframe = <T>(tokens: TokenNormalizedSet, run: () => T): T => {
  try {
    return run();
  } catch (error) {
    if (!(error instanceof SchemaError)) {
      throw error;
    }
    const lines = error.issues.map((issue) => {
      const token = (issue.path ?? []).find((segment) => segment in tokens);
      const filename =
        token === undefined ? undefined : tokens[token]?.source.filename;
      return filename ? `${line(issue)} (${filename})` : line(issue);
    });
    throw new Error(
      `@untheme/kit: the converted tokens violate untheme's schema —\n${lines.join("\n")}`,
      { cause: error },
    );
  }
};

/**
 * Assembles and validates the base theme from parsed sources. The function reads
 * the skeleton from the resolver and narrows it with `isTemplate`. The untheme
 * schema validates every binding. The verifier compares the result with the
 * Terrazzo resolution.
 */
export const assemble = (
  parsed: { resolver: Resolver | undefined; tokens: TokenNormalizedSet },
  options: Pick<KitConfig, "id" | "name">,
): Required<Omit<Core, "layers" | "resolver">> => {
  const pieces = skeleton(parsed.resolver, parsed.tokens);
  const { id, name } = identity(options, parsed.resolver);
  const base: unknown = {
    id,
    name,
    tokens: pieces.tokens,
    modifiers: pieces.modifiers,
    order: pieces.order,
  };
  if (!isTemplate(base)) {
    throw new Error(
      "@untheme/kit: the assembled base is not structurally a theme — this is a bug in @untheme/kit",
    );
  }
  const schema = reframe(parsed.tokens, () => defineSchema(base));
  const theme = reframe(parsed.tokens, () => schema.parse.theme(base));
  const input = reframe(parsed.tokens, () => schema.parse.input(pieces.input));
  verify(parsed.resolver, parsed.tokens, theme, input);
  return { theme, input, manifest: describe(theme, parsed.resolver) };
};
