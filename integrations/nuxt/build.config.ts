import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/module",
    "src/config",
    "src/constant",
    { input: "src/server/index", name: "server" },
    { input: "src/aurora/index", name: "aurora" },
    // The runtime is shipped unbundled: Nuxt resolves these files by path and
    // compiles them in the app, where the #app/#imports/#build virtuals exist.
    { input: "src/runtime/", outDir: ".dist/runtime", builder: "mkdist" },
  ],
  outDir: ".dist",
  declaration: true,
  externals: [
    "#app",
    "#imports",
    "#build/untheme/config.mjs",
    "@nuxt/kit",
    "@nuxt/schema",
    "@untheme/kit",
    // Aurora's theme files stay in the package: the aurora entry imports each
    // one lazily by its package path, so the app's server bundler sees them.
    /^@untheme\/aurora\//,
    "nuxt",
    "vue",
    "h3",
  ],
  rollup: {
    emitCJS: false,
  },
});
