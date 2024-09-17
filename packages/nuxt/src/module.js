import { defineNuxtModule, createResolver, addPlugin, addImportsDir, addTemplate, addTypeTemplate, } from "@nuxt/kit";
export default defineNuxtModule({
    meta: {
        name: "@untheme/nuxt",
        configKey: "untheme",
    },
    setup(config) {
        addTemplate({
            filename: "untheme.config.mjs",
            getContents: () => {
                return [
                    `import { defineUnthemeConfig } from "untheme";`,
                    `export default defineUnthemeConfig(${JSON.stringify(config, null, 2)});`,
                ].join("\n");
            },
        });
        addTypeTemplate({
            filename: "types/untheme.d.ts",
            getContents: () => {
                return [
                    `import { defineUnthemeConfig } from "untheme";`,
                    `const untheme = defineUnthemeConfig(${JSON.stringify(config, null, 2)});`,
                    `export type UnthemeConfig = typeof untheme;`,
                ].join("\n");
            },
        });
        const { resolve } = createResolver(import.meta.url);
        addImportsDir(resolve("../runtime/utils"));
        addPlugin({
            src: resolve("../runtime/plugin"),
        });
    },
});
