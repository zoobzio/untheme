import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * The composables run in vitest with no Nuxt environment. Each test file
 * mocks the `#build/untheme/*` modules and stubs the auto-imports as globals.
 * The alias points `@untheme/aurora/layers` at the fixture layers.
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
