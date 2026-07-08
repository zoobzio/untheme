import { describe, it, expect } from "vitest";

import type { Extension } from "../src/types";

import { extend } from "../src/extend";
import { theme, type Mod, type Tok } from "./fixture";

/* The token and modifier axis the extension introduces beyond the base. */
type XTok = "brand.primary";
type XMod = { density: { compact: object; cozy: object } };

/**
 * An extension that overrides a base token, adds a new token, overrides an
 * existing modifier context, and introduces a new modifier axis.
 */
const extension = {
  id: "ext",
  name: "Ext",
  tokens: {
    "color.bg": "{brand.primary}",
    "brand.primary": { $type: "color", $value: "{color.fg}" },
  },
  modifiers: {
    mode: { dark: { "color.fg": "{brand.primary}" } },
    density: {
      compact: { "space.md": "{space.md}" },
      cozy: {},
    },
  },
  order: ["density", "mode", "contrast"],
} satisfies Extension<Tok, Mod, XTok, XMod>;

describe("extend", () => {
  it("rebinds an existing token, keeping its declared type", () => {
    const result = extend(theme, extension);
    expect(result.tokens["color.bg"].$value).toBe("{brand.primary}");
    expect(result.tokens["color.bg"].$type).toBe("color");
  });

  it("inserts a new token as a full definition", () => {
    const result = extend(theme, extension);
    expect(result.tokens["brand.primary"]).toEqual({
      $type: "color",
      $value: "{color.fg}",
    });
  });

  it("deep-merges an existing modifier context, leaf by leaf", () => {
    const result = extend(theme, extension);
    expect(result.modifiers.mode.dark).toEqual({
      "color.bg": { colorSpace: "srgb", components: [0, 0, 0] },
      "color.fg": "{brand.primary}",
    });
    expect(result.modifiers.mode.light).toEqual(theme.modifiers.mode.light);
  });

  it("adds a new modifier axis wholesale", () => {
    const result = extend(theme, extension);
    expect(result.modifiers.density).toEqual({
      compact: { "space.md": "{space.md}" },
      cozy: {},
    });
  });

  it("composes order: base axes not relisted, then the extension's", () => {
    const result = extend(theme, extension);
    expect(result.order).toEqual(["density", "mode", "contrast"]);
  });

  it("takes the extension's identity", () => {
    const result = extend(theme, extension);
    expect(result.id).toBe("ext");
    expect(result.name).toBe("Ext");
  });

  it("shares no structure with its inputs", () => {
    const result = extend(theme, extension);
    expect(result.tokens["color.fg"]).not.toBe(theme.tokens["color.fg"]);
    expect(result.tokens["brand.primary"]).not.toBe(
      extension.tokens["brand.primary"],
    );
    expect(result.modifiers.mode.dark).not.toBe(theme.modifiers.mode.dark);
  });

  it("mutating the result leaves inputs untouched", () => {
    const result = extend(theme, extension);
    const value = result.tokens["color.fg"].$value;

    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      "components" in value
    ) {
      value.components[0] = 9;
    }

    expect(theme.tokens["color.fg"].$value).toEqual({
      colorSpace: "srgb",
      components: [0, 0, 0],
      alpha: 1,
    });
  });
});

/**
 * Type-level coverage for {@link extend}'s authoring DX. The `@ts-expect-error`
 * directives are checked by `tsc --noEmit` (the package typecheck), which reads
 * this file through the tsconfig `include`. The runtime body only exists so the
 * suite is a valid test; the assertions that matter are the compile-time ones.
 */
describe("extend types", () => {
  it("survives inference: references resolve across base and new tokens", () => {
    /**
     * (a) a base-token override references a NEW extension token, and (b) a new
     * token's `$value` references a BASE token — both must typecheck, which
     * proves the `{token}` suggestion union spans both sets.
     */
    const widened = extend(theme, {
      id: "brand",
      name: "Brand",
      tokens: {
        "color.bg": "{brand.primary}",
        "brand.primary": { $type: "color", $value: "{color.fg}" },
      },
      modifiers: {
        mode: { dark: { "color.fg": "{brand.primary}" } },
      },
      order: [],
    });

    /**
     * (d) the return token union carries BOTH the base tokens and the new one,
     * and has not widened to `string` — proof the reference values in value
     * positions never collapsed `XTok`.
     */
    type ReturnTokens = keyof (typeof widened)["tokens"];
    const base: ReturnTokens = "color.bg";
    const added: ReturnTokens = "brand.primary";
    // @ts-expect-error the union did not widen to string
    const widenedToString: ReturnTokens = "not.a.token";

    void base;
    void added;
    void widenedToString;

    expect(widened.tokens["brand.primary"].$type).toBe("color");
  });

  it("requires a full definition for a new token", () => {
    expect(() =>
      extend(theme, {
        id: "e",
        name: "E",
        tokens: {
          // @ts-expect-error a new token needs a full definition, not a bare binding
          "brand.primary": "{color.fg}",
        },
        modifiers: {},
        order: [],
      }),
    ).toThrowError(TypeError);
  });

  it("rejects a full definition where a bare binding is expected", () => {
    extend(theme, {
      id: "e",
      name: "E",
      tokens: {
        // @ts-expect-error a base override is a bare binding, not a definition
        "color.bg": { $type: "color", $value: "{color.fg}" },
      },
      modifiers: {},
      order: [],
    });
    expect(true).toBe(true);
  });

  it("rejects an override key naming a token outside the contract", () => {
    extend(theme, {
      id: "e",
      name: "E",
      tokens: {},
      modifiers: {
        // @ts-expect-error color.nope is not a token in the base or the extension
        mode: { dark: { "color.nope": "{color.fg}" } },
      },
      order: [],
    });
    expect(true).toBe(true);
  });
});
