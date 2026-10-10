import { defineConfig } from "@untheme/kit";

/**
 * Mantis with an added `syntax-*` token group, as DTCG JSON. The source is the
 * theme example, a preset: its resolver document and its themes as layers.
 * `extend` adds `tokens/syntax.json` to the `roles` set, since the carriers
 * are color roles over the ramps, and adds `tokens/syntax-dark.json` to the
 * dark color context. `untheme build` turns the result into the modules in
 * `untheme/`.
 */
export default defineConfig({
  source: "npm:/@untheme/example-theme",
  name: "Mantis Syntax",
  extend: {
    sets: { roles: { sources: [{ $ref: "./tokens/syntax.json" }] } },
    modifiers: {
      color: { contexts: { dark: [{ $ref: "./tokens/syntax-dark.json" }] } },
    },
  },
});
