import type { M3Theme } from "./types";

import ayu from "./data/ayu";
import catppuccin from "./data/catppuccin";
import cyberdream from "./data/cyberdream";
import dracula from "./data/dracula";
import everforest from "./data/everforest";
import github from "./data/github";
import gruvbox from "./data/gruvbox";
import horizon from "./data/horizon";
import kanagawa from "./data/kanagawa";
import monokai from "./data/monokai";
import night_owl from "./data/night_owl";
import nord from "./data/nord";
import one_dark from "./data/one_dark";
import palenight from "./data/palenight";
import rose_pine from "./data/rose_pine";
import solarized from "./data/solarized";
import synthwave from "./data/synthwave";
import tokyo_night from "./data/tokyo_night";
import vesper from "./data/vesper";

export * from "./types";

/** The collection of built-in M3 theme variants, keyed by theme key. */
export default {
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
} satisfies { [theme: string]: M3Theme };
