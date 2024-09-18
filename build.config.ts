import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "plugins/kit", "plugins/color/index"],
  clean: true,
  declaration: true,
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
  },
  outDir: ".dist",
});
