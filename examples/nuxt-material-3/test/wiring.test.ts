import { describe, it, expect } from "vitest";

import config from "../untheme.config";

const { base, themes, input } = config;

describe("nuxt-material-3 wiring", () => {
  it("boots from a theme that is in the switchable catalog", () => {
    expect(Object.values(themes)).toContain(base);
  });

  it("boots with a complete, light/dark base theme", () => {
    expect(base.id).toBeTruthy();
    expect(base.name).toBeTruthy();
    expect(Object.keys(base.tokens).length).toBeGreaterThan(0);
    expect(base.order).toContain("color");
    expect(base.modifiers.color.light).toBeDefined();
    expect(Object.keys(base.modifiers.color.dark).length).toBeGreaterThan(0);
  });

  it("seeds a selection the contract offers", () => {
    for (const modifier of base.order) {
      expect(base.modifiers[modifier]).toHaveProperty(input[modifier]);
    }
  });

  it("gives every catalog entry an identity", () => {
    for (const theme of Object.values(themes)) {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
    }
  });

  it("gives the switcher distinct theme ids", () => {
    const ids = Object.values(themes).map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
