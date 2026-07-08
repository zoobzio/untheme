import { describe, expect, it } from "vitest";

import { defineAssert } from "../src/assert";
import { defineInspect } from "../src/inspect";
import { defineParse } from "../src/parse";
import type { Parse } from "../src/types";
import { meta, template } from "./fixture";

const inspect = defineInspect(defineParse(defineAssert(meta)));

const color = { colorSpace: "srgb", components: [0, 0, 0] } as const;

describe("defineInspect", () => {
  it("returns success with the narrowed data for a valid value", () => {
    expect(inspect.theme(template)).toEqual({ success: true, data: template });
    expect(inspect.modifier("mode")).toEqual({ success: true, data: "mode" });
    const value = { $type: "color", $value: color };
    expect(inspect.definition(value)).toEqual({ success: true, data: value });
  });

  it("returns success for every kind on valid input", () => {
    expect(inspect.modifier("mode").success).toBe(true);
    expect(inspect.value(42).success).toBe(true);
    expect(inspect.token("color.bg").success).toBe(true);
    expect(inspect.reference("{color.bg}").success).toBe(true);
    expect(inspect.binding("{color.bg}").success).toBe(true);
    expect(inspect.definition({ $type: "color", $value: color }).success).toBe(
      true,
    );
    expect(inspect.overrides({}).success).toBe(true);
    expect(inspect.tokens(template.tokens).success).toBe(true);
    expect(inspect.modifiers(template.modifiers).success).toBe(true);
    expect(inspect.order(["mode", "contrast"]).success).toBe(true);
    expect(inspect.input({ mode: "dark", contrast: "high" }).success).toBe(
      true,
    );
    expect(inspect.theme(template).success).toBe(true);
    expect(inspect.layer({ id: "l", name: "L" }).success).toBe(true);
    expect(inspect.patch({}).success).toBe(true);
  });

  it("returns failure with the issues for an invalid value", () => {
    const result = inspect.input({ mode: "dark" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it("lets a non-SchemaError from parse propagate", () => {
    const boom = (): never => {
      throw new RangeError("boom");
    };
    /* Every method throws a plain error; `() => never` satisfies each slot. */
    const parse = {
      modifier: boom,
      value: boom,
      token: boom,
      reference: boom,
      binding: boom,
      definition: boom,
      overrides: boom,
      tokens: boom,
      modifiers: boom,
      order: boom,
      input: boom,
      theme: boom,
      layer: boom,
      patch: boom,
    } satisfies Parse<typeof template>;
    const badInspect = defineInspect(parse);
    expect(() => badInspect.modifier(1)).toThrow(RangeError);
  });

  it("captures failures across kind families without throwing", () => {
    expect(inspect.modifier("light").success).toBe(false);
    expect(inspect.reference("{ghost}").success).toBe(false);
    expect(inspect.value(true).success).toBe(false);
    expect(inspect.overrides({ ghost: color }).success).toBe(false);
    expect(inspect.order(["ghost"]).success).toBe(false);
    expect(inspect.layer({ tokens: {} }).success).toBe(false);
    expect(inspect.patch({ id: "p" }).success).toBe(false);
  });
});
