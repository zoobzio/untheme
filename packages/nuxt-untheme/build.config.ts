import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/module", "src/config"],
  clean: true,
  declaration: true,
  outDir: ".dist",
});
