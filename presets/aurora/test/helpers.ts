import type { Kit } from "@untheme/kit";
import type { Selection } from "@untheme/testing";
import type { Template, Theme, Untheme } from "untheme";

import { fileURLToPath } from "node:url";

import { resolveKit } from "@untheme/kit";
import { bootUntheme } from "@untheme/testing";

/** This package, as the project root of a build. */
export const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** The `src/` directory. Every document of the preset is under it. */
export const SRC = new URL("../src/", import.meta.url);

/**
 * Builds the preset from its own resolver document, as `untheme build` does
 * for `.dist/`. Each test file runs one build.
 */
export const build = (): Promise<Kit> =>
  resolveKit({ source: "./src/resolver.json" }, { cwd: ROOT });

/**
 * Boots a service over a built theme. The service starts at the boot selection
 * of the build, which is the default context of each modifier. A pinned
 * context replaces the default of its modifier.
 *
 * @param kit - The build to boot.
 * @param selection - The contexts to pin.
 */
export const boot = (
  kit: Kit,
  selection: Selection<Theme<Template>> = {},
): Untheme<Theme<Template>> =>
  bootUntheme(kit.theme, { ...kit.input, ...selection });
