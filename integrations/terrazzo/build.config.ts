import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  outDir: ".dist",
  declaration: true,
  externals: ["@terrazzo/parser", "@terrazzo/token-types"],
  rollup: {
    emitCJS: false,
  },
});
