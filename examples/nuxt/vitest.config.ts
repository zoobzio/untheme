import { defineConfig } from "vitest/config";

/**
 * The composables run in vitest without a Nuxt environment. Each test file
 * mocks the generated `#build/untheme/*` modules and stubs the auto-imports
 * `useUntheme` and `computed` as globals. Nothing here builds aurora.
 */
export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
