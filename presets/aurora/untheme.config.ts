import { readFileSync } from "node:fs";

import { defineConfig } from "@untheme/kit";

/**
 * The ids of the themes, from the seeds that generate them. Each theme is a
 * layer of the build.
 */
const themes: string[] = Object.keys(
  JSON.parse(
    readFileSync(new URL("./scripts/seeds.json", import.meta.url), "utf8"),
  ),
);

/**
 * The build of the preset. The source is the resolver document of this
 * package, with every modifier as the document declares it. Each theme under
 * `src/themes/` is a layer. The build writes to `.dist/`. The package exports
 * the modules of the build, so an app imports `@untheme/aurora/config`,
 * `@untheme/aurora/manifest`, and `@untheme/aurora/layers` with no kit of its
 * own, and serves `@untheme/aurora/layers/<id>.json` as it is.
 */
export default defineConfig({
  source: "./src/resolver.json",
  layers: Object.fromEntries(
    themes.map((id) => [id, `./src/themes/${id}.json`]),
  ),
  outDir: ".dist",
});
