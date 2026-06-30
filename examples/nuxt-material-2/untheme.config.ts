import { defineUnthemeConfig } from "@untheme/nuxt/config";

import nord from "@untheme/material-2/themes/nord";
import dracula from "@untheme/material-2/themes/dracula";
import tokyoNight from "@untheme/material-2/themes/tokyo_night";
import solarized from "@untheme/material-2/themes/solarized";
import oneDark from "@untheme/material-2/themes/one_dark";
import monokai from "@untheme/material-2/themes/monokai";

export default defineUnthemeConfig({
  base: nord,
  themes: {
    nord,
    dracula,
    tokyo_night: tokyoNight,
    solarized,
    one_dark: oneDark,
    monokai,
  },
  input: { color: "light" },
});
