import { describe, expect, it } from "vitest";

import { skeleton } from "../src/contexts";
import { inline, load, quiet } from "./helpers";

describe("skeleton", () => {
  it("reads the base, contexts, order, and selection off the resolver", async () => {
    const { parsed } = await load("resolver.json");
    const pieces = skeleton(parsed.resolver, parsed.tokens);

    expect(pieces.tokens["color.primary.default"]).toEqual({
      $type: "color",
      $value: "{color.primary.600}",
    });
    expect(pieces.tokens["border.thin"]).toEqual({
      $type: "border",
      $description: "Hairline outline.",
      $value: {
        color: "{color.primary.600}",
        width: "{size.sm}",
        style: "solid",
      },
    });

    expect(pieces.modifiers.color.light).toEqual({});
    expect(pieces.modifiers.color.dark["color.primary.default"]).toBe(
      "{color.primary.50}",
    );
    expect(pieces.modifiers.color.dark["color.surface"]).toMatchObject({
      colorSpace: "srgb",
    });
    expect(pieces.modifiers.density.default).toEqual({});
    expect(pieces.modifiers.density.compact).toEqual({
      "size.md": { value: 6, unit: "px" },
    });

    expect(pieces.order).toEqual(["color", "density"]);
    expect(pieces.input).toEqual({ color: "light", density: "default" });
  });

  it("stands a plain token document alone, without axes", async () => {
    const { parsed } = await load("base.json");
    const pieces = skeleton(parsed.resolver, parsed.tokens);
    expect(Object.keys(pieces.tokens)).toContain("color.primary.600");
    expect(pieces.modifiers).toEqual({});
    expect(pieces.order).toEqual([]);
    expect(pieces.input).toEqual({});
  });

  it("normalizes legacy string colors into spec objects", async () => {
    /*
     * The one deliberate legacy-form case: Terrazzo accepts pre-2025 string
     * colors, warns, and normalizes them — the quiet logger suppresses that
     * expected warning only here.
     */
    const parsed = await inline(
      "virtual/legacy.json",
      {
        color: {
          $type: "color",
          brand: { $value: "#ff0000" },
        },
      },
      quiet(),
    );
    const pieces = skeleton(parsed.resolver, parsed.tokens);
    expect(pieces.tokens["color.brand"]).toEqual({
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 0, 0],
        alpha: 1,
      },
    });
  });

  it("rejects a modifier without a default context", async () => {
    const parsed = await inline("virtual/no-default.resolver.json", {
      name: "No Default",
      version: "2025.10",
      modifiers: {
        color: {
          contexts: {
            light: [{ tone: { $type: "number", $value: 1 } }],
            dark: [{ tone: { $type: "number", $value: 2 } }],
          },
        },
      },
      resolutionOrder: [{ $ref: "#/modifiers/color" }],
    });
    expect(() => skeleton(parsed.resolver, parsed.tokens)).toThrow(
      /modifier "color" declares no default/,
    );
  });

  it("rejects a context that introduces tokens outside the base", async () => {
    const parsed = await inline("virtual/alien.resolver.json", {
      name: "Alien",
      version: "2025.10",
      sets: {
        core: { sources: [{ tone: { $type: "number", $value: 1 } }] },
      },
      modifiers: {
        color: {
          contexts: {
            light: [{}],
            dark: [{ extra: { $type: "number", $value: 2 } }],
          },
          default: "light",
        },
      },
      resolutionOrder: [{ $ref: "#/sets/core" }, { $ref: "#/modifiers/color" }],
    });
    expect(() => skeleton(parsed.resolver, parsed.tokens)).toThrow(
      /introduces tokens missing from the base contract: extra/,
    );
  });
});
