import type { Template, Token } from "untheme";
import { property } from "untheme/css";

import type { FontStyle } from "./types";

/**
 * Shiki carries a scope's font styles as a single space-joined string.
 */
export const style = (value: FontStyle | FontStyle[]): string => {
  if (Array.isArray(value)) {
    return value.join(" ");
  }

  return value;
};

/**
 * A token's `var()` indirection, built from the same custom-property naming
 * the CSS renderer uses — so a scope colored here points at the exact property
 * the renderer emits.
 */
export const reference = <T extends Template>(token: Token<T>): string => {
  return `var(${property(token)})`;
};
