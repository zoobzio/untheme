import { describe, it, expect } from "vitest";

import blue from "@untheme/radix-ui/themes/blue";
import crimson from "@untheme/radix-ui/themes/crimson";
import cyan from "@untheme/radix-ui/themes/cyan";
import grass from "@untheme/radix-ui/themes/grass";
import orange from "@untheme/radix-ui/themes/orange";
import teal from "@untheme/radix-ui/themes/teal";

// The example's wiring, mirrored from nuxt.config.ts.
const base = blue;
const themes = { blue, crimson, cyan, grass, orange, teal };

describe("nuxt-radix-ui wiring", () => {
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
