import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * The composables run in vitest without a Nuxt environment. Each test file
 * mocks the generated `#build/untheme/*` modules and stubs the auto-imports
 * `useUntheme`, `useDemo`, `computed`, and `ref` as globals. The layers
 * manifest of aurora resolves to a fixture. Nothing here builds aurora.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@untheme/aurora/layers": fileURLToPath(
        new URL("./test/nuxt/layers.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
  },
});
