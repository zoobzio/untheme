import { describe, expect, it } from "vitest";

import {
  COLOR_SPACES,
  DEFINITION_KEYS,
  DIMENSION_UNITS,
  DURATION_UNITS,
  FONT_WEIGHTS,
  LINE_CAPS,
  REQUIRED_DEFINITION_KEYS,
  STROKE_STYLES,
  THEME_KEYS,
  TYPES,
} from "../src/constant";
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
  component,
  literalColor,
  literalCubicBezier,
  literalDimension,
  literalDuration,
  literalFontFamily,
  literalFontWeight,
  literalNumber,
} from "../src/scalar";

describe("spec sets mirror their constant arrays", () => {
  const pairs: [Set<string>, readonly string[]][] = [
    [TOKEN_TYPE_SET, TYPES],
    [COLOR_SPACE_SET, COLOR_SPACES],
    [DIMENSION_UNIT_SET, DIMENSION_UNITS],
    [DURATION_UNIT_SET, DURATION_UNITS],
    [FONT_WEIGHT_SET, FONT_WEIGHTS],
    [STROKE_STYLE_SET, STROKE_STYLES],
    [LINE_CAP_SET, LINE_CAPS],
    [DEFINITION_KEY_SET, DEFINITION_KEYS],
    [REQUIRED_DEFINITION_KEY_SET, REQUIRED_DEFINITION_KEYS],
    [THEME_KEY_SET, THEME_KEYS],
  ];

  it("holds exactly the array members", () => {
    for (const [set, array] of pairs) {
      expect(set.size).toBe(array.length);
      for (const member of array) {
        expect(set.has(member)).toBe(true);
      }
    }
  });
});

describe("component", () => {
  it("accepts the 'none' sentinel and finite numbers", () => {
    expect(component("none")).toBeUndefined();
    expect(component(0)).toBeUndefined();
    expect(component(0.5)).toBeUndefined();
  });

  it("rejects other strings and non-finite numbers", () => {
    expect(component("auto")?.code).toBe("not_number");
    expect(component(NaN)?.code).toBe("not_number");
    expect(component(null)?.code).toBe("not_number");
  });
});

describe("literalColor", () => {
  it("accepts a minimal color", () => {
    expect(
      literalColor({ colorSpace: "srgb", components: [0, 0, 0] }),
    ).toBeUndefined();
  });

  it("accepts alpha, hex, and the 'none' component sentinel", () => {
    expect(
      literalColor({
        colorSpace: "oklch",
        components: [0.6, 0.1, "none"],
        alpha: 0.5,
        hex: "#abcdef",
      }),
    ).toBeUndefined();
  });

  it("rejects a non-color shape", () => {
    expect(literalColor("#fff")?.code).toBe("type_mismatch");
    expect(literalColor(5)?.code).toBe("type_mismatch");
    expect(literalColor({ value: 4, unit: "px" })?.code).toBe("type_mismatch");
  });

  it("rejects an unknown color space", () => {
    expect(
      literalColor({ colorSpace: "cmyk", components: [0, 0, 0, 0] })?.code,
    ).toBe("not_member");
  });

  it("rejects a non-numeric, non-'none' component", () => {
    expect(
      literalColor({ colorSpace: "srgb", components: [0, 0, "bad"] })?.code,
    ).toBe("not_number");
  });

  it("rejects a malformed hex fallback", () => {
    expect(
      literalColor({ colorSpace: "srgb", components: [0], hex: "abcdef" })
        ?.code,
    ).toBe("not_hex");
    expect(
      literalColor({
        colorSpace: "srgb",
        components: [0],
        hex: ";} body { background: url(evil) }",
      })?.code,
    ).toBe("not_hex");
  });

  it("rejects alpha outside the unit interval", () => {
    expect(
      literalColor({ colorSpace: "srgb", components: [0], alpha: 5 })?.code,
    ).toBe("out_of_range");
    expect(
      literalColor({ colorSpace: "srgb", components: [0], alpha: -0.1 })?.code,
    ).toBe("out_of_range");
  });

  it("rejects a missing required member", () => {
    expect(literalColor({ colorSpace: "srgb" })?.code).toBe("missing_key");
  });

  it("rejects an unknown member", () => {
    expect(
      literalColor({ colorSpace: "srgb", components: [0], ghost: 1 })?.code,
    ).toBe("unknown_key");
  });
});

describe("literalDimension", () => {
  it("accepts a value with a known unit", () => {
    expect(literalDimension({ value: 4, unit: "px" })).toBeUndefined();
    expect(literalDimension({ value: 1, unit: "rem" })).toBeUndefined();
  });

  it("rejects a bare number", () => {
    expect(literalDimension(4)?.code).toBe("type_mismatch");
  });

  it("rejects an unknown unit", () => {
    expect(literalDimension({ value: 4, unit: "pt" })?.code).toBe("not_member");
  });

  it("rejects a non-numeric value", () => {
    expect(literalDimension({ value: "4", unit: "px" })?.code).toBe(
      "not_number",
    );
  });

  it("rejects a missing member", () => {
    expect(literalDimension({ unit: "px" })?.code).toBe("missing_key");
  });
});

describe("literalDuration", () => {
  it("accepts a value with a known unit", () => {
    expect(literalDuration({ value: 150, unit: "ms" })).toBeUndefined();
    expect(literalDuration({ value: 1, unit: "s" })).toBeUndefined();
  });

  it("rejects an unknown unit and a non-object", () => {
    expect(literalDuration({ value: 1, unit: "px" })?.code).toBe("not_member");
    expect(literalDuration(150)?.code).toBe("type_mismatch");
  });
});

describe("literalFontFamily", () => {
  it("accepts a single name and a fallback stack", () => {
    expect(literalFontFamily("Inter")).toBeUndefined();
    expect(literalFontFamily(["Inter", "sans-serif"])).toBeUndefined();
  });

  it("rejects an empty string and an empty stack entry", () => {
    expect(literalFontFamily("")?.code).toBe("empty");
    expect(literalFontFamily(["Inter", ""])?.code).toBe("empty");
  });

  it("rejects a CSS breakout string in either form", () => {
    expect(literalFontFamily("url(x)")?.code).toBe("css_breakout");
    expect(literalFontFamily(["Inter", "a;b"])?.code).toBe("css_breakout");
  });

  it("rejects a non-string stack entry", () => {
    expect(literalFontFamily(["Inter", 3])?.code).toBe("not_string");
  });

  it("rejects a number or object", () => {
    expect(literalFontFamily(12)?.code).toBe("type_mismatch");
    expect(literalFontFamily({})?.code).toBe("type_mismatch");
  });
});

describe("literalFontWeight", () => {
  it("accepts a numeric weight in range and a keyword", () => {
    expect(literalFontWeight(400)).toBeUndefined();
    expect(literalFontWeight(1)).toBeUndefined();
    expect(literalFontWeight(1000)).toBeUndefined();
    expect(literalFontWeight("semi-bold")).toBeUndefined();
  });

  it("rejects a weight outside the range", () => {
    expect(literalFontWeight(0)?.code).toBe("out_of_range");
    expect(literalFontWeight(2000)?.code).toBe("out_of_range");
  });

  it("rejects an unknown keyword", () => {
    expect(literalFontWeight("heavy")?.code).toBe("not_member");
  });

  it("rejects a non-number, non-string", () => {
    expect(literalFontWeight({})?.code).toBe("type_mismatch");
  });
});

describe("literalNumber", () => {
  it("accepts a finite number", () => {
    expect(literalNumber(1.5)).toBeUndefined();
    expect(literalNumber(0)).toBeUndefined();
  });

  it("rejects a non-number", () => {
    expect(literalNumber("1.5")?.code).toBe("not_number");
    expect(literalNumber(NaN)?.code).toBe("not_number");
  });
});

describe("literalCubicBezier", () => {
  it("accepts four numbers with abscissae in the unit interval", () => {
    expect(literalCubicBezier([0.4, 0, 0.2, 1])).toBeUndefined();
    expect(literalCubicBezier([0, -5, 1, 5])).toBeUndefined();
  });

  it("rejects a non-array", () => {
    expect(literalCubicBezier({})?.code).toBe("type_mismatch");
  });

  it("rejects the wrong tuple length", () => {
    const issue = literalCubicBezier([0, 0, 1]);
    expect(issue?.code).toBe("bad_length");
    expect(issue?.expected).toBe(4);
    expect(issue?.received).toBe(3);
  });

  it("rejects a non-numeric entry with its index in the path", () => {
    const issue = literalCubicBezier([0, 0, "x", 1]);
    expect(issue?.code).toBe("not_number");
    expect(issue?.path).toEqual(["2"]);
  });

  it("rejects an abscissa outside the unit interval", () => {
    const issue = literalCubicBezier([2, 0, 0.5, 1]);
    expect(issue?.code).toBe("out_of_range");
    expect(issue?.path).toEqual(["0"]);
    expect(literalCubicBezier([0, 0, 2, 1])?.path).toEqual(["2"]);
  });

  it("does not constrain the ordinate entries", () => {
    expect(literalCubicBezier([0, 99, 1, -99])).toBeUndefined();
  });
});
