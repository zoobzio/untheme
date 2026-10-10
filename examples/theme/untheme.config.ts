import { defineConfig } from "@untheme/kit";

/**
 * The build of the theme. The source is aurora, a preset: its resolver
 * document and its themes as layers. The config extends aurora twice. The
 * `ramps` set takes the palette of the theme, so every role, every context,
 * and every theme of aurora follows it. The `roles` set takes the `syntax-*`
 * group, color roles over the ramps for code highlighting, and the dark color
 * context takes the dark bindings of the group. The build writes to `.dist/`,
 * and the package exports the modules, the layer files, and its own preset
 * manifest, so an app or another build can name this package as its source.
 */
export default defineConfig({
  source: "npm:/@untheme/aurora",
  name: "Mantis",
  extend: {
    description:
      "Aurora with the palette of the mantis shrimp: peacock teal, coral, and violet on greys with a green cast.",
    sets: {
      ramps: { sources: [{ $ref: "./src/mantis.json" }] },
      roles: { sources: [{ $ref: "./src/syntax.json" }] },
    },
    modifiers: {
      color: { contexts: { dark: [{ $ref: "./src/syntax-dark.json" }] } },
    },
  },
  outDir: ".dist",
});
