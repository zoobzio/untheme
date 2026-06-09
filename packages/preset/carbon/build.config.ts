import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/themes/index"],
  outDir: ".dist",
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
