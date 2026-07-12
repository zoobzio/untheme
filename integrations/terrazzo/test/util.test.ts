import type { Source } from "../src/types";

import { describe, expect, it } from "vitest";

import { braced, cite, serialize, walk } from "../src/util";

const token = (over: Partial<Source>): Source => {
  return { id: "test.token", $type: "color", $value: "#000000", ...over };
};

describe("cite", () => {
  it("names the origin document when the token carries one", () => {
    const source = token({
      id: "color.fg",
      source: { filename: "tokens.json" },
    });
    expect(cite(source)).toBe('"color.fg" (tokens.json)');
  });

  it("cites the id alone when there is no source filename", () => {
    expect(cite(token({ id: "color.fg" }))).toBe('"color.fg"');
  });
});

describe("braced", () => {
  it("wraps an id in reference braces", () => {
    expect(braced("color.fg")).toBe("{color.fg}");
  });
});

describe("serialize", () => {
  it("quotes strings", () => {
    expect(serialize("solid", "")).toBe('"solid"');
    expect(serialize('a "b"', "")).toBe('"a \\"b\\""');
  });

  it("renders numbers and booleans bare", () => {
    expect(serialize(400, "")).toBe("400");
    expect(serialize(true, "")).toBe("true");
  });

  it("renders empty collections inline", () => {
    expect(serialize([], "")).toBe("[]");
    expect(serialize({}, "")).toBe("{}");
  });

  it("indents nested arrays and objects deterministically", () => {
    expect(serialize({ a: 1, b: [2] }, "")).toBe(
      "{\n  a: 1,\n  b: [\n    2,\n  ],\n}",
    );
  });

  it("quotes keys only when they are not valid identifiers", () => {
    expect(serialize({ colorSpace: "srgb" }, "")).toBe(
      '{\n  colorSpace: "srgb",\n}',
    );
    expect(serialize({ "color.fg": 1 }, "")).toBe('{\n  "color.fg": 1,\n}');
    expect(serialize({ "50": 1 }, "")).toBe('{\n  "50": 1,\n}');
  });

  it("throws on a value it cannot represent", () => {
    expect(() => serialize(undefined, "")).toThrow(/cannot serialize/);
    expect(() => serialize(null, "")).toThrow(/cannot serialize/);
    expect(() => serialize(() => 1, "")).toThrow(/cannot serialize/);
  });
});

describe("walk", () => {
  const source = token({});

  it("restores a partial alias as a braced reference", () => {
    expect(walk("#000000", "color.primary.600", source)).toBe(
      "{color.primary.600}",
    );
  });

  it("keeps an already-braced reference in place", () => {
    expect(walk("{color.fg}", undefined, source)).toBe("{color.fg}");
  });

  it("converts a null leaf to the none sentinel", () => {
    expect(walk(null, undefined, source)).toBe("none");
  });

  it("returns a primitive leaf untouched", () => {
    expect(walk(0.5, undefined, source)).toBe(0.5);
  });

  it("walks an array element-wise against a parallel partial", () => {
    expect(
      walk(["#000000", "#ffffff"], ["color.fg", undefined], source),
    ).toEqual(["{color.fg}", "#ffffff"]);
  });

  it("walks array elements with no partials when the partial is not an array", () => {
    expect(walk([null, "#fff"], undefined, source)).toEqual(["none", "#fff"]);
  });

  it("drops a false inset member and recurses record values against the partial", () => {
    const node = {
      color: { colorSpace: "srgb", components: [0, 0, 0] },
      inset: false,
    };
    expect(walk(node, { color: "color.fg" }, source)).toEqual({
      color: "{color.fg}",
    });
  });

  it("drops undefined record members", () => {
    expect(
      walk(
        { width: { value: 1, unit: "px" }, style: undefined },
        undefined,
        source,
      ),
    ).toEqual({
      width: { value: 1, unit: "px" },
    });
  });

  it("rejects a true inset since untheme shadows carry none", () => {
    expect(() => walk({ inset: true }, undefined, source)).toThrow(/inset/);
  });
});
