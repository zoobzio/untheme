import { describe, it, expect } from "vitest";

import { isTemplate } from "../src/guard";
import { theme } from "./fixture";

/* A minimal record that satisfies every branch of the template shape. */
const base = {
  id: "demo",
  name: "Demo",
  tokens: {},
  modifiers: {},
  order: [],
};

describe("isTemplate", () => {
  it("accepts a complete theme", () => {
    expect(isTemplate(theme)).toBe(true);
  });

  it("accepts a minimal template with empty tokens, modifiers, and order", () => {
    expect(isTemplate(base)).toBe(true);
  });

  it("narrows the value to a template", () => {
    const value: unknown = theme;

    if (isTemplate(value)) {
      expect(value.order).toEqual(["mode", "contrast"]);
    } else {
      throw new Error("expected the fixture theme to pass the template guard");
    }
  });

  it("rejects a non-object", () => {
    expect(isTemplate("theme")).toBe(false);
    expect(isTemplate(42)).toBe(false);
  });

  it("rejects null", () => {
    expect(isTemplate(null)).toBe(false);
  });

  it("rejects an array", () => {
    expect(isTemplate([])).toBe(false);
  });

  it("rejects a missing or non-string id", () => {
    expect(
      isTemplate({ name: "Demo", tokens: {}, modifiers: {}, order: [] }),
    ).toBe(false);
    expect(isTemplate({ ...base, id: 1 })).toBe(false);
  });

  it("rejects a missing or non-string name", () => {
    expect(
      isTemplate({ id: "demo", tokens: {}, modifiers: {}, order: [] }),
    ).toBe(false);
    expect(isTemplate({ ...base, name: 1 })).toBe(false);
  });

  it("rejects missing tokens or tokens that are not an object", () => {
    expect(
      isTemplate({ id: "demo", name: "Demo", modifiers: {}, order: [] }),
    ).toBe(false);
    expect(isTemplate({ ...base, tokens: [] })).toBe(false);
  });

  it("rejects missing modifiers or modifiers that are not a plain record", () => {
    expect(
      isTemplate({ id: "demo", name: "Demo", tokens: {}, order: [] }),
    ).toBe(false);
    expect(isTemplate({ ...base, modifiers: [] })).toBe(false);
    expect(isTemplate({ ...base, modifiers: new Date() })).toBe(false);
  });

  it("rejects missing order or an order that is not an array", () => {
    expect(
      isTemplate({ id: "demo", name: "Demo", tokens: {}, modifiers: {} }),
    ).toBe(false);
    expect(isTemplate({ ...base, order: {} })).toBe(false);
  });
});
