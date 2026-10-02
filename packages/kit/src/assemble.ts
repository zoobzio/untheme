import type { Resolver } from "@terrazzo/parser";
import type { TokenNormalizedSet } from "@terrazzo/token-types";
import type { Core, KitConfig } from "./types";

import { SchemaError, defineSchema } from "@untheme/schema";
import { isTemplate } from "@untheme/utils";

import { skeleton } from "./contexts";
import { identity } from "./identity";
import { verify } from "./verify";

/**
 * Runs a schema validation and re-frames any failure so each issue points at
 * the offending token's source document instead of a path into the assembled
 * theme.
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
      `@untheme/kit: the converted tokens violate untheme's schema —\n${lines.join("\n")}`,
      { cause: error },
    );
  }
};

/**
 * Assembles and validates the base theme from parsed sources: skeleton off
 * the resolver, structural narrowing through `isTemplate`, then untheme's
 * schema adjudicates every binding, and the round-trip verifier proves the
 * translation against Terrazzo's own resolution.
 */
export const assemble = (
  parsed: { resolver: Resolver | undefined; tokens: TokenNormalizedSet },
  options: Pick<KitConfig, "id" | "name">,
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
  if (!isTemplate(base)) {
    throw new Error(
      "@untheme/kit: the assembled base is not structurally a theme — this is a bug in @untheme/kit",
    );
  }
  const schema = reframe(parsed.tokens, () => defineSchema(base));
  const theme = reframe(parsed.tokens, () => schema.parse.theme(base));
  const input = reframe(parsed.tokens, () => schema.parse.input(pieces.input));
  verify(parsed.resolver, parsed.tokens, theme, input);
  return { theme, input };
};
