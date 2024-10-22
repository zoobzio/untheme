// @ts-check
import eslint from "@eslint/js";
import tslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier/recommended";

export default tslint.config(
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  prettierConfig,
  prettierPlugin,
  {
    ignores: ["**/.dist", "**/.nuxt"],
  },
);
