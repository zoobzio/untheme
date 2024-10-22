import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/module"],
  clean: true,
  declaration: true,
  outDir: ".dist",
});
