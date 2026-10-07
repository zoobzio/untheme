import { describe, expect, it } from "vitest";

import { assemble } from "../src/assemble";
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
    const surface = core.theme.tokens["color.surface"];
    if (surface === undefined) {
      throw new Error("expected the color.surface token");
    }
    surface.$value = {
      colorSpace: "srgb",
      components: [1, 0, 0],
      alpha: 1,
    };
    expect(() =>
      verify(parsed.resolver, parsed.tokens, core.theme, core.input),
    ).toThrow(/translation drift.*color\.surface/);
  });

  it("falls back to single-context deviations when the resolver cannot enumerate", async () => {
    const { parsed } = await load("resolver.json");
    const core = assemble(parsed, {});

    /* Removing listPermutations makes verify use the fallback of the defaults
       plus every single-context deviation. */
    Reflect.deleteProperty(parsed.resolver ?? {}, "listPermutations");
    expect(parsed.resolver?.listPermutations).toBeUndefined();

    expect(() =>
      verify(parsed.resolver, parsed.tokens, core.theme, core.input),
    ).not.toThrow();

    const surface = core.theme.tokens["color.surface"];
    if (surface === undefined) {
      throw new Error("expected the color.surface token");
    }
    surface.$value = {
      colorSpace: "srgb",
      components: [1, 0, 0],
      alpha: 1,
    };
    expect(() =>
      verify(parsed.resolver, parsed.tokens, core.theme, core.input),
    ).toThrow(/translation drift.*color\.surface/);
  });
});
