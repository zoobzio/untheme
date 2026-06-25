import { defineUnthemeConfig } from "@untheme/nuxt/config";

import whiteG90 from "@untheme/carbon/themes/white-g90";
import g10G90 from "@untheme/carbon/themes/g10-g90";
import g10G100 from "@untheme/carbon/themes/g10-g100";

export default defineUnthemeConfig({
  base: whiteG90,
  themes: {
    "white-g90": whiteG90,
    "g10-g90": g10G90,
    "g10-g100": g10G100,
  },
});
