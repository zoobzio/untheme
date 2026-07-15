import { describe, expect, it } from "vitest";
import { defineUntheme } from "untheme";

import { defineShikiTheme } from "../src/theme";
import { SyntaxMappingError } from "../src/error";
import { BASIC_SCOPES } from "../src/scopes";

type ColorDef = {
  $type: "color";
  $value: { colorSpace: "srgb"; components: number[] };
};

type NumberDef = { $type: "number"; $value: number };

const color = (n: number): ColorDef => ({
  $type: "color",
  $value: { colorSpace: "srgb", components: [n, 0, 0] },
});

/**
 * A contract with a handful of color tokens to bind roles to, plus one
 * non-color token so the color-type check has something to reject.
 */
const tokens: Record<string, ColorDef | NumberDef> = {
  ink: color(0.1),
  rose: color(0.2),
  sky: color(0.3),
  moss: color(0.4),
  "not-color": { $type: "number", $value: 8 },
};

const schema = () => {
  const untheme = defineUntheme({
    theme: { id: "t", name: "T", tokens, modifiers: {}, order: [] },
    input: {},
    override: {},
  });

  return untheme.schema;
};

const MAP = { keyword: "ink", string: "rose", comment: "moss" };

describe("defineShikiTheme", () => {
  it("colors a scope with the var() of the token its role maps to", () => {
    const theme = defineShikiTheme(schema(), MAP);

    const keyword = theme.settings?.find((s) => s.scope === "keyword");
    expect(keyword?.settings.foreground).toBe("var(--ink)");
  });

  it("always applies the universal set, one settings entry per rule", () => {
    const theme = defineShikiTheme(schema(), MAP);

    expect(theme.settings).toHaveLength(BASIC_SCOPES.length);
  });

  it("leaves a scope uncolored when its role is not in the map", () => {
    const theme = defineShikiTheme(schema(), { keyword: "ink" });

    const comment = theme.settings?.find((s) => s.scope === "comment");
    expect(comment?.settings.foreground).toBeUndefined();
  });

  it("carries font styles for style-only scopes with no role", () => {
    const theme = defineShikiTheme(schema(), MAP);

    const underline = theme.settings?.find(
      (s) => s.scope === "markup.underline",
    );
    expect(underline?.settings.fontStyle).toBe("underline");
    expect(underline?.settings.foreground).toBeUndefined();
  });

  it("maps semantic token colors through the same indirection", () => {
    const theme = defineShikiTheme(schema(), MAP);

    expect(theme.semanticTokenColors?.stringLiteral).toBe("var(--rose)");
    expect(theme.semanticHighlighting).toBe(true);
  });

  it("sets fg / bg / name / type from options", () => {
    const theme = defineShikiTheme(schema(), MAP, {
      name: "brand",
      type: "light",
      fg: "ink",
      bg: "sky",
    });

    expect(theme.name).toBe("brand");
    expect(theme.type).toBe("light");
    expect(theme.fg).toBe("var(--ink)");
    expect(theme.bg).toBe("var(--sky)");
  });

  it("layers options.scopes on top of the universal set", () => {
    const extra = [
      { scope: "keyword.operator.custom", role: "operator" },
      { scope: "meta.custom", role: "keyword" },
    ];
    const theme = defineShikiTheme(schema(), MAP, { scopes: extra });

    expect(theme.settings).toHaveLength(BASIC_SCOPES.length + extra.length);
  });

  it("honors an open, non-LSP role in an added scope rule", () => {
    const theme = defineShikiTheme(
      schema(),
      { ...MAP, punctuation: "sky" },
      { scopes: [{ scope: "punctuation.terminator", role: "punctuation" }] },
    );

    const punct = theme.settings?.find(
      (s) => s.scope === "punctuation.terminator",
    );
    expect(punct?.settings.foreground).toBe("var(--sky)");
  });

  it("rejects a role bound to a token outside the contract", () => {
    expect(() =>
      defineShikiTheme(schema(), { keyword: "no-such-token" }),
    ).toThrow(SyntaxMappingError);
  });

  it("rejects a role bound to a non-color token", () => {
    expect(() => defineShikiTheme(schema(), { keyword: "not-color" })).toThrow(
      /not a color/,
    );
  });

  it("collects every fault in one pass", () => {
    try {
      defineShikiTheme(schema(), {
        keyword: "no-such-token",
        string: "not-color",
      });
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(SyntaxMappingError);
      if (error instanceof SyntaxMappingError) {
        expect(error.problems).toHaveLength(2);
      }
    }
  });
});
