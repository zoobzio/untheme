// @ts-check
import { createConfigForNuxt } from "@nuxt/eslint-config/flat";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier/recommended";

export default createConfigForNuxt({
  features: {
    tooling: true,
  },
}).append(prettierConfig, prettierPlugin, {
  ignores: ["**/.dist", "**/.nuxt"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
  },
});
