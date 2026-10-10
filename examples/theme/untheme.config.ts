import { defineConfig } from "@untheme/kit";

/**
 * The build of the theme. The source is aurora, a preset: its resolver
 * document and its themes as layers. The config extends the `ramps` set of
 * aurora with the palette of the theme. The base theme holds the ramps of
 * mantis, and every role, every context, and every theme of aurora follows.
 * The build writes to `.dist/`, and the package exports the modules, the
 * layer files, and its own preset manifest, so another build can name this
 * package as its source.
 */
export default defineConfig({
  source: "npm:/@untheme/aurora",
  name: "Mantis",
  extend: {
    description:
      "Aurora with the palette of the mantis shrimp: peacock teal, coral, and violet on greys with a green cast.",
    sets: { ramps: { sources: [{ $ref: "./src/mantis.json" }] } },
  },
  outDir: ".dist",
});
