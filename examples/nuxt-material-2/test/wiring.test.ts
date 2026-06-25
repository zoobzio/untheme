import { describe, it, expect } from "vitest";

import nord from "@untheme/material-2/themes/nord";
import dracula from "@untheme/material-2/themes/dracula";
import tokyoNight from "@untheme/material-2/themes/tokyo_night";
import solarized from "@untheme/material-2/themes/solarized";
import oneDark from "@untheme/material-2/themes/one_dark";
import monokai from "@untheme/material-2/themes/monokai";

// The example's wiring, mirrored from nuxt.config.ts.
const base = nord;
const themes = {
  nord,
  dracula,
  tokyo_night: tokyoNight,
  solarized,
  one_dark: oneDark,
  monokai,
};

describe("nuxt-material-2 wiring", () => {
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
