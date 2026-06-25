import { describe, it, expect } from "vitest";

import dracula from "@untheme/material-3/themes/dracula";
import nord from "@untheme/material-3/themes/nord";
import tokyoNight from "@untheme/material-3/themes/tokyo_night";
import catppuccin from "@untheme/material-3/themes/catppuccin";
import gruvbox from "@untheme/material-3/themes/gruvbox";
import rosePine from "@untheme/material-3/themes/rose_pine";

// The example's wiring, mirrored from nuxt.config.ts.
const base = dracula;
const themes = {
  dracula,
  nord,
  tokyo_night: tokyoNight,
  catppuccin,
  gruvbox,
  rose_pine: rosePine,
};

describe("nuxt-material-3 wiring", () => {
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
