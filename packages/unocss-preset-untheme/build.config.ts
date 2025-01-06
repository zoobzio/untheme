import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/preset"],
  clean: true,
  declaration: true,
  rollup: {
    inlineDependencies: true,
    emitCJS: true,
  },
  outDir: ".dist",
});
