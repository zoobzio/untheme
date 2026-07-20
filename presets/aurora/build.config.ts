import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineBuildConfig } from "unbuild";

/*
 * Every theme document is its own entry so each stays importable at
 * `@untheme/aurora/themes/<name>`. The list is read from the directory —
 * themes are generated, so the entries follow whatever exists. Explicit
 * rollup entries (rather than the mkdist builder) keep `unbuild --stub`
 * functional: stubs are real modules the exports map can serve, so a
 * stubbed workspace still resolves the package.
 */
const themes = readdirSync(
  fileURLToPath(new URL("./src/themes", import.meta.url)),
)
  .filter((file) => file.endsWith(".ts"))
  .map((file) => `src/themes/${file.slice(0, -".ts".length)}`);

export default defineBuildConfig({
  entries: ["src/index", ...themes],
  outDir: ".dist",
  declaration: true,
  rollup: {
    emitCJS: false,
  },
});
