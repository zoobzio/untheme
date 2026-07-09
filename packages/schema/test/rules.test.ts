import { describe, expect, it } from "vitest";

import { defineEnum } from "../src/enum";
import { defineRules } from "../src/rules";
import { defineShape } from "../src/shape";
import { codes, first, template } from "./fixture";

const enums = defineEnum(template);
const shape = defineShape(enums);
const rules = defineRules(enums, shape);

const color = { colorSpace: "srgb", components: [0, 0, 0] };

describe("modifier", () => {
  it("accepts an axis name", () => {
    expect(first(rules.modifier, "mode")).toBeUndefined();
  });

  it("rejects a context name and a non-string", () => {
    expect(codes(rules.modifier, "light")).toContain("not_member");
    expect(codes(rules.modifier, 5)).toContain("not_string");
  });
});

describe("value", () => {
  it("accepts a literal of some type", () => {
    expect(first(rules.value, 42)).toBeUndefined();
    expect(first(rules.value, color)).toBeUndefined();
  });

  it("rejects a reference and a junk value", () => {
    expect(first(rules.value, "{color.bg}")?.code).toBe("no_match");
    expect(first(rules.value, true)?.code).toBe("no_match");
  });
});

describe("token", () => {
  it("accepts a bare token name", () => {
    expect(first(rules.token, "color.bg")).toBeUndefined();
  });

  it("rejects a curly form and an unknown name", () => {
    expect(codes(rules.token, "{color.bg}")).toContain("not_member");
    expect(codes(rules.token, "ghost")).toContain("not_member");
  });
});

describe("reference", () => {
  it("accepts a reference to a known token", () => {
    expect(first(rules.reference, "{color.bg}")).toBeUndefined();
  });

  it("rejects an unknown reference and a bare name", () => {
    expect(first(rules.reference, "{ghost}")?.code).toBe("not_reference");
    expect(first(rules.reference, "color.bg")?.code).toBe("not_reference");
  });
});

describe("binding", () => {
  it("accepts a known reference or a literal value", () => {
    expect(first(rules.binding, "{color.bg}")).toBeUndefined();
    expect(first(rules.binding, { value: 4, unit: "px" })).toBeUndefined();
  });

  it("rejects an unknown reference", () => {
    expect(first(rules.binding, "{ghost}")?.code).toBe("not_reference");
  });
});

describe("definition", () => {
  it("accepts a well-formed definition", () => {
    expect(
      first(rules.definition, { $type: "color", $value: color }),
    ).toBeUndefined();
  });

  it("rejects a non-object", () => {
    expect(first(rules.definition, "x")?.code).toBe("not_object");
  });

  it("rejects a stray key", () => {
    const issue = first(rules.definition, {
      $type: "number",
      $value: 1,
      size: 2,
    });
    expect(issue?.code).toBe("unknown_key");
  });

  it("rejects a missing required member", () => {
    expect(first(rules.definition, { $type: "number" })?.code).toBe(
      "missing_key",
    );
  });

  it("rejects an unknown $type under the $type path", () => {
    const issue = first(rules.definition, { $type: "colour", $value: "x" });
    expect(issue?.code).toBe("unknown_type");
    expect(issue?.path).toEqual(["$type"]);
  });

  it("correlates $value against the declared $type under the $value path", () => {
    const issue = first(rules.definition, {
      $type: "color",
      $value: { value: 4, unit: "px" },
    });
    expect(issue?.code).toBe("type_mismatch");
    expect(issue?.path?.[0]).toBe("$value");
  });

  it("accepts valid inert metadata", () => {
    expect(
      first(rules.definition, {
        $type: "number",
        $value: 1,
        $description: "a number",
        $deprecated: true,
        $extensions: { "com.example": { note: 1 } },
      }),
    ).toBeUndefined();
    expect(
      first(rules.definition, {
        $type: "number",
        $value: 1,
        $deprecated: "use x instead",
      }),
    ).toBeUndefined();
  });

  it("rejects a non-string $description", () => {
    const issue = first(rules.definition, {
      $type: "number",
      $value: 1,
      $description: 5,
    });
    expect(issue?.code).toBe("not_string");
    expect(issue?.path).toEqual(["$description"]);
  });

  it("rejects a non-boolean, non-string $deprecated", () => {
    expect(
      first(rules.definition, {
        $type: "number",
        $value: 1,
        $deprecated: 5,
      })?.code,
    ).toBe("not_boolean");
  });

  it("rejects a non-object $extensions", () => {
    const issue = first(rules.definition, {
      $type: "number",
      $value: 1,
      $extensions: "x",
    });
    expect(issue?.code).toBe("not_object");
    expect(issue?.path).toEqual(["$extensions"]);
  });
});

describe("tokens", () => {
  it("accepts the complete base token map", () => {
    expect(first(rules.tokens, template.tokens)).toBeUndefined();
  });

  it("rejects a non-object", () => {
    expect(first(rules.tokens, [])?.code).toBe("not_object");
  });

  it("rejects a missing token (incomplete map)", () => {
    const partial = { ...template.tokens };
    Reflect.deleteProperty(partial, "color.bg");
    expect(codes(rules.tokens, partial)).toContain("missing_key");
  });

  it("rejects an unknown token (foreign key)", () => {
    expect(
      codes(rules.tokens, {
        ...template.tokens,
        ghost: { $type: "number", $value: 1 },
      }),
    ).toContain("unknown_key");
  });

  it("rejects a malformed token name", () => {
    expect(
      codes(rules.tokens, { "": { $type: "number", $value: 1 } }),
    ).toContain("empty");
    expect(
      codes(rules.tokens, { "a;b": { $type: "number", $value: 1 } }),
    ).toContain("css_breakout");
  });

  it("rejects a reference cycle", () => {
    /* A one-token schema whose only token references itself. */
    const selfEnums = defineEnum({
      id: "s",
      name: "S",
      tokens: {
        a: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [0, 0, 0] },
        },
      },
      modifiers: {},
      order: [],
    });
    const selfRules = defineRules(selfEnums, defineShape(selfEnums));
    expect(
      codes(selfRules.tokens, { a: { $type: "color", $value: "{a}" } }),
    ).toContain("cycle");
  });
});

describe("overrides", () => {
  it("accepts an empty map and a partial one", () => {
    expect(first(rules.overrides, {})).toBeUndefined();
    expect(first(rules.overrides, { "color.bg": color })).toBeUndefined();
    expect(
      first(rules.overrides, { "color.bg": "{color.fg}" }),
    ).toBeUndefined();
  });

  it("rejects a non-object", () => {
    expect(first(rules.overrides, 5)?.code).toBe("not_object");
  });

  it("rejects an unknown token key", () => {
    expect(first(rules.overrides, { ghost: "{color.bg}" })?.code).toBe(
      "unknown_key",
    );
  });

  it("checks the value against the token's declared type", () => {
    expect(
      first(rules.overrides, { "color.bg": { value: 4, unit: "px" } })?.code,
    ).toBe("type_mismatch");
    expect(first(rules.overrides, { "color.bg": "{space.sm}" })?.code).toBe(
      "type_mismatch",
    );
  });

  it("rejects a cycle among the map's own entries", () => {
    expect(first(rules.overrides, { "color.bg": "{color.bg}" })?.code).toBe(
      "cycle",
    );
    expect(
      first(rules.overrides, {
        "color.bg": "{color.fg}",
        "color.fg": "{color.bg}",
      })?.code,
    ).toBe("cycle");
  });
});

describe("modifiers (complete)", () => {
  it("accepts the complete modifier map", () => {
    expect(first(rules.modifiers, template.modifiers)).toBeUndefined();
  });

  it("rejects a missing axis", () => {
    expect(codes(rules.modifiers, { mode: template.modifiers.mode })).toContain(
      "missing_key",
    );
  });

  it("rejects a missing context within an axis", () => {
    expect(
      codes(rules.modifiers, {
        mode: { light: {} },
        contrast: template.modifiers.contrast,
      }),
    ).toContain("missing_key");
  });

  it("rejects an unknown context key", () => {
    expect(
      codes(rules.modifiers, {
        ...template.modifiers,
        mode: { ...template.modifiers.mode, ghost: {} },
      }),
    ).toContain("unknown_key");
  });

  it("reports a bad binding with the full nested path", () => {
    const issue = first(rules.modifiers, {
      ...template.modifiers,
      mode: {
        ...template.modifiers.mode,
        dark: { "color.fg": "{space.sm}" },
      },
    });
    expect(issue?.code).toBe("type_mismatch");
    expect(issue?.path).toEqual(["mode", "dark", "color.fg"]);
  });
});

describe("order", () => {
  it("accepts a permutation of the axes", () => {
    expect(first(rules.order, ["mode", "contrast"])).toBeUndefined();
    expect(first(rules.order, ["contrast", "mode"])).toBeUndefined();
  });

  it("rejects unknown names and non-arrays", () => {
    expect(first(rules.order, ["ghost"])?.code).toBe("not_member");
    expect(first(rules.order, "mode")?.code).toBe("not_array");
  });

  it("rejects a repeated axis", () => {
    expect(first(rules.order, ["mode", "mode", "contrast"])?.code).toBe(
      "duplicate",
    );
  });

  it("rejects a missing axis", () => {
    expect(first(rules.order, ["mode"])?.code).toBe("not_exhaustive");
    expect(first(rules.order, [])?.code).toBe("not_exhaustive");
  });
});

describe("input", () => {
  it("accepts one valid context per modifier", () => {
    expect(
      first(rules.input, { mode: "dark", contrast: "high" }),
    ).toBeUndefined();
  });

  it("rejects a non-object", () => {
    expect(first(rules.input, "x")?.code).toBe("not_object");
  });

  it("rejects a missing modifier", () => {
    expect(codes(rules.input, { mode: "dark" })).toContain("missing_key");
  });

  it("rejects an invalid context", () => {
    expect(codes(rules.input, { mode: "high", contrast: "normal" })).toContain(
      "not_member",
    );
  });
});

describe("theme", () => {
  it("accepts the complete base template", () => {
    expect(first(rules.theme, template)).toBeUndefined();
  });

  it("rejects a non-object", () => {
    expect(first(rules.theme, 5)?.code).toBe("not_object");
  });

  it("requires every theme key", () => {
    const partial = { ...template };
    Reflect.deleteProperty(partial, "order");
    expect(codes(rules.theme, partial)).toContain("missing_key");
  });

  it("requires complete modifiers", () => {
    expect(
      codes(rules.theme, {
        ...template,
        modifiers: { mode: template.modifiers.mode },
      }),
    ).toContain("missing_key");
  });
});

describe("layer", () => {
  it("requires only id and name", () => {
    expect(first(rules.layer, { id: "l", name: "Layer" })).toBeUndefined();
  });

  it("allows partial tokens and partial modifiers", () => {
    expect(
      first(rules.layer, {
        id: "l",
        name: "Layer",
        tokens: { "color.bg": "{color.fg}" },
        modifiers: { mode: { dark: { "color.bg": "{color.fg}" } } },
      }),
    ).toBeUndefined();
  });

  it("rejects a missing id", () => {
    expect(codes(rules.layer, { name: "Layer" })).toContain("missing_key");
  });

  it("rejects an unknown top-level key", () => {
    expect(first(rules.layer, { id: "l", name: "Layer", ghost: 1 })?.code).toBe(
      "unknown_key",
    );
  });

  it("rejects a bad partial binding", () => {
    expect(
      first(rules.layer, {
        id: "l",
        name: "Layer",
        tokens: { "color.bg": "{space.sm}" },
      })?.code,
    ).toBe("type_mismatch");
  });
});

describe("patch", () => {
  it("accepts an empty patch (no identity required)", () => {
    expect(first(rules.patch, {})).toBeUndefined();
  });

  it("accepts partial tokens and modifiers", () => {
    expect(
      first(rules.patch, {
        tokens: { "color.bg": "{color.fg}" },
        modifiers: { mode: { dark: { "color.bg": "{color.fg}" } } },
      }),
    ).toBeUndefined();
  });

  it("rejects an identity key, since a patch has none", () => {
    expect(first(rules.patch, { id: "p" })?.code).toBe("unknown_key");
    expect(first(rules.patch, { name: "P" })?.code).toBe("unknown_key");
  });

  it("rejects a bad binding", () => {
    expect(
      first(rules.patch, {
        tokens: { "color.bg": { value: 4, unit: "px" } },
      })?.code,
    ).toBe("type_mismatch");
  });

  it("rejects a non-object", () => {
    expect(first(rules.patch, 5)?.code).toBe("not_object");
  });
});
