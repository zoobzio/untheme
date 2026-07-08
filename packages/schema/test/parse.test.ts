import { describe, expect, it } from "vitest";

import { defineAssert } from "../src/assert";
import { SchemaError } from "../src/error";
import { defineParse } from "../src/parse";
import { meta, template } from "./fixture";

const parse = defineParse(defineAssert(meta));

const color = { colorSpace: "srgb", components: [0, 0, 0] } as const;

describe("defineParse", () => {
  it("returns the value unchanged when it is valid", () => {
    expect(parse.modifier("mode")).toBe("mode");
    expect(parse.token("color.bg")).toBe("color.bg");
    expect(parse.reference("{color.bg}")).toBe("{color.bg}");
    expect(parse.theme(template)).toBe(template);
    const value = { $type: "color", $value: color };
    expect(parse.definition(value)).toBe(value);
  });

  it("propagates the SchemaError on an invalid value", () => {
    expect(() => parse.modifier("light")).toThrow(SchemaError);
    expect(() => parse.reference("{ghost}")).toThrow(SchemaError);
    expect(() => parse.theme({})).toThrow(SchemaError);
  });

  it("returns the value for every kind on valid input", () => {
    expect(parse.modifier("mode")).toBe("mode");
    expect(parse.value(42)).toBe(42);
    expect(parse.token("color.bg")).toBe("color.bg");
    expect(parse.reference("{color.bg}")).toBe("{color.bg}");
    expect(parse.binding("{color.bg}")).toBe("{color.bg}");
    expect(parse.definition({ $type: "color", $value: color })).toEqual({
      $type: "color",
      $value: color,
    });
    expect(parse.overrides({})).toEqual({});
    expect(parse.tokens(template.tokens)).toBe(template.tokens);
    expect(parse.modifiers(template.modifiers)).toBe(template.modifiers);
    expect(parse.order(["mode", "contrast"])).toEqual(["mode", "contrast"]);
    expect(parse.input({ mode: "dark", contrast: "high" })).toEqual({
      mode: "dark",
      contrast: "high",
    });
    expect(parse.theme(template)).toBe(template);
    expect(parse.layer({ id: "l", name: "L" })).toEqual({ id: "l", name: "L" });
    expect(parse.patch({})).toEqual({});
  });

  it("carries the issues through the thrown error", () => {
    let error: unknown;
    try {
      parse.input({ mode: "dark" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.issues.length).toBeGreaterThan(0);
    }
  });
});
