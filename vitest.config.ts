import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/*/test/**/*.test.ts",
      "packages/preset/*/test/**/*.test.ts",
    ],
    server: {
      deps: {
        inline: ["@material/material-color-utilities"],
      },
    },
  },
});
