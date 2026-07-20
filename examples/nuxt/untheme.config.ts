import { defineUnthemeConfig } from "@untheme/nuxt/config";

import { preset } from "@untheme/aurora";

import abyss from "@untheme/aurora/themes/abyss";
import aurora from "@untheme/aurora/themes/aurora";
import ayu from "@untheme/aurora/themes/ayu";
import catppuccin from "@untheme/aurora/themes/catppuccin";
import cyberdream from "@untheme/aurora/themes/cyberdream";
import dracula from "@untheme/aurora/themes/dracula";
import dune from "@untheme/aurora/themes/dune";
import ember from "@untheme/aurora/themes/ember";
import everforest from "@untheme/aurora/themes/everforest";
import flexoki from "@untheme/aurora/themes/flexoki";
import github from "@untheme/aurora/themes/github";
import glacier from "@untheme/aurora/themes/glacier";
import graphite from "@untheme/aurora/themes/graphite";
import gruvbox from "@untheme/aurora/themes/gruvbox";
import horizon from "@untheme/aurora/themes/horizon";
import kanagawa from "@untheme/aurora/themes/kanagawa";
import manuscript from "@untheme/aurora/themes/manuscript";
import monokai from "@untheme/aurora/themes/monokai";
import moss from "@untheme/aurora/themes/moss";
import night_owl from "@untheme/aurora/themes/night_owl";
import nord from "@untheme/aurora/themes/nord";
import one_dark from "@untheme/aurora/themes/one_dark";
import oxocarbon from "@untheme/aurora/themes/oxocarbon";
import palenight from "@untheme/aurora/themes/palenight";
import phosphor from "@untheme/aurora/themes/phosphor";
import rose_pine from "@untheme/aurora/themes/rose_pine";
import sakura from "@untheme/aurora/themes/sakura";
import solarized from "@untheme/aurora/themes/solarized";
import synthwave from "@untheme/aurora/themes/synthwave";
import tokyo_night from "@untheme/aurora/themes/tokyo_night";
import vesper from "@untheme/aurora/themes/vesper";

/**
 * The app's untheme configuration: the aurora base theme, the default
 * selection — one context per modifier axis — and the variant catalog. The
 * catalog seeds the module's server catalog: served over the wire and
 * fetched on demand, never bundled with the app.
 */
export default defineUnthemeConfig({
  theme: preset.define({ id: "aurora", name: "Aurora" }),
  themes: {
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
  },
  input: {
    color: "light",
    vibrancy: "balanced",
    contrast: "default",
    text: "md",
    density: "default",
    radius: "default",
    depth: "default",
    motion: "default",
  },
});
