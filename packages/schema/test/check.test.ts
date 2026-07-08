import { describe, expect, it } from "vitest";

import { defineCheck } from "../src/check";
import { meta, template } from "./fixture";

const check = defineCheck(meta);

const color = { colorSpace: "srgb", components: [0, 0, 0] } as const;

describe("defineCheck", () => {
  it("exposes a predicate for every kind", () => {
    expect(Object.keys(check).sort()).toEqual(
      [
        "binding",
        "definition",
        "input",
        "layer",
        "modifier",
        "modifiers",
        "order",
        "overrides",
        "patch",
        "reference",
        "theme",
        "token",
        "tokens",
        "value",
      ].sort(),
    );
  });

  it("returns true when every rule passes and false otherwise", () => {
    expect(check.modifier("mode")).toBe(true);
    expect(check.modifier("light")).toBe(false);

    expect(check.token("color.bg")).toBe(true);
    expect(check.token("{color.bg}")).toBe(false);

    expect(check.reference("{color.bg}")).toBe(true);
    expect(check.reference("{ghost}")).toBe(false);

    expect(check.value(42)).toBe(true);
    expect(check.value(true)).toBe(false);

    expect(check.binding("{color.bg}")).toBe(true);
    expect(check.binding("{ghost}")).toBe(false);

    expect(check.definition({ $type: "color", $value: color })).toBe(true);
    expect(check.definition({ $type: "color", $value: "#fff" })).toBe(false);

    expect(check.overrides({ "color.bg": color })).toBe(true);
    expect(check.overrides({ ghost: color })).toBe(false);

    expect(check.tokens(template.tokens)).toBe(true);
    expect(check.tokens({})).toBe(false);

    expect(check.modifiers(template.modifiers)).toBe(true);
    expect(check.modifiers({ mode: template.modifiers.mode })).toBe(false);

    expect(check.order(["mode", "contrast"])).toBe(true);
    expect(check.order(["ghost"])).toBe(false);

    expect(check.input({ mode: "dark", contrast: "high" })).toBe(true);
    expect(check.input({ mode: "dark" })).toBe(false);

    expect(check.theme(template)).toBe(true);
    expect(check.theme({})).toBe(false);

    expect(check.layer({ id: "l", name: "L" })).toBe(true);
    expect(check.layer({ tokens: {} })).toBe(false);

    expect(check.patch({})).toBe(true);
    expect(check.patch({ id: "p" })).toBe(false);
  });
});
