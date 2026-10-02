import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/cli"],
  outDir: ".dist",
  declaration: true,
  externals: [
    "@terrazzo/parser",
    "@terrazzo/token-types",
    "@untheme/core",
    "@untheme/schema",
    "@untheme/utils",
    "jiti",
    "objectively",
  ],
  rollup: {
    emitCJS: false,
  },
});
