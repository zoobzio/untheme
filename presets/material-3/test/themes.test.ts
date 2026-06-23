import { describe, it, expect } from "vitest";
import { defineSchema } from "@untheme/schema";
import preset from "../src/preset";

import ayu from "../src/themes/ayu";
import catppuccin from "../src/themes/catppuccin";
import cyberdream from "../src/themes/cyberdream";
import dracula from "../src/themes/dracula";
import everforest from "../src/themes/everforest";
import github from "../src/themes/github";
import gruvbox from "../src/themes/gruvbox";
import horizon from "../src/themes/horizon";
import kanagawa from "../src/themes/kanagawa";
import monokai from "../src/themes/monokai";
import night_owl from "../src/themes/night_owl";
import nord from "../src/themes/nord";
import one_dark from "../src/themes/one_dark";
import palenight from "../src/themes/palenight";
import rose_pine from "../src/themes/rose_pine";
import solarized from "../src/themes/solarized";
import synthwave from "../src/themes/synthwave";
import tokyo_night from "../src/themes/tokyo_night";
import vesper from "../src/themes/vesper";

const themes = {
  ayu,
  catppuccin,
  cyberdream,
  dracula,
  everforest,
  github,
  gruvbox,
  horizon,
  kanagawa,
  monokai,
  night_owl,
  nord,
  one_dark,
  palenight,
  rose_pine,
  solarized,
  synthwave,
  tokyo_night,
  vesper,
};

/**
 * The base scheme is its own contract; variants may not step outside it.
 */
const schema = defineSchema(preset.use("light").theme);

describe("M3 theme variants", () => {
  it("ships every expected variant", () => {
    expect(Object.keys(themes).sort()).toEqual(
      [
        "ayu",
        "catppuccin",
        "cyberdream",
        "dracula",
        "everforest",
        "github",
        "gruvbox",
        "horizon",
        "kanagawa",
        "monokai",
        "night_owl",
        "nord",
        "one_dark",
        "palenight",
        "rose_pine",
        "solarized",
        "synthwave",
        "tokyo_night",
        "vesper",
      ].sort(),
    );
  });

  for (const [key, variant] of Object.entries(themes)) {
    describe(key, () => {
      it("carries an id matching its file name", () => {
        expect(variant.id).toBe(key);
      });

      it("resolves to a complete, contract-bound theme", () => {
        expect(schema.guard.theme(variant)).toBe(true);
      });
    });
  }
});
