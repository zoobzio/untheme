import { defineUnthemeConfig } from "@untheme/nuxt/config";

import blue from "@untheme/radix-ui/themes/blue";
import crimson from "@untheme/radix-ui/themes/crimson";
import cyan from "@untheme/radix-ui/themes/cyan";
import grass from "@untheme/radix-ui/themes/grass";
import orange from "@untheme/radix-ui/themes/orange";
import teal from "@untheme/radix-ui/themes/teal";

export default defineUnthemeConfig({
  base: blue,
  themes: { blue, crimson, cyan, grass, orange, teal },
  input: { color: "light" },
});
