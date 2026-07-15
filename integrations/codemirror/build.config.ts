import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index"],
  outDir: ".dist",
  declaration: true,
  externals: [
    "untheme",
    "untheme/css",
    "untheme/common",
    "@codemirror/language",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/highlight",
  ],
  rollup: {
    emitCJS: false,
  },
});
