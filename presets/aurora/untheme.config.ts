import { defineConfig } from "@untheme/kit";

/**
 * The build of the preset. The source is the resolver document of this
 * package, with every modifier as the document declares it. The build writes
 * to `.dist/`. The package exports the modules of the build, so an app imports
 * `@untheme/aurora/config` and `@untheme/aurora/manifest` with no kit of its
 * own.
 */
export default defineConfig({
  source: "./src/resolver.json",
  outDir: ".dist",
});
