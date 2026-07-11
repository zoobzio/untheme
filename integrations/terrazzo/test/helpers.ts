import type { ParseResult } from "@terrazzo/parser";

import { Logger, defineConfig, parse } from "@terrazzo/parser";
import { readFile } from "node:fs/promises";

/**
 * The fixtures directory as a trailing-slash file URL.
 */
export const FIXTURES = new URL("./fixtures/", import.meta.url);

/**
 * A logger that reports only errors. The fixtures are spec-compliant, so
 * tests run with Terrazzo's default logger and any warning is a real signal;
 * reach for this only where a warning is the expected behavior under test
 * (the legacy-form normalization case) or where a hook demands a logger.
 */
export const quiet = () => new Logger({ level: "error" });

/**
 * The terrazzo config every test parse runs under.
 */
export const config = defineConfig({}, { cwd: FIXTURES });

/**
 * Parses a fixture document the way generate() does: content loaded from
 * disk, references resolved through the parser's own loader.
 */
export const load = async (
  name: string,
): Promise<{ url: URL; src: string; parsed: ParseResult }> => {
  const url = new URL(name, FIXTURES);
  const src = await readFile(url, "utf8");
  const parsed = await parse([{ filename: url, src }], {
    config,
    skipLint: true,
  });
  return { url, src, parsed };
};

/**
 * Parses an in-memory document under a virtual filename, for error-path
 * fixtures and deliberate off-spec forms that don't warrant a file. Pass a
 * logger only when the parse is expected to warn.
 */
export const inline = async (
  name: string,
  document: object,
  logger?: Logger,
): Promise<ParseResult> => {
  const url = new URL(name, FIXTURES);
  return parse([{ filename: url, src: JSON.stringify(document) }], {
    config,
    logger,
    skipLint: true,
  });
};
