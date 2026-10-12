import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      input: [
        "./src/index.ts",
        "./src/catalog.ts",
        "./src/config.ts",
        "./src/css.ts",
      ],
      outDir: ".dist",
    },
  ],
});
