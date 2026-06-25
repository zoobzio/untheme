import { describe, it, expect } from "vitest";

import whiteG90 from "@untheme/carbon/themes/white-g90";
import g10G90 from "@untheme/carbon/themes/g10-g90";
import g10G100 from "@untheme/carbon/themes/g10-g100";

// The example's wiring, mirrored from nuxt.config.ts.
const base = whiteG90;
const themes = {
  "white-g90": whiteG90,
  "g10-g90": g10G90,
  "g10-g100": g10G100,
};

describe("nuxt-carbon wiring", () => {
  it("boots from a theme that is in the switchable catalog", () => {
    expect(Object.values(themes)).toContain(base);
  });

  it("every catalog entry is a complete, light/dark theme", () => {
    for (const theme of Object.values(themes)) {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(Object.keys(theme.reference).length).toBeGreaterThan(0);
      expect(Object.keys(theme.system.light).length).toBeGreaterThan(0);
      expect(Object.keys(theme.system.dark).length).toBeGreaterThan(0);
    }
  });

  it("gives the switcher distinct theme ids", () => {
    const ids = Object.values(themes).map((theme) => theme.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
