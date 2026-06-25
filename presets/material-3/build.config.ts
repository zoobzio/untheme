import { readdirSync } from "node:fs";
import { defineBuildConfig } from "unbuild";

// One rollup entry per theme keeps the ./themes/* subpath structure while
// emitting real .mjs outputs — so `unbuild --stub` produces jiti .mjs shims
// that resolve through the package exports in both stub and full-build modes.
const themes = readdirSync("src/themes")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => `src/themes/${file.slice(0, -3)}`);

export default defineBuildConfig({
  entries: ["src/index", ...themes],
  outDir: ".dist",
  declaration: true,
  // Type-only, reached transitively through @untheme/kit; resolved via kit's
  // own dependency at consume-time, so keep it external rather than inlined.
  externals: ["@untheme/schema"],
});
