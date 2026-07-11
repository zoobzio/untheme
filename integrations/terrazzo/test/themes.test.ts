import { describe, expect, it } from "vitest";

import { assemble } from "../src/generate";
import { layers } from "../src/themes";
import { FIXTURES, config, load } from "./helpers";

const core = async () => {
  const { parsed } = await load("resolver.json");
  return assemble(parsed, {});
};

describe("layers", () => {
  it("emits only the bindings that deviate from the base", async () => {
    const { flat } = await core();
    const catalog = await layers([{ source: "./dark-ocean.json" }], {
      config,
      base: flat,
      origin: FIXTURES,
    });
    const layer = catalog["dark-ocean"];
    expect(layer.id).toBe("dark-ocean");
    expect(layer.name).toBe("dark-ocean");
    expect(layer.tokens).toEqual({
      "color.primary.600": {
        colorSpace: "srgb",
        components: [
          0.054901960784313725, 0.4549019607843137, 0.5647058823529412,
        ],
        alpha: 1,
        hex: "#0e7490",
      },
      "color.primary.default": "{color.primary.50}",
    });
  });

  it("honors explicit identity over the filename", async () => {
    const { flat } = await core();
    const catalog = await layers(
      [{ source: "./dark-ocean.json", id: "ocean", name: "Ocean" }],
      { config, base: flat, origin: FIXTURES },
    );
    expect(catalog.ocean).toMatchObject({ id: "ocean", name: "Ocean" });
  });

  it("rejects a theme that adds tokens the base does not declare", async () => {
    const { flat } = await core();
    await expect(
      layers([{ source: "./rogue.json" }], {
        config,
        base: flat,
        origin: FIXTURES,
      }),
    ).rejects.toThrow(/color\.brand.*only rebinds, never adds/);
  });

  it("rejects two theme documents sharing an id", async () => {
    const { flat } = await core();
    await expect(
      layers(
        [{ source: "./dark-ocean.json" }, { source: "./dark-ocean.json" }],
        { config, base: flat, origin: FIXTURES },
      ),
    ).rejects.toThrow(/share the id "dark-ocean"/);
  });
});
