import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/module"],
  outDir: ".dist",
  declaration: true,
  externals: [
    "#app",
    "#imports",
    "#build/untheme.mjs",
    "#build/types/untheme.d.ts",
    "@nuxt/kit",
    "@nuxt/schema",
    "nuxt",
    "vue",
  ],
  rollup: {
    emitCJS: false,
  },
});
