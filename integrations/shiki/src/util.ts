import type { Template, Token } from "untheme";
import { property } from "untheme/css";

import type { FontStyle } from "./types";

/**
 * Returns the font styles as the single space-separated string that Shiki
 * expects.
 */
export const style = (value: FontStyle | FontStyle[]): string => {
  if (Array.isArray(value)) {
    return value.join(" ");
  }

  return value;
};

/**
 * Returns a `var()` reference to the custom property of the token. The name of
 * the property is the name that the CSS renderer emits.
 */
export const reference = <T extends Template>(token: Token<T>): string => {
  return `var(${property(token)})`;
};
