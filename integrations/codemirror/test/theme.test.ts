import { describe, expect, it } from "vitest";
import { tags } from "@lezer/highlight";
import { defineUntheme } from "untheme";

import { defineCodeMirrorTheme } from "../src/theme";
import { highlightRules } from "../src/util";
import { SyntaxMappingError } from "../src/error";
import { TAGS } from "../src/constant";

type ColorDef = {
  $type: "color";
  $value: { colorSpace: "srgb"; components: number[] };
};

type NumberDef = { $type: "number"; $value: number };

const color = (n: number): ColorDef => ({
  $type: "color",
  $value: { colorSpace: "srgb", components: [n, 0, 0] },
});

const tokens: Record<string, ColorDef | NumberDef> = {
  ink: color(0.1),
  rose: color(0.2),
  sky: color(0.3),
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

const MAP = { keyword: "ink", string: "rose", comment: "sky" };

describe("highlightRules", () => {
  it("resolves each tag name to its Lezer tag and its token's var()", () => {
    const rules = highlightRules(MAP);

    const keyword = rules.find((r) => r.tag === TAGS.keyword);
    expect(keyword?.color).toBe("var(--ink)");

    const string = rules.find((r) => r.tag === TAGS.string);
    expect(string?.color).toBe("var(--rose)");
  });

  it("carries style-only tags (emphasis, strong) even when unmapped", () => {
    const rules = highlightRules({});

    const emphasis = rules.find((r) => r.tag === TAGS.emphasis);
    expect(emphasis?.fontStyle).toBe("italic");
    expect(emphasis?.color).toBeUndefined();
  });

  it("applies a raw-tag rule from the escape hatch", () => {
    const rules = highlightRules({}, [{ tag: tags.docComment, token: "sky" }]);

    const doc = rules.find((r) => r.tag === tags.docComment);
    expect(doc?.color).toBe("var(--sky)");
  });
});

describe("defineCodeMirrorTheme", () => {
  it("returns the chrome and highlight extensions", () => {
    const ext = defineCodeMirrorTheme(schema(), MAP, { background: "ink" });

    expect(Array.isArray(ext)).toBe(true);
    expect(ext).toHaveLength(2);
  });

  it("rejects a tag bound to a token outside the contract", () => {
    expect(() =>
      defineCodeMirrorTheme(schema(), { keyword: "no-such-token" }),
    ).toThrow(SyntaxMappingError);
  });

  it("rejects a tag bound to a non-color token", () => {
    expect(() =>
      defineCodeMirrorTheme(schema(), { keyword: "not-color" }),
    ).toThrow(/not a color/);
  });

  it("validates chrome and escape-hatch tokens too", () => {
    expect(() =>
      defineCodeMirrorTheme(schema(), MAP, { caret: "not-color" }),
    ).toThrow(/caret .* not a color/);

    expect(() =>
      defineCodeMirrorTheme(schema(), MAP, {
        tags: [{ tag: tags.docComment, token: "no-such-token" }],
      }),
    ).toThrow(SyntaxMappingError);
  });

  it("collects every fault in one pass", () => {
    try {
      defineCodeMirrorTheme(schema(), {
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
