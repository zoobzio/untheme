import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/catalog", "src/config", "src/css", "src/kit"],
  outDir: ".dist",
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
