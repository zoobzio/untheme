import { describe, expect, it } from "vitest";

import { generate } from "../src/generate";
import { plugin } from "../src/plugin";
import { FIXTURES, config, load, quiet } from "./helpers";

describe("plugin", () => {
  it("emits the same config through the build hook as generate does", async () => {
    const { parsed } = await load("resolver.json");
    const written: Record<string, string> = {};
    const instance = plugin({
      themes: [{ source: "./dark-ocean.json", name: "Dark Ocean" }],
    });
    instance.config?.(config, { logger: quiet() });
    await instance.build?.({
      context: { logger: quiet() },
      tokens: parsed.tokens,
      resolver: parsed.resolver,
      sources: parsed.sources,
      getTransforms: () => [],
      outputFile: (filename, contents) => {
        written[filename] = String(contents);
      },
    });

    const emitted = written["untheme.config.ts"];
    expect(emitted).toBeDefined();
    if (emitted === undefined) {
      throw new Error("expected untheme.config.ts to be written");
    }

    const reference = await generate({
      source: "./resolver.json",
      cwd: FIXTURES,
      themes: [{ source: "./dark-ocean.json", name: "Dark Ocean" }],
    });

    /*
     * The header names the origin, which may differ between the two paths;
     * everything below it must be identical.
     */
    const body = (contents: string) => contents.split("\n").slice(4).join("\n");
    expect(body(emitted)).toBe(body(reference.contents));
  });

  it("errors when build runs without the config hook", async () => {
    const { parsed } = await load("resolver.json");
    const instance = plugin();
    await expect(
      instance.build?.({
        context: { logger: quiet() },
        tokens: parsed.tokens,
        resolver: parsed.resolver,
        sources: parsed.sources,
        getTransforms: () => [],
        outputFile: () => undefined,
      }),
    ).rejects.toThrow(/build ran before config/);
  });
});
