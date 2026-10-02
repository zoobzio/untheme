import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/catalog", "src/config", "src/css"],
  outDir: ".dist",
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
