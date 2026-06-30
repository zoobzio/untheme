import { describe, it, expect } from "vitest";

import { defineSchema } from "../src/schema";
import { SchemaError } from "../src/error";
import type { Template } from "../src/types";

const base = {
  id: "demo",
  name: "Demo",
  tokens: {
    "bg-base": "#ffffff",
    "accent-9": "#0090ff",
    "radius-1": "3px",
    surface: "{bg-base}",
    text: "{accent-9}",
    brand: "{accent-9}",
  },
  modifiers: {
    color: {
      light: { surface: "{bg-base}", text: "{accent-9}" },
      dark: { surface: "{accent-9}", text: "{bg-base}" },
    },
    contrast: {
      normal: {},
      high: { text: "{bg-base}" },
    },
  },
  order: ["color", "contrast"],
} satisfies Template;

const { rules, check, assert, parse, inspect } = defineSchema(base);

describe("defineSchema", () => {
  it("derives the token, modifier, and context sets", () => {
    expect([...rules.sets.tokens]).toContain("surface");
    expect([...rules.sets.modifiers]).toEqual(["color", "contrast"]);
    expect([...rules.sets.contexts.color]).toEqual(["light", "dark"]);
    expect([...rules.sets.contexts.contrast]).toEqual(["normal", "high"]);
  });

  it("rejects a malformed base at construction", () => {
    expect(() =>
      defineSchema({
        id: "bad",
        name: "Bad",
        tokens: { a: "red;}" },
        modifiers: {},
        order: [],
      }),
    ).toThrow(SchemaError);
  });
});

describe("check.modifier / check.token / check.reference", () => {
  it("modifier accepts axis names, not context names", () => {
    expect(check.modifier("color")).toBe(true);
    expect(check.modifier("contrast")).toBe(true);
    expect(check.modifier("light")).toBe(false);
    expect(check.modifier("ghost")).toBe(false);
  });

  it("token accepts bare names; reference accepts curly form", () => {
    expect(check.token("surface")).toBe(true);
    expect(check.token("{surface}")).toBe(false);
    expect(check.reference("{surface}")).toBe(true);
    expect(check.reference("surface")).toBe(false);
    expect(check.reference("{ghost}")).toBe(false);
  });
});

describe("check.value / check.binding", () => {
  it("value accepts CSS, rejects breakouts and braces", () => {
    expect(check.value("calc(100% - 2px)")).toBe(true);
    expect(check.value("red;}")).toBe(false);
    expect(check.value("{bg-base}")).toBe(false);
  });

  it("binding accepts a reference or a literal value", () => {
    expect(check.binding("{accent-9}")).toBe(true);
    expect(check.binding("#fff")).toBe(true);
    expect(check.binding("accent-9")).toBe(true);
    expect(check.binding("{ghost}")).toBe(false);
    expect(check.binding("red;}")).toBe(false);
  });
});

describe("check.overrides", () => {
  it("accepts a partial token map", () => {
    expect(check.overrides({})).toBe(true);
    expect(check.overrides({ surface: "{bg-base}", text: "#fff" })).toBe(true);
  });

  it("rejects unknown keys and bad bindings", () => {
    expect(check.overrides({ ghost: "{bg-base}" })).toBe(false);
    expect(check.overrides({ surface: "red;}" })).toBe(false);
  });
});

describe("check.tokens", () => {
  it("accepts the complete base map, rejects incomplete or bad", () => {
    expect(check.tokens(base.tokens)).toBe(true);
    expect(check.tokens({ "bg-base": "#fff" })).toBe(false);
    expect(check.tokens({ ...base.tokens, "bg-base": "red;}" })).toBe(false);
  });
});

describe("check.modifiers", () => {
  it("accepts the complete two-level map", () => {
    expect(check.modifiers(base.modifiers)).toBe(true);
  });

  it("rejects a missing modifier or missing context", () => {
    expect(check.modifiers({ color: base.modifiers.color })).toBe(false);
    expect(
      check.modifiers({
        ...base.modifiers,
        color: { light: base.modifiers.color.light },
      }),
    ).toBe(false);
  });

  it("rejects unknown modifiers, unknown contexts, and bad bindings", () => {
    expect(check.modifiers({ ...base.modifiers, ghost: {} })).toBe(false);
    expect(
      check.modifiers({
        ...base.modifiers,
        contrast: { ...base.modifiers.contrast, extra: {} },
      }),
    ).toBe(false);
    expect(
      check.modifiers({
        ...base.modifiers,
        contrast: { normal: { surface: "red;}" }, high: {} },
      }),
    ).toBe(false);
  });
});

describe("check.order", () => {
  it("accepts an array of modifier names", () => {
    expect(check.order(["color", "contrast"])).toBe(true);
    expect(check.order([])).toBe(true);
  });

  it("rejects unknown modifiers and non-arrays", () => {
    expect(check.order(["ghost"])).toBe(false);
    expect(check.order("color")).toBe(false);
  });
});

describe("check.input", () => {
  it("accepts one valid context per modifier", () => {
    expect(check.input({ color: "dark", contrast: "high" })).toBe(true);
    expect(check.input({ color: "light", contrast: "normal" })).toBe(true);
  });

  it("rejects a missing modifier, a cross-modifier context, or an unknown context", () => {
    expect(check.input({ color: "dark" })).toBe(false);
    expect(check.input({ color: "high", contrast: "normal" })).toBe(false);
    expect(check.input({ color: "dark", contrast: "purple" })).toBe(false);
  });
});

describe("check.theme / check.layer / check.patch", () => {
  it("accepts the complete base theme", () => {
    expect(check.theme(base)).toBe(true);
  });

  it("requires tokens, modifiers, and order", () => {
    const candidate = { ...base };
    Reflect.deleteProperty(candidate, "order");
    expect(check.theme(candidate)).toBe(false);
  });

  it("a layer is a partial overlay carrying identity", () => {
    expect(
      check.layer({
        id: "demo-layer",
        name: "Demo Layer",
        tokens: { surface: "{bg-base}" },
        modifiers: { color: { dark: { surface: "{accent-9}" } } },
      }),
    ).toBe(true);
    expect(check.layer({ tokens: { surface: "{bg-base}" } })).toBe(false);
  });

  it("a patch is anonymous; rejects unknown keys and bad bindings", () => {
    expect(check.patch({})).toBe(true);
    expect(
      check.patch({ modifiers: { color: { dark: { surface: "#fff" } } } }),
    ).toBe(true);
    expect(check.patch({ ghost: {} })).toBe(false);
    expect(check.patch({ tokens: { surface: "red;}" } })).toBe(false);
  });
});

describe("cycle detection", () => {
  const ring = defineSchema({
    id: "ring",
    name: "Ring",
    tokens: { a: "#fff", b: "{a}" },
    modifiers: {},
    order: [],
  });

  it("accepts an acyclic chain, rejects a cycle", () => {
    expect(ring.check.tokens({ a: "#fff", b: "{a}" })).toBe(true);
    expect(ring.check.tokens({ a: "{b}", b: "{a}" })).toBe(false);
  });

  it("reports the cycle as a structured issue", () => {
    let error: unknown;
    try {
      ring.assert.tokens({ a: "{b}", b: "{a}" });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.issues.map((i) => i.code)).toContain("cycle");
    }
  });
});

describe("assert", () => {
  it("returns silently for a valid theme", () => {
    expect(() => assert.theme(base)).not.toThrow();
  });

  it("collects every failing rule in one pass", () => {
    let error: unknown;
    try {
      assert.value("a;(");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.issues.map((i) => i.code).sort()).toEqual([
        "css_breakout",
        "unbalanced",
      ]);
    }
  });

  it("reports the path into nested structure", () => {
    const tokens = { ...base.tokens };
    Reflect.deleteProperty(tokens, "bg-base");
    let error: unknown;
    try {
      assert.theme({ ...base, tokens });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      const issue = error.issues.find((i) => i.code === "missing_key");
      expect(issue?.path).toEqual(["tokens", "bg-base"]);
    }
  });

  it("reports a bad binding deep inside modifiers", () => {
    let error: unknown;
    try {
      assert.modifiers({
        ...base.modifiers,
        color: { ...base.modifiers.color, dark: { surface: "red;}" } },
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.issues[0]?.path).toEqual(["color", "dark", "surface"]);
    }
  });
});

describe("parse / inspect", () => {
  it("parse returns narrowed values and throws on invalid", () => {
    expect(parse.modifier("color")).toBe("color");
    expect(parse.reference("{bg-base}")).toBe("{bg-base}");
    expect(parse.input({ color: "dark", contrast: "high" })).toEqual({
      color: "dark",
      contrast: "high",
    });
    expect(parse.theme(base)).toBe(base);
    expect(() => parse.modifier("light")).toThrow(SchemaError);
  });

  it("inspect captures the outcome without throwing", () => {
    expect(inspect.theme(base)).toEqual({ success: true, data: base });
    const result = inspect.input({ color: "dark" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});
