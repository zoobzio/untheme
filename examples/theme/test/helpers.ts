import type { Kit } from "@untheme/kit";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig, resolveKit } from "@untheme/kit";

/** This package, as the project root of a build. */
export const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** The palette of the theme: its token document, as authored. */
export const palette = async (): Promise<Record<string, unknown>> =>
  JSON.parse(await readFile(join(ROOT, "src/mantis.json"), "utf8"));

/**
 * Builds the theme from its own config, as `untheme build` does for `.dist/`.
 * Each test file runs one build.
 */
export const build = async (): Promise<Kit> =>
  resolveKit(await loadConfig(join(ROOT, "untheme.config.ts")), { cwd: ROOT });

/** Builds aurora itself from the installed package, with no layers. */
export const upstream = async (): Promise<Kit> =>
  resolveKit(
    { source: "npm:/@untheme/aurora/src/resolver.json" },
    { cwd: ROOT },
  );
