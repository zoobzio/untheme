import type { ParseResult } from "@terrazzo/parser";

import { Logger, defineConfig, parse } from "@terrazzo/parser";
import { readFile } from "node:fs/promises";

/**
 * The fixtures directory as a trailing-slash file URL.
 */
export const FIXTURES = new URL("./fixtures/", import.meta.url);

/**
 * A logger that reports only errors. Use it where a warning is expected, such as
 * the normalization of string colors in the old form, or where a hook requires a
 * logger.
 */
export const quiet = () => new Logger({ level: "error" });

/**
 * The terrazzo config every test parse runs under.
 */
export const config = defineConfig({}, { cwd: FIXTURES });

/**
 * Parses a fixture document as `generate()` does. The function reads the content
 * from disk, and the loader of the parser resolves references.
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
 * Parses an in-memory document under a virtual filename. Pass a logger when the
 * parse is expected to warn.
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
