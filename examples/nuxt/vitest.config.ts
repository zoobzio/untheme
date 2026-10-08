import { defineConfig } from "vitest/config";

/**
 * The composables run in vitest with no Nuxt environment. Each test file
 * mocks the `#build/untheme/*` modules and stubs the auto-imports as globals.
 */
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
