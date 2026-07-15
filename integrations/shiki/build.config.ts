import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  outDir: ".dist",
  declaration: true,
  externals: ["shiki", "untheme", "untheme/css"],
  rollup: {
    emitCJS: false,
  },
});
