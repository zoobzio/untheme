import { describe, expect, it } from "vitest";

import { defineAssert } from "../src/assert";
import { SchemaError } from "../src/error";
import type { Assert, Code } from "../src/types";
import { meta, template } from "./fixture";

const assert: Assert<typeof template> = defineAssert(meta);

const color = { colorSpace: "srgb", components: [0, 0, 0] } as const;

/** The issue codes a throwing assertion carries, or `[]` when it passes. */
const thrownCodes = (run: () => void): Code[] => {
  try {
    run();
    return [];
  } catch (error) {
    if (error instanceof SchemaError) {
      return error.issues.map((issue) => issue.code);
    }
    throw error;
  }
};

describe("defineAssert", () => {
  it("returns without throwing for a valid value of every kind", () => {
    expect(() => assert.modifier("mode")).not.toThrow();
    expect(() => assert.value(42)).not.toThrow();
    expect(() => assert.token("color.bg")).not.toThrow();
    expect(() => assert.reference("{color.bg}")).not.toThrow();
    expect(() => assert.binding("{color.bg}")).not.toThrow();
    expect(() =>
      assert.definition({ $type: "color", $value: color }),
    ).not.toThrow();
    expect(() => assert.overrides({})).not.toThrow();
    expect(() => assert.tokens(template.tokens)).not.toThrow();
    expect(() => assert.modifiers(template.modifiers)).not.toThrow();
    expect(() => assert.order(["mode", "contrast"])).not.toThrow();
    expect(() =>
      assert.input({ mode: "dark", contrast: "high" }),
    ).not.toThrow();
    expect(() => assert.theme(template)).not.toThrow();
    expect(() => assert.layer({ id: "l", name: "L" })).not.toThrow();
    expect(() => assert.patch({})).not.toThrow();
  });

  it("throws a SchemaError carrying issues for an invalid value", () => {
    let error: unknown;
    try {
      assert.modifier("light");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.issues.length).toBeGreaterThan(0);
      expect(error.issues[0]?.code).toBe("not_member");
    }
  });

  it("collects every failing rule in one pass", () => {
    /* An extra token fails both the subset check and completeness. */
    const codes = thrownCodes(() =>
      assert.tokens({
        ...template.tokens,
        "bg-extra": { $type: "number", $value: 1 },
      }),
    );
    expect(codes).toContain("unknown_key");
  });

  it("carries the nested path of a deep failure", () => {
    let error: unknown;
    try {
      assert.modifiers({
        ...template.modifiers,
        mode: {
          ...template.modifiers.mode,
          dark: { "color.fg": "{space.sm}" },
        },
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.issues[0]?.path).toEqual(["mode", "dark", "color.fg"]);
    }
  });

  it("throws for every failing kind family", () => {
    expect(() => assert.token("ghost")).toThrow(SchemaError);
    expect(() => assert.reference("{ghost}")).toThrow(SchemaError);
    expect(() => assert.value(true)).toThrow(SchemaError);
    expect(() => assert.overrides({ ghost: color })).toThrow(SchemaError);
    expect(() => assert.order(["ghost"])).toThrow(SchemaError);
    expect(() => assert.input({ mode: "dark" })).toThrow(SchemaError);
    expect(() => assert.layer({ tokens: {} })).toThrow(SchemaError);
    expect(() => assert.patch({ id: "p" })).toThrow(SchemaError);
  });
});
