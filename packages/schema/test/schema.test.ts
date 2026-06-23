import { describe, it, expect } from "vitest";
import { defineSchema } from "../src/schema";
import { SchemaError } from "../src/error";
import type { Template } from "../src/types";

const base = {
  id: "demo",
  name: "Demo",
  reference: {
    bg: "#ffffff",
    "accent-9": "#0090ff",
    "radius-1": "3px",
    font: "Roboto, sans-serif",
    shadow: "0 1px 2px rgb(0 0 0 / 8%)",
  },
  system: {
    light: { surface: "bg", solid: "accent-9", text: "accent-9" },
    dark: { surface: "accent-9", solid: "accent-9", text: "bg" },
  },
  roles: { brand: "accent-9", danger: "text" },
} satisfies Template;

const { guard, assert, parse, lexicon } = defineSchema(base);

describe("config", () => {
  it("derives the token-name sets from the template", () => {
    expect([...lexicon.tokens.reference]).toEqual([
      "bg",
      "accent-9",
      "radius-1",
      "font",
      "shadow",
    ]);
    expect([...lexicon.tokens.system]).toEqual(["surface", "solid", "text"]);
    expect([...lexicon.tokens.role]).toEqual(["brand", "danger"]);
  });

  it("composes alias from reference+system and all from every tier", () => {
    expect(lexicon.tokens.alias.has("accent-9")).toBe(true);
    expect(lexicon.tokens.alias.has("surface")).toBe(true);
    expect(lexicon.tokens.alias.has("brand")).toBe(false);
    expect(lexicon.tokens.all.has("brand")).toBe(true);
  });

  it("holds a list of rules per tier", () => {
    expect(lexicon.rules.value.length).toBeGreaterThan(0);
    expect(lexicon.rules.theme.length).toBeGreaterThan(0);
  });
});

describe("guard.mode", () => {
  it("accepts the supported color modes", () => {
    expect(guard.mode("light")).toBe(true);
    expect(guard.mode("dark")).toBe(true);
  });

  it("rejects other values", () => {
    expect(guard.mode("Light")).toBe(false);
    expect(guard.mode("")).toBe(false);
    expect(guard.mode(0)).toBe(false);
  });
});

describe("guard.value", () => {
  it("accepts common CSS values", () => {
    expect(guard.value("#0090ff")).toBe(true);
    expect(guard.value("rgb(0 144 255)")).toBe(true);
    expect(guard.value("calc(100% - 2px)")).toBe(true);
    expect(guard.value("Roboto, sans-serif")).toBe(true);
    expect(guard.value("'Helvetica Neue', sans-serif")).toBe(true);
    expect(guard.value("0 1px 2px rgb(0 0 0 / 8%)")).toBe(true);
  });

  it("rejects non-strings and blank strings", () => {
    expect(guard.value(16)).toBe(false);
    expect(guard.value("")).toBe(false);
    expect(guard.value("   ")).toBe(false);
  });

  it("rejects declaration breakouts", () => {
    expect(guard.value("red;} body{background:red}")).toBe(false);
    expect(guard.value("</style><script>")).toBe(false);
    expect(guard.value("/* comment */ red")).toBe(false);
    expect(guard.value("\\27 red")).toBe(false);
  });

  it("rejects unbalanced parens and unclosed quotes", () => {
    expect(guard.value("rgb(0")).toBe(false);
    expect(guard.value("red)")).toBe(false);
    expect(guard.value("'unclosed")).toBe(false);
  });

  it("rejects url() in any casing without flagging mere substrings", () => {
    expect(guard.value("url(/img.png)")).toBe(false);
    expect(guard.value("URL(x)")).toBe(false);
    expect(guard.value("Url(x)")).toBe(false);
    expect(guard.value("curl(x)")).toBe(true);
  });
});

describe("guard token names", () => {
  it("reference accepts reference names, rejects other tiers", () => {
    expect(guard.reference("accent-9")).toBe(true);
    expect(guard.reference("surface")).toBe(false);
    expect(guard.reference("brand")).toBe(false);
    expect(guard.reference(9)).toBe(false);
  });

  it("system accepts system names, rejects other tiers", () => {
    expect(guard.system("surface")).toBe(true);
    expect(guard.system("accent-9")).toBe(false);
    expect(guard.system("brand")).toBe(false);
  });

  it("role accepts role names, rejects other tiers", () => {
    expect(guard.role("brand")).toBe(true);
    expect(guard.role("accent-9")).toBe(false);
    expect(guard.role("surface")).toBe(false);
  });

  it("alias accepts reference and system names, rejects roles", () => {
    expect(guard.alias("accent-9")).toBe(true);
    expect(guard.alias("surface")).toBe(true);
    expect(guard.alias("brand")).toBe(false);
    expect(guard.alias("ghost")).toBe(false);
  });

  it("token accepts any tier, rejects unknown names", () => {
    expect(guard.token("accent-9")).toBe(true);
    expect(guard.token("surface")).toBe(true);
    expect(guard.token("brand")).toBe(true);
    expect(guard.token("ghost")).toBe(false);
  });
});

describe("guard.tokens", () => {
  it("validates each value by the tier its key belongs to", () => {
    // reference key holds a value, system key holds a reference, role key an alias
    expect(
      guard.tokens({ bg: "#101010", surface: "bg", brand: "surface" }),
    ).toBe(true);
    expect(guard.tokens({})).toBe(true);
  });

  it("rejects a value that does not match its key's tier", () => {
    expect(guard.tokens({ surface: "red;}" })).toBe(false); // not a reference name
    expect(guard.tokens({ brand: "#0090ff" })).toBe(false); // not an alias name
    expect(guard.tokens({ bg: 9 })).toBe(false); // not a string value
  });

  it("rejects unknown keys and non-objects", () => {
    expect(guard.tokens({ ghost: "bg" })).toBe(false);
    expect(guard.tokens("surface")).toBe(false);
    expect(guard.tokens(null)).toBe(false);
  });
});

describe("guard.patch", () => {
  it("accepts an empty patch", () => {
    expect(guard.patch({})).toBe(true);
  });

  it("accepts any subset of facets, including a single mode", () => {
    expect(guard.patch({ reference: { bg: "#f7f7f7" } })).toBe(true);
    expect(guard.patch({ system: { light: { surface: "bg" } } })).toBe(true);
    expect(guard.patch({ roles: { brand: "surface" } })).toBe(true);
  });

  it("rejects unknown facet keys", () => {
    expect(guard.patch({ ghost: {} })).toBe(false);
  });

  it("rejects unknown token keys", () => {
    expect(guard.patch({ reference: { ghost: "#000" } })).toBe(false);
    expect(guard.patch({ system: { light: { ghost: "bg" } } })).toBe(false);
    expect(guard.patch({ roles: { ghost: "bg" } })).toBe(false);
  });

  it("rejects values that break tier rules", () => {
    expect(guard.patch({ reference: { bg: "red;}" } })).toBe(false);
    expect(guard.patch({ system: { light: { surface: "text" } } })).toBe(false);
    expect(guard.patch({ roles: { brand: "danger" } })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(guard.patch("bg")).toBe(false);
    expect(guard.patch(null)).toBe(false);
  });

  it("rejects a non-object facet or mode", () => {
    expect(guard.patch({ reference: "x" })).toBe(false);
    expect(guard.patch({ system: "x" })).toBe(false);
    expect(guard.patch({ system: { light: "x" } })).toBe(false);
    expect(guard.patch({ roles: 9 })).toBe(false);
  });
});

describe("guard.layer", () => {
  it("accepts a token subset with both modes present", () => {
    expect(
      guard.layer({
        id: "demo-layer",
        name: "Demo Layer",
        reference: { bg: "#f7f7f7" },
        system: { light: { surface: "bg" }, dark: {} },
        roles: {},
      }),
    ).toBe(true);
  });

  it("accepts a complete theme", () => {
    expect(guard.layer(base)).toBe(true);
  });

  it("rejects a missing identity field", () => {
    const candidate = { ...base };
    Reflect.deleteProperty(candidate, "id");
    expect(guard.layer(candidate)).toBe(false);
  });

  it("rejects a missing mode", () => {
    expect(guard.layer({ ...base, system: { light: base.system.light } })).toBe(
      false,
    );
  });

  it("rejects unknown token keys", () => {
    expect(
      guard.layer({ ...base, reference: { ...base.reference, ghost: "#000" } }),
    ).toBe(false);
  });

  it("rejects a system token aliasing a non-reference", () => {
    expect(
      guard.layer({
        ...base,
        system: { ...base.system, light: { surface: "ghost" } },
      }),
    ).toBe(false);
    expect(
      guard.layer({
        ...base,
        system: { ...base.system, light: { surface: "text" } },
      }),
    ).toBe(false);
  });

  it("rejects a role token aliasing a non-alias", () => {
    expect(guard.layer({ ...base, roles: { brand: "ghost" } })).toBe(false);
    expect(guard.layer({ ...base, roles: { brand: "danger" } })).toBe(false);
  });

  it("rejects unsafe reference values", () => {
    expect(
      guard.layer({ ...base, reference: { bg: "url(https://evil.example)" } }),
    ).toBe(false);
  });

  it("rejects a non-object facet or mode", () => {
    expect(guard.layer({ ...base, reference: 5 })).toBe(false);
    expect(guard.layer({ ...base, system: "x" })).toBe(false);
    expect(guard.layer({ ...base, system: { light: "x", dark: {} } })).toBe(
      false,
    );
  });
});

describe("guard.theme", () => {
  it("accepts a complete theme", () => {
    expect(guard.theme(base)).toBe(true);
  });

  it("requires every reference token", () => {
    const reference = { ...base.reference };
    Reflect.deleteProperty(reference, "bg");
    expect(guard.theme({ ...base, reference })).toBe(false);
  });

  it("requires every system token in both modes", () => {
    expect(
      guard.theme({ ...base, system: { light: base.system.light, dark: {} } }),
    ).toBe(false);
    expect(
      guard.theme({
        ...base,
        system: {
          light: { surface: "bg" },
          dark: { surface: "accent-9" },
        },
      }),
    ).toBe(false);
  });

  it("requires light/dark parity", () => {
    const dark = { ...base.system.dark };
    Reflect.deleteProperty(dark, "text");
    expect(
      guard.theme({ ...base, system: { light: base.system.light, dark } }),
    ).toBe(false);
  });

  it("requires every role token", () => {
    expect(guard.theme({ ...base, roles: { brand: "accent-9" } })).toBe(false);
  });

  it("rejects candidates that are not valid layers at all", () => {
    expect(guard.theme(null)).toBe(false);
    expect(guard.theme({ ...base, roles: { brand: "ghost" } })).toBe(false);
  });

  it("rejects a valid layer that is not complete", () => {
    const layer = {
      id: "demo-layer",
      name: "Demo Layer",
      reference: { bg: "#f7f7f7" },
      system: { light: { surface: "bg" }, dark: { surface: "bg" } },
      roles: {},
    };
    expect(guard.layer(layer)).toBe(true);
    expect(guard.theme(layer)).toBe(false);
  });

  it("rejects a non-object facet", () => {
    expect(guard.theme({ ...base, reference: 5 })).toBe(false);
    expect(guard.theme({ ...base, system: "x" })).toBe(false);
  });
});

describe("assert", () => {
  it("returns silently for a valid value", () => {
    expect(() => assert.theme(base)).not.toThrow();
  });

  it("throws a SchemaError carrying structured issues", () => {
    let error: unknown;
    try {
      assert.value("red;}");
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.issues.map((i) => i.code)).toContain("css_breakout");
    }
  });

  it("collects every failing rule in one pass, not just the first", () => {
    let error: unknown;
    try {
      assert.value("a;("); // breakout (';') and unbalanced ('(')
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
    const dark = { ...base.system.dark };
    Reflect.deleteProperty(dark, "text");
    let error: unknown;
    try {
      assert.theme({ ...base, system: { light: base.system.light, dark } });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      const issue = error.issues.find((i) => i.code === "missing_key");
      expect(issue?.path).toEqual(["system", "dark", "text"]);
    }
  });

  it("renders the path into the error message", () => {
    let error: unknown;
    try {
      assert.patch({ reference: { bg: "red;}" } });
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(SchemaError);
    if (error instanceof SchemaError) {
      expect(error.message).toContain("reference.bg:");
    }
  });
});

describe("parse", () => {
  it("returns the value narrowed for every tier when valid", () => {
    expect(parse.mode("light")).toBe("light");
    expect(parse.value("#0090ff")).toBe("#0090ff");
    expect(parse.reference("accent-9")).toBe("accent-9");
    expect(parse.system("surface")).toBe("surface");
    expect(parse.role("brand")).toBe("brand");
    expect(parse.alias("surface")).toBe("surface");
    expect(parse.token("brand")).toBe("brand");
    expect(parse.tokens({ surface: "bg" })).toEqual({ surface: "bg" });
    expect(parse.patch({ reference: { bg: "#eee" } })).toEqual({
      reference: { bg: "#eee" },
    });
    expect(parse.layer(base)).toBe(base);
    expect(parse.theme(base)).toBe(base);
  });

  it("throws a SchemaError when invalid", () => {
    expect(() => parse.mode("Light")).toThrow(SchemaError);
    expect(() => parse.theme(null)).toThrow(SchemaError);
  });
});
