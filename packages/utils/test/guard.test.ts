import { describe, it, expect } from "vitest";

import { guard } from "../src/guard";
import { theme } from "./fixture";

/* A minimal record that satisfies every branch of the template shape. */
const base = {
  id: "demo",
  name: "Demo",
  tokens: {},
  modifiers: {},
  order: [],
};

describe("guard", () => {
  it("accepts a complete theme", () => {
    expect(guard(theme)).toBe(true);
  });

  it("accepts a minimal template with empty tokens, modifiers, and order", () => {
    expect(guard(base)).toBe(true);
  });

  it("narrows the value to a template", () => {
    const value: unknown = theme;

    if (guard(value)) {
      expect(value.order).toEqual(["mode", "contrast"]);
    } else {
      throw new Error("expected the fixture theme to pass the guard");
    }
  });

  it("rejects a non-object", () => {
    expect(guard("theme")).toBe(false);
    expect(guard(42)).toBe(false);
  });

  it("rejects null", () => {
    expect(guard(null)).toBe(false);
  });

  it("rejects an array", () => {
    expect(guard([])).toBe(false);
  });

  it("rejects a missing or non-string id", () => {
    expect(guard({ name: "Demo", tokens: {}, modifiers: {}, order: [] })).toBe(
      false,
    );
    expect(guard({ ...base, id: 1 })).toBe(false);
  });

  it("rejects a missing or non-string name", () => {
    expect(guard({ id: "demo", tokens: {}, modifiers: {}, order: [] })).toBe(
      false,
    );
    expect(guard({ ...base, name: 1 })).toBe(false);
  });

  it("rejects missing tokens or tokens that are not an object", () => {
    expect(guard({ id: "demo", name: "Demo", modifiers: {}, order: [] })).toBe(
      false,
    );
    expect(guard({ ...base, tokens: [] })).toBe(false);
  });

  it("rejects missing modifiers or modifiers that are not a plain record", () => {
    expect(guard({ id: "demo", name: "Demo", tokens: {}, order: [] })).toBe(
      false,
    );
    expect(guard({ ...base, modifiers: [] })).toBe(false);
    expect(guard({ ...base, modifiers: new Date() })).toBe(false);
  });

  it("rejects missing order or an order that is not an array", () => {
    expect(guard({ id: "demo", name: "Demo", tokens: {}, modifiers: {} })).toBe(
      false,
    );
    expect(guard({ ...base, order: {} })).toBe(false);
  });
});
