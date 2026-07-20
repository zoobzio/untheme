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

    /* Dropping listPermutations forces verify off the enumerated-permutation
       path and onto the defaults-plus-single-context-deviation fallback. */
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
