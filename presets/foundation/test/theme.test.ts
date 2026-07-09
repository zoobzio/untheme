import { describe, expect, it } from "vitest";

import { defineSchema } from "@untheme/schema";

import { preset } from "../src/preset";

import { RAMP_TOKENS } from "./fixture";

const config = preset.use({
  color: "light",
  contrast: "default",
  text: "md",
  density: "default",
  radius: "default",
  motion: "default",
});

describe("base theme", () => {
  it("satisfies its own contract", () => {
    expect(() => defineSchema(config.theme)).not.toThrow();
  });

  it("carries every generated ramp token", () => {
    for (const token of RAMP_TOKENS) {
      expect(config.theme.tokens).toHaveProperty([token]);
    }
  });

  it("binds every color role onto a ramp step", () => {
    const schema = defineSchema(config.theme);
    const ramps = new Set(RAMP_TOKENS);
    for (const [token, definition] of Object.entries(config.theme.tokens)) {
      if (definition.$type !== "color" || ramps.has(token)) {
        continue;
      }
      expect(schema.check.reference(definition.$value)).toBe(true);
    }
  });
});
