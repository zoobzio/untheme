import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/test/**/*.test.ts", "presets/*/test/**/*.test.ts"],
    server: {
      deps: {
        inline: ["@material/material-color-utilities"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: ".coverage",
      include: ["packages/*/src/**/*.{ts,vue}", "presets/*/src/**/*.{ts,vue}"],
    },
  },
});
