import { describe, expect, it } from "vitest";

import {
  borderOf,
  gradientOf,
  shadowOf,
  strokeStyleOf,
  transitionOf,
  typographyOf,
} from "../src/composite";
import type { Rule } from "../src/types";

/* A rule that records every value it sees and always passes. */
const spy = () => {
  const calls: unknown[] = [];
  const rule: Rule = (v) => {
    calls.push(v);
    return undefined;
  };
  return { rule, calls };
};

/* A rule that always passes and one that always fails with a marker. */
const ok: Rule = () => undefined;
const no: Rule = (v) => ({
  code: "not_number",
  message: "marker",
  received: v,
});

const dim = { value: 1, unit: "px" } as const;
const color = { colorSpace: "srgb", components: [0, 0, 0] } as const;

describe("strokeStyleOf", () => {
  const rule = strokeStyleOf(ok);

  it("accepts a keyword form", () => {
    expect(rule("dashed")).toBeUndefined();
  });

  it("rejects an unknown keyword", () => {
    expect(rule("wavy")?.code).toBe("not_member");
  });

  it("accepts a dash object", () => {
    expect(rule({ dashArray: [dim], lineCap: "round" })).toBeUndefined();
  });

  it("rejects an unknown line cap", () => {
    expect(rule({ dashArray: [dim], lineCap: "flat" })?.code).toBe(
      "not_member",
    );
  });

  it("rejects a non-string, non-object", () => {
    expect(rule(5)?.code).toBe("type_mismatch");
  });

  it("delegates each dash length to the dimension rule", () => {
    const dimension = spy();
    strokeStyleOf(dimension.rule)({ dashArray: [dim, dim], lineCap: "butt" });
    expect(dimension.calls).toEqual([dim, dim]);
  });

  it("fails when the dimension rule rejects a dash length", () => {
    expect(strokeStyleOf(no)({ dashArray: [dim], lineCap: "butt" })?.code).toBe(
      "not_number",
    );
  });
});

describe("borderOf", () => {
  it("accepts a complete border", () => {
    expect(
      borderOf(ok, ok, ok)({ color, width: dim, style: "solid" }),
    ).toBeUndefined();
  });

  it("rejects a non-border shape", () => {
    expect(borderOf(ok, ok, ok)("1px solid black")?.code).toBe("type_mismatch");
  });

  it("rejects a missing slot", () => {
    expect(borderOf(ok, ok, ok)({ color, width: dim })?.code).toBe(
      "missing_key",
    );
  });

  it("routes each slot to its own rule", () => {
    const c = spy();
    const d = spy();
    const s = spy();
    borderOf(c.rule, d.rule, s.rule)({ color, width: dim, style: "solid" });
    expect(c.calls).toEqual([color]);
    expect(d.calls).toEqual([dim]);
    expect(s.calls).toEqual(["solid"]);
  });

  it("fails when the color rule rejects the color slot", () => {
    expect(
      borderOf(no, ok, ok)({ color, width: dim, style: "solid" })?.code,
    ).toBe("not_number");
  });
});

describe("transitionOf", () => {
  const value = {
    duration: dim,
    delay: dim,
    timingFunction: [0, 0, 1, 1],
  };

  it("accepts a complete transition", () => {
    expect(transitionOf(ok, ok)(value)).toBeUndefined();
  });

  it("rejects a value missing the timing function marker key", () => {
    expect(transitionOf(ok, ok)({ duration: dim, delay: dim })?.code).toBe(
      "type_mismatch",
    );
  });

  it("routes duration and delay to the duration rule and timing to the bezier rule", () => {
    const duration = spy();
    const bezier = spy();
    transitionOf(duration.rule, bezier.rule)(value);
    expect(duration.calls).toEqual([dim, dim]);
    expect(bezier.calls).toEqual([[0, 0, 1, 1]]);
  });
});

describe("shadowOf", () => {
  const shadow = {
    color,
    offsetX: dim,
    offsetY: dim,
    blur: dim,
    spread: dim,
  };

  it("accepts a single shadow object", () => {
    expect(shadowOf(ok, ok, ok)(shadow)).toBeUndefined();
  });

  it("accepts an array of shadow objects", () => {
    expect(shadowOf(ok, ok, ok)([shadow, shadow])).toBeUndefined();
  });

  it("accepts a reference element inside the array", () => {
    expect(shadowOf(ok, ok, ok)([shadow, "{shadow.sm}"])).toBeUndefined();
  });

  it("rejects a nested array of shadows", () => {
    expect(shadowOf(ok, ok, ok)([[shadow]])?.code).toBe("type_mismatch");
  });

  it("rejects a non-object, non-array", () => {
    expect(shadowOf(ok, ok, ok)("0 1px 2px black")?.code).toBe("type_mismatch");
  });

  it("rejects a shadow missing a slot", () => {
    expect(shadowOf(ok, ok, ok)({ color, offsetX: dim })?.code).toBe(
      "missing_key",
    );
  });

  it("routes the color and four dimension slots to their rules", () => {
    const c = spy();
    const d = spy();
    shadowOf(c.rule, d.rule, ok)(shadow);
    expect(c.calls).toEqual([color]);
    expect(d.calls).toEqual([dim, dim, dim, dim]);
  });

  it("routes an array reference element to the reference rule", () => {
    const reference = spy();
    shadowOf(ok, ok, reference.rule)([shadow, "{shadow.sm}"]);
    expect(reference.calls).toEqual(["{shadow.sm}"]);
  });
});

describe("gradientOf", () => {
  const stop = { color, position: 0 };

  it("accepts an array of stops", () => {
    expect(gradientOf(ok, ok)([stop, { color, position: 1 }])).toBeUndefined();
  });

  it("rejects a non-array", () => {
    expect(gradientOf(ok, ok)({})?.code).toBe("type_mismatch");
  });

  it("rejects a stop with neither color nor position", () => {
    expect(gradientOf(ok, ok)([{}])?.code).toBe("type_mismatch");
  });

  it("rejects a stop missing a required slot", () => {
    expect(gradientOf(ok, ok)([{ color }])?.code).toBe("missing_key");
  });

  it("routes color and position slots to their rules", () => {
    const c = spy();
    const n = spy();
    gradientOf(c.rule, n.rule)([stop]);
    expect(c.calls).toEqual([color]);
    expect(n.calls).toEqual([0]);
  });
});

describe("typographyOf", () => {
  const value = {
    fontFamily: "Inter",
    fontSize: dim,
    fontWeight: 400,
    letterSpacing: dim,
    lineHeight: 1.5,
  };

  it("accepts a complete typography set", () => {
    expect(typographyOf(ok, ok, ok, ok)(value)).toBeUndefined();
  });

  it("rejects a value missing the font size marker key", () => {
    const partial = { fontFamily: "Inter", fontWeight: 400 };
    expect(typographyOf(ok, ok, ok, ok)(partial)?.code).toBe("type_mismatch");
  });

  it("routes each slot to its own rule", () => {
    const family = spy();
    const dimension = spy();
    const weight = spy();
    const number = spy();
    typographyOf(family.rule, dimension.rule, weight.rule, number.rule)(value);
    expect(family.calls).toEqual(["Inter"]);
    expect(dimension.calls).toEqual([dim, dim]);
    expect(weight.calls).toEqual([400]);
    expect(number.calls).toEqual([1.5]);
  });
});
