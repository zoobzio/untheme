import { readFileSync } from "node:fs";

import { defineConfig } from "@untheme/kit";

/** The ids of the themes. Each theme is a layer of the build. */
const themes: string[] = Object.keys(
  JSON.parse(
    readFileSync(new URL("./scripts/seeds.json", import.meta.url), "utf8"),
  ),
);

/**
 * The build of the preset. The source is the resolver document. Each theme
 * under `src/themes/` is a layer. The build writes to `.dist/`, and the
 * package exports the modules and the layer files.
 */
export default defineConfig({
  source: "./src/resolver.json",
  layers: Object.fromEntries(
    themes.map((id) => [id, `./src/themes/${id}.json`]),
  ),
  outDir: ".dist",
});
