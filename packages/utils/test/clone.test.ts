import { describe, it, expect } from "vitest";

import { clone } from "../src/clone";
import { theme } from "./fixture";

describe("clone", () => {
  it("equals the source", () => {
    expect(clone(theme)).toEqual(theme);
  });

  it("detaches every facet, down to nested definitions and values", () => {
    const result = clone(theme);

    expect(result).not.toBe(theme);
    expect(result.tokens).not.toBe(theme.tokens);
    expect(result.modifiers).not.toBe(theme.modifiers);
    expect(result.order).not.toBe(theme.order);
    expect(result.tokens["color.bg"]).not.toBe(theme.tokens["color.bg"]);
    expect(result.tokens["color.bg"].$value).not.toBe(
      theme.tokens["color.bg"].$value,
    );
    expect(result.modifiers.mode.dark).not.toBe(theme.modifiers.mode.dark);
  });

  it("does not leak a color's components-array mutation to the source", () => {
    const result = clone(theme);
    const value = result.tokens["color.bg"].$value;

    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "components" in value
    ) {
      value.components[0] = 0.5;
    }

    expect(theme.tokens["color.bg"].$value).toEqual({
      colorSpace: "srgb",
      components: [1, 1, 1],
    });
  });

  it("does not leak a shadow-list mutation to the source", () => {
    const result = clone(theme);
    const value = result.tokens["shadow.sm"].$value;

    if (Array.isArray(value)) {
      value.pop();
    }

    const original = theme.tokens["shadow.sm"].$value;
    expect(Array.isArray(original) ? original.length : 0).toBe(2);
  });

  it("yields a plain object from a proxy-wrapped theme", () => {
    const proxy = new Proxy(theme, {});
    const result = clone(proxy);

    expect(result).not.toBe(proxy);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(result).toEqual(theme);
  });
});
