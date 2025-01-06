import type { UnthemeColorMode, UnthemeTemplate } from "untheme";
import { isUnthemeConfig } from "untheme";
import {
  defineNuxtModule,
  createResolver,
  addImportsDir,
  addTemplate,
  addPlugin,
  useLogger,
} from "@nuxt/kit";

interface UnthemeNuxtOptions {
  mode?: UnthemeColorMode;
  theme?: string;
  whitelist?: string[];
  config: UnthemeTemplate;
}

export default defineNuxtModule<UnthemeNuxtOptions>({
  meta: {
    name: "nuxt-untheme",
    configKey: "untheme",
  },
  setup(options) {
    const logger = useLogger();
    const { resolve } = createResolver(import.meta.url);

    if (isUnthemeConfig(options.config)) {
      addTemplate({
        filename: "untheme.config.mjs",
        write: true,
        getContents: () =>
          `export default ${JSON.stringify(options, null, 2)};`,
      });

      addPlugin({
        src: resolve("../runtime/plugin.ts"),
      });

      addImportsDir(resolve("../runtime/utils"));
    } else {
      logger.warn(
        "Invalid `untheme` configuration! Skipping initialization...",
        options,
      );
    }
  },
});
