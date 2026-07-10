import { describe, expect, it } from "vitest";

import { defineSchema } from "@untheme/schema";

import { preset } from "../src/preset";

import { RAMP_TOKENS, agrees } from "./fixture";

import abyss from "../src/themes/abyss";
import aurora from "../src/themes/aurora";
import ayu from "../src/themes/ayu";
import catppuccin from "../src/themes/catppuccin";
import cyberdream from "../src/themes/cyberdream";
import dracula from "../src/themes/dracula";
import dune from "../src/themes/dune";
import ember from "../src/themes/ember";
import everforest from "../src/themes/everforest";
import flexoki from "../src/themes/flexoki";
import github from "../src/themes/github";
import glacier from "../src/themes/glacier";
import graphite from "../src/themes/graphite";
import gruvbox from "../src/themes/gruvbox";
import horizon from "../src/themes/horizon";
import kanagawa from "../src/themes/kanagawa";
import manuscript from "../src/themes/manuscript";
import monokai from "../src/themes/monokai";
import moss from "../src/themes/moss";
import night_owl from "../src/themes/night_owl";
import nord from "../src/themes/nord";
import one_dark from "../src/themes/one_dark";
import oxocarbon from "../src/themes/oxocarbon";
import palenight from "../src/themes/palenight";
import phosphor from "../src/themes/phosphor";
import rose_pine from "../src/themes/rose_pine";
import sakura from "../src/themes/sakura";
import solarized from "../src/themes/solarized";
import synthwave from "../src/themes/synthwave";
import tokyo_night from "../src/themes/tokyo_night";
import vesper from "../src/themes/vesper";

const themes = {
  abyss,
  aurora,
  ayu,
  catppuccin,
  cyberdream,
  dracula,
  dune,
  ember,
  everforest,
  flexoki,
  github,
  glacier,
  graphite,
  gruvbox,
  horizon,
  kanagawa,
  manuscript,
  monokai,
  moss,
  night_owl,
  nord,
  one_dark,
  oxocarbon,
  palenight,
  phosphor,
  rose_pine,
  sakura,
  solarized,
  synthwave,
  tokyo_night,
  vesper,
};

const schema = defineSchema(
  preset.use({
    color: "light",
    contrast: "default",
    text: "md",
    density: "default",
    radius: "default",
    motion: "default",
  }).theme,
);

describe.each(Object.entries(themes))("theme %s", (id, theme) => {
  it("is a valid layer of the base contract", () => {
    expect(schema.check.layer(theme)).toBe(true);
  });

  it("is filed under its own id", () => {
    expect(theme.id).toBe(id);
  });

  it("rebinds exactly the tonal ramps", () => {
    expect(Object.keys(theme.tokens).sort()).toEqual([...RAMP_TOKENS].sort());
  });

  it("resolves against the base into a complete theme", () => {
    expect(schema.check.theme(preset.define(theme))).toBe(true);
  });

  it("pairs every ramp literal with an agreeing hex fallback", () => {
    for (const [token, value] of Object.entries(theme.tokens)) {
      expect.soft(agrees(value), token).toBe(true);
    }
  });
});
