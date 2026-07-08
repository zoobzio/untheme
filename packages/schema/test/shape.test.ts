import { describe, expect, it } from "vitest";

import { defineEnum } from "../src/enum";
import { defineShape } from "../src/shape";
import type { Type } from "../src/types";
import { template, zero } from "./fixture";

const enums = defineEnum(template);
const shape = defineShape(enums);

const color = { colorSpace: "srgb", components: [0, 0, 0] } as const;
const dim = { value: 4, unit: "px" } as const;

/* A same-type token in the fixture and a valid literal, per type. */
const cases: { type: Type; token: string; literal: unknown }[] = [
  { type: "color", token: "color.bg", literal: color },
  { type: "dimension", token: "space.sm", literal: dim },
  { type: "duration", token: "time.fast", literal: { value: 1, unit: "ms" } },
  { type: "fontFamily", token: "font.body", literal: "Inter" },
  { type: "fontWeight", token: "weight.bold", literal: 400 },
  { type: "number", token: "opacity.half", literal: 0.5 },
  { type: "cubicBezier", token: "ease.inout", literal: [0, 0, 1, 1] },
  { type: "strokeStyle", token: "stroke.dashed", literal: "solid" },
  {
    type: "border",
    token: "border.thin",
    literal: { color, width: dim, style: "solid" },
  },
  {
    type: "transition",
    token: "motion.slide",
    literal: {
      duration: { value: 1, unit: "s" },
      delay: { value: 0, unit: "ms" },
      timingFunction: [0, 0, 1, 1],
    },
  },
  {
    type: "shadow",
    token: "shadow.sm",
    literal: { color, offsetX: dim, offsetY: dim, blur: dim, spread: dim },
  },
  {
    type: "gradient",
    token: "gradient.fade",
    literal: [{ color, position: 0 }],
  },
  {
    type: "typography",
    token: "type.heading",
    literal: {
      fontFamily: "Inter",
      fontSize: dim,
      fontWeight: 400,
      letterSpacing: dim,
      lineHeight: 1.5,
    },
  },
];

describe("defineShape", () => {
  it("exposes a literal and value rule for every type", () => {
    for (const { type } of cases) {
      expect(typeof shape[type].literal).toBe("function");
      expect(typeof shape[type].value).toBe("function");
    }
  });

  describe.each(cases)("$type value rule", ({ type, token, literal }) => {
    it(`${type}: accepts a same-type reference`, () => {
      expect(shape[type].value(`{${token}}`)).toBeUndefined();
    });

    it(`${type}: accepts the literal in place`, () => {
      expect(shape[type].value(literal)).toBeUndefined();
    });

    it(`${type}: rejects a reference to an unknown token`, () => {
      expect(shape[type].value("{ghost}")?.code).toBe("not_reference");
    });

    it(`${type}: rejects a reference to a different-type token`, () => {
      /* space.sm is a dimension; color is not. */
      const other = type === "dimension" ? "{color.bg}" : "{space.sm}";
      expect(shape[type].value(other)?.code).toBe("type_mismatch");
    });
  });

  it("the literal rule does not accept a reference string", () => {
    expect(shape.color.literal("{color.bg}")?.code).toBe("type_mismatch");
  });

  describe("composite sub-slots accept same-type references", () => {
    it("border slots take color, dimension, and strokeStyle references", () => {
      expect(
        shape.border.value({
          color: "{color.fg}",
          width: "{space.sm}",
          style: "{stroke.dashed}",
        }),
      ).toBeUndefined();
    });

    it("a cross-type reference in a border slot is rejected", () => {
      expect(
        shape.border.value({
          color: "{space.sm}",
          width: "{space.sm}",
          style: "solid",
        })?.code,
      ).toBe("type_mismatch");
    });

    it("a shadow array reference must be a shadow token", () => {
      expect(shape.shadow.value(["{shadow.sm}"])).toBeUndefined();
      expect(shape.shadow.value(["{color.bg}"])?.code).toBe("type_mismatch");
    });

    it("a strokeStyle dash array reference must be a dimension token", () => {
      expect(
        shape.strokeStyle.value({
          dashArray: ["{space.sm}"],
          lineCap: "round",
        }),
      ).toBeUndefined();
      expect(
        shape.strokeStyle.value({
          dashArray: ["{color.bg}"],
          lineCap: "round",
        })?.code,
      ).toBe("type_mismatch");
    });

    it("a typography slot takes references and a literal spacing", () => {
      expect(
        shape.typography.value({
          fontFamily: "{font.body}",
          fontSize: "{space.md}",
          fontWeight: "{weight.bold}",
          letterSpacing: zero,
          lineHeight: 1.2,
        }),
      ).toBeUndefined();
    });
  });
});
