import { describe, expect, it } from "vitest";

import { defineEnum } from "../src/enum";
import {
  COLOR_SPACE_SET,
  DEFINITION_KEY_SET,
  DIMENSION_UNIT_SET,
  DURATION_UNIT_SET,
  FONT_WEIGHT_SET,
  LINE_CAP_SET,
  REQUIRED_DEFINITION_KEY_SET,
  STROKE_STYLE_SET,
  THEME_KEY_SET,
  TOKEN_TYPE_SET,
} from "../src/scalar";
import { template } from "./fixture";

describe("defineEnum", () => {
  const enums = defineEnum(template);

  it("derives the token set from the template keys", () => {
    expect(enums.tokens.has("color.bg")).toBe(true);
    expect(enums.tokens.has("type.heading")).toBe(true);
    expect([...enums.tokens]).not.toContain("ghost");
    expect(enums.tokens.size).toBe(Object.keys(template.tokens).length);
  });

  it("derives the modifier set from the modifier keys", () => {
    expect([...enums.modifiers]).toEqual(["mode", "contrast"]);
  });

  it("maps each modifier to its own context keys", () => {
    expect([...enums.contexts.mode]).toEqual(["light", "dark"]);
    expect([...enums.contexts.contrast]).toEqual(["normal", "high"]);
  });

  it("records each token's declared type", () => {
    expect(enums.types["color.bg"]).toBe("color");
    expect(enums.types["space.sm"]).toBe("dimension");
    expect(enums.types["shadow.sm"]).toBe("shadow");
    expect(enums.types["type.heading"]).toBe("typography");
  });

  it("shares the spec sets from scalar", () => {
    expect(enums.tokenTypes).toBe(TOKEN_TYPE_SET);
    expect(enums.colorSpaces).toBe(COLOR_SPACE_SET);
    expect(enums.dimensionUnits).toBe(DIMENSION_UNIT_SET);
    expect(enums.durationUnits).toBe(DURATION_UNIT_SET);
    expect(enums.fontWeights).toBe(FONT_WEIGHT_SET);
    expect(enums.strokeStyles).toBe(STROKE_STYLE_SET);
    expect(enums.lineCaps).toBe(LINE_CAP_SET);
    expect(enums.definitionKeys).toBe(DEFINITION_KEY_SET);
    expect(enums.requiredDefinitionKeys).toBe(REQUIRED_DEFINITION_KEY_SET);
    expect(enums.themeKeys).toBe(THEME_KEY_SET);
  });

  it("handles a template with no modifiers", () => {
    const bare = defineEnum({
      id: "bare",
      name: "Bare",
      tokens: {
        a: { $type: "number", $value: 1 },
      },
      modifiers: {},
      order: [],
    });
    expect([...bare.modifiers]).toEqual([]);
    expect([...bare.tokens]).toEqual(["a"]);
    expect(bare.types.a).toBe("number");
  });
});
