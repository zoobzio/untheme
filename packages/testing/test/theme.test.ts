import { describe, expect, it } from "vitest";

import { SchemaError } from "untheme";

import { InvalidSpecError } from "../src/error";
import { mockTheme } from "../src/theme";

describe("mockTheme", () => {
  it("types each terse form and passes a full definition through", () => {
    const theme = mockTheme({
      tokens: {
        white: "#fff",
        space: "8px",
        gutter: "1.5rem",
        quick: "200ms",
        slow: "1s",
        ratio: 1.5,
        family: { $type: "fontFamily", $value: ["Inter", "sans-serif"] },
      },
    });
    expect(theme.tokens.white).toEqual({
      $type: "color",
      $value: {
        colorSpace: "srgb",
        components: [1, 1, 1],
        hex: "#ffffff",
      },
    });
    expect(theme.tokens.space).toEqual({
      $type: "dimension",
      $value: { value: 8, unit: "px" },
    });
    expect(theme.tokens.gutter).toEqual({
      $type: "dimension",
      $value: { value: 1.5, unit: "rem" },
    });
    expect(theme.tokens.quick).toEqual({
      $type: "duration",
      $value: { value: 200, unit: "ms" },
    });
    expect(theme.tokens.slow).toEqual({
      $type: "duration",
      $value: { value: 1, unit: "s" },
    });
    expect(theme.tokens.ratio).toEqual({ $type: "number", $value: 1.5 });
    expect(theme.tokens.family).toEqual({
      $type: "fontFamily",
      $value: ["Inter", "sans-serif"],
    });
  });

  it("types a reference as its target, through a chain of references", () => {
    const theme = mockTheme({
      tokens: {
        blue: "#3b82f6",
        primary: "{blue}",
        accent: "{primary}",
        size: "16px",
        text: "{size}",
      },
    });
    expect(theme.tokens.primary).toEqual({ $type: "color", $value: "{blue}" });
    expect(theme.tokens.accent).toEqual({
      $type: "color",
      $value: "{primary}",
    });
    expect(theme.tokens.text).toEqual({
      $type: "dimension",
      $value: "{size}",
    });
  });

  it("defaults the identity and the order, and takes both when given", () => {
    const plain = mockTheme({ tokens: { a: 1 } });
    expect(plain.id).toBe("mock");
    expect(plain.name).toBe("Mock");
    expect(plain.order).toEqual([]);
    expect(plain.modifiers).toEqual({});

    const named = mockTheme({
      id: "app",
      name: "App",
      tokens: { a: 1 },
      modifiers: {
        density: { default: {}, compact: { a: 2 } },
        color: { light: {}, dark: {} },
      },
      order: ["color", "density"],
    });
    expect(named.id).toBe("app");
    expect(named.name).toBe("App");
    expect(named.order).toEqual(["color", "density"]);

    const ordered = mockTheme({
      tokens: { a: 1 },
      modifiers: { color: { light: {} }, density: { default: {} } },
    });
    expect(ordered.order).toEqual(["color", "density"]);
  });

  it("converts terse overrides in a context to bindings", () => {
    const theme = mockTheme({
      tokens: { white: "#fff", black: "#000", surface: "{white}", gap: "8px" },
      modifiers: {
        color: {
          light: {},
          dark: { surface: "{black}", white: "#eee" },
        },
        density: { default: {}, compact: { gap: "4px" } },
      },
    });
    expect(theme.modifiers.color.dark).toEqual({
      surface: "{black}",
      white: {
        colorSpace: "srgb",
        components: [0.9333, 0.9333, 0.9333],
        hex: "#eeeeee",
      },
    });
    expect(theme.modifiers.density.compact).toEqual({
      gap: { value: 4, unit: "px" },
    });
  });

  it("rejects a terse string in no recognized form", () => {
    expect(() => mockTheme({ tokens: { family: "Inter" } })).toThrow(
      InvalidSpecError,
    );
    expect(() => mockTheme({ tokens: { family: "Inter" } })).toThrow(
      /"family" is "Inter"/,
    );
  });

  it("rejects a reference to a token the spec does not define", () => {
    expect(() => mockTheme({ tokens: { primary: "{blue}" } })).toThrow(
      /"primary" references "blue", which the spec does not define/,
    );
  });

  it("rejects a reference cycle no typed token anchors", () => {
    expect(() =>
      mockTheme({ tokens: { a: "{b}", b: "{c}", c: "{a}" } }),
    ).toThrow(/"a" references itself through a → b → c → a/);
  });

  it("proves the result against the schema", () => {
    expect(() =>
      mockTheme({
        tokens: { gap: "8px" },
        modifiers: { color: { dark: { gap: "#000" } } },
      }),
    ).toThrow(SchemaError);
    expect(() =>
      mockTheme({
        tokens: { gap: "8px" },
        modifiers: { color: { dark: { missing: "4px" } as never } },
      }),
    ).toThrow(SchemaError);
  });
});
