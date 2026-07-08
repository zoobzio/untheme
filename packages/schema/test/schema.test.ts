import { describe, expect, it } from "vitest";

import { SchemaError } from "../src/error";
import { defineSchema } from "../src/schema";
import { template } from "./fixture";

const schema = defineSchema(template);

describe("defineSchema", () => {
  it("returns the base, meta, and validator families", () => {
    expect(Object.keys(schema).sort()).toEqual([
      "assert",
      "base",
      "check",
      "inspect",
      "meta",
      "parse",
    ]);
  });

  it("keeps the source template as base", () => {
    expect(schema.base).toBe(template);
  });

  it("derives the token, modifier, context, and type lookups on meta", () => {
    expect(schema.meta.enums.tokens.has("color.bg")).toBe(true);
    expect([...schema.meta.enums.modifiers]).toEqual(["mode", "contrast"]);
    expect([...schema.meta.enums.contexts.mode]).toEqual(["light", "dark"]);
    expect(schema.meta.enums.types["color.bg"]).toBe("color");
    expect(schema.meta.enums.types["space.sm"]).toBe("dimension");
    expect(schema.meta.enums.types["shadow.sm"]).toBe("shadow");
  });

  it("wires check, assert, parse, and inspect off the same template", () => {
    expect(schema.check.theme(template)).toBe(true);
    expect(() => schema.assert.theme(template)).not.toThrow();
    expect(schema.parse.modifier("mode")).toBe("mode");
    expect(schema.inspect.input({ mode: "dark" }).success).toBe(false);
  });

  it("accepts the complete base as a theme", () => {
    expect(schema.check.theme(template)).toBe(true);
  });

  it("validates the base against the theme kind at construction", () => {
    expect(() =>
      defineSchema({
        id: "bad",
        name: "Bad",
        tokens: { a: { $type: "color", $value: "#fff" } },
        modifiers: {},
        order: [],
      }),
    ).toThrow(SchemaError);
  });

  it("constructs cleanly for a minimal valid template", () => {
    expect(() =>
      defineSchema({
        id: "min",
        name: "Min",
        tokens: {
          a: {
            $type: "color",
            $value: { colorSpace: "srgb", components: [0, 0, 0] },
          },
        },
        modifiers: {},
        order: [],
      }),
    ).not.toThrow();
  });
});
