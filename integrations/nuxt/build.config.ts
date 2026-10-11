import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/module",
    "src/config",
    "src/constant",
    // The runtime files ship unbundled. Nuxt compiles them in the app.
    { input: "src/runtime/", outDir: ".dist/runtime", builder: "mkdist" },
  ],
  outDir: ".dist",
  declaration: true,
  externals: [
    "#app",
    "#imports",
    "#build/untheme/config.mjs",
    "#build/untheme/layers.mjs",
    "@nuxt/kit",
    "@nuxt/schema",
    "@untheme/kit",
    "nuxt",
    "vue",
  ],
  rollup: {
    emitCJS: false,
  },
});
