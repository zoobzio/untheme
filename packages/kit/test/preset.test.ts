import type { Color } from "@untheme/schema";

import { describe, it, expect } from "vitest";

import { defineUnthemePreset } from "../src/preset";

const white: Color = { colorSpace: "srgb", components: [1, 1, 1] };

/**
 * `defineUnthemePreset` is the authoring front door over `makePreset`: it
 * infers the base's token union from its own keys and — through `NoInfer` —
 * checks every modifier override key against that set. The widening chain
 * beyond the base is `makePreset`'s and lives in `factory.test.ts`.
 */
describe("defineUnthemePreset", () => {
  it("builds a preset whose token union is inferred from the base", () => {
    const preset = defineUnthemePreset({
      id: "base",
      name: "Base",
      tokens: { primary: { $type: "color", $value: white } },
      modifiers: { color: { light: {}, dark: { primary: "{primary}" } } },
      order: ["color"],
    });
    const config = preset.use({ color: "dark" });
    expect(config.theme.tokens.primary.$type).toBe("color");
    expect(config.input).toEqual({ color: "dark" });
  });

  it("checks modifier override keys against the inferred tokens", () => {
    defineUnthemePreset({
      id: "base",
      name: "Base",
      tokens: { primary: { $type: "color", $value: white } },
      // @ts-expect-error ghost is not a declared token of the base
      modifiers: { color: { light: {}, dark: { ghost: "{primary}" } } },
      order: ["color"],
    });
    expect(true).toBe(true);
  });
});
