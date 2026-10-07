import { describe, expect, it } from "vitest";

import { SchemaError } from "untheme";

import { InvalidSpecError } from "../src/error";
import { mockInput } from "../src/input";
import { mockTheme } from "../src/theme";

const theme = mockTheme({
  tokens: { a: 1 },
  modifiers: {
    color: { light: {}, dark: {} },
    density: { default: {}, compact: { a: 2 } },
  },
});

describe("mockInput", () => {
  it("boots each modifier at its first context, in order", () => {
    expect(mockInput(theme)).toEqual({ color: "light", density: "default" });
    expect(Object.keys(mockInput(theme))).toEqual(["color", "density"]);
  });

  it("takes the pinned contexts over the first", () => {
    expect(mockInput(theme, { density: "compact" })).toEqual({
      color: "light",
      density: "compact",
    });
  });

  it("is empty for a theme without modifiers", () => {
    expect(mockInput(mockTheme({ tokens: { a: 1 } }))).toEqual({});
  });

  it("rejects a pinned context the modifier lacks", () => {
    expect(() => mockInput(theme, { color: "sepia" as never })).toThrow(
      SchemaError,
    );
  });

  it("rejects a modifier with no context to boot at", () => {
    const empty = mockTheme({
      tokens: { a: 1 },
      modifiers: { color: {} },
    });
    expect(() => mockInput(empty)).toThrow(InvalidSpecError);
    expect(() => mockInput(empty)).toThrow(/"color" of "mock" has no context/);
  });
});
