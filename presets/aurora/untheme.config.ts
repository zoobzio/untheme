import { defineConfig } from "@untheme/kit";

/**
 * The build of the preset. The source is the resolver document. Each token
 * document under `src/themes/` is a layer, and its file name is the id of the
 * theme. The build writes to `.dist/`, and the package exports the modules and
 * the layer files.
 */
export default defineConfig({
  source: "./src/resolver.json",
  layers: "./src/themes",
  outDir: ".dist",
});
