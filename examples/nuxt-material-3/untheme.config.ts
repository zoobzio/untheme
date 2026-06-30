import { defineUnthemeConfig } from "@untheme/nuxt/config";

import dracula from "@untheme/material-3/themes/dracula";
import nord from "@untheme/material-3/themes/nord";
import tokyoNight from "@untheme/material-3/themes/tokyo_night";
import catppuccin from "@untheme/material-3/themes/catppuccin";
import gruvbox from "@untheme/material-3/themes/gruvbox";
import rosePine from "@untheme/material-3/themes/rose_pine";

export default defineUnthemeConfig({
  base: dracula,
  themes: {
    dracula,
    nord,
    tokyo_night: tokyoNight,
    catppuccin,
    gruvbox,
    rose_pine: rosePine,
  },
  input: { color: "light" },
});
