import { describe, expect, it } from "vitest";

import { dashed, indirection, property } from "../src/property";

describe("dashed", () => {
  it("replaces every dot with a dash", () => {
    expect(dashed("color.fg.muted")).toBe("color-fg-muted");
  });

  it("leaves a dotless name untouched", () => {
    expect(dashed("accent")).toBe("accent");
  });
});

describe("property", () => {
  it("names a token's custom property, dashing its dots", () => {
    expect(property("color.bg")).toBe("--color-bg");
    expect(property("color.fg.muted")).toBe("--color-fg-muted");
  });
});

describe("indirection", () => {
  it("wraps a reference's target custom property in var()", () => {
    expect(indirection("{color.accent}")).toBe("var(--color-accent)");
  });

  it("unwraps the braces before dashing the target name", () => {
    expect(indirection("{type.body}")).toBe("var(--type-body)");
  });
});
