import { defineConfig } from "vitest/config";

export default defineConfig({
  // `import.meta.server` is a Nuxt define. The tests set the global.
  plugins: [
    {
      name: "untheme:server",
      transform: (code) =>
        code.includes("import.meta.server")
          ? code.replaceAll(
              "import.meta.server",
              "globalThis.__untheme_server__",
            )
          : undefined,
    },
  ],
  test: {
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: ".coverage",
      include: ["src/**/*.ts"],
    },
  },
});
