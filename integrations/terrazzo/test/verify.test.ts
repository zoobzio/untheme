import { describe, expect, it } from "vitest";

import { assemble } from "../src/generate";
import { verify } from "../src/verify";
import { load } from "./helpers";

describe("verify", () => {
  it("passes for a faithful translation", async () => {
    const { parsed } = await load("resolver.json");
    const core = assemble(parsed, {});
    expect(() =>
      verify(parsed.resolver, parsed.tokens, core.theme, core.input),
    ).not.toThrow();
  });

  it("catches a translation that drifts from Terrazzo's resolution", async () => {
    const { parsed } = await load("resolver.json");
    const core = assemble(parsed, {});
    core.theme.tokens["color.surface"].$value = {
      colorSpace: "srgb",
      components: [1, 0, 0],
      alpha: 1,
    };
    expect(() =>
      verify(parsed.resolver, parsed.tokens, core.theme, core.input),
    ).toThrow(/translation drift.*color\.surface/);
  });
});
