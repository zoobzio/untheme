import { describe, expect, it } from "vitest";

import { defineMeta } from "../src/meta";
import { first, template } from "./fixture";

describe("defineMeta", () => {
  const meta = defineMeta(template);

  it("returns the enums, shape, and rules bundle", () => {
    expect(Object.keys(meta).sort()).toEqual(["enums", "rules", "shape"]);
  });

  it("wires enums off the template", () => {
    expect(meta.enums.tokens.has("color.bg")).toBe(true);
    expect([...meta.enums.modifiers]).toEqual(["mode", "contrast"]);
    expect(meta.enums.types["space.sm"]).toBe("dimension");
  });

  it("wires a literal and value rule per type into shape", () => {
    expect(typeof meta.shape.color.literal).toBe("function");
    expect(typeof meta.shape.color.value).toBe("function");
    expect(meta.shape.color.value("{color.bg}")).toBeUndefined();
  });

  it("wires rules that draw their sets from the same template", () => {
    expect(first(meta.rules.theme, template)).toBeUndefined();
    expect(first(meta.rules.token, "color.bg")).toBeUndefined();
    expect(first(meta.rules.modifier, "mode")).toBeUndefined();
  });
});
