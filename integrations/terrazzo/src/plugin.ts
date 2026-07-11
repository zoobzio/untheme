import type { ConfigInit, Plugin } from "@terrazzo/parser";
import type { PluginOptions } from "./types";

import { map } from "untheme/common";

import { FILENAME } from "./constant";
import { emit } from "./emit";
import { assemble, reframe } from "./generate";
import { layers } from "./themes";

/**
 * The terrazzo plugin: the CLI parses the sources, this build hook runs the
 * same assemble/validate/verify pipeline as `generate()` and emits the
 * config through `outputFile` into the CLI's `outDir`. Theme documents named
 * in the options resolve against the first token source and load without
 * credentials — authenticated sources need `generate()` instead.
 */
export const plugin = (options: PluginOptions = {}): Plugin => {
  let config: ConfigInit | undefined;
  return {
    name: "@untheme/terrazzo",
    config(init) {
      config = init;
    },
    async build({ context, tokens, resolver, sources, outputFile }) {
      if (!config) {
        throw new Error(
          "untheme terrazzo: build ran before config — the terrazzo CLI calls the config hook first",
        );
      }
      const origin = sources[0]?.filename ?? config.outDir;
      const core = assemble({ resolver, tokens }, options);
      const catalog = await layers(options.themes ?? [], {
        config,
        base: core.flat,
        origin,
        logger: context.logger,
      });
      const themes = reframe(tokens, () =>
        map(catalog, (layer) => core.schema.parse.layer(layer)),
      );
      const contents = emit(
        { base: core.theme, themes, input: core.input },
        origin.href,
      );
      outputFile(options.filename ?? FILENAME, contents);
    },
  };
};
