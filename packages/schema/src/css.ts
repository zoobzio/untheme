import * as z from "zod";
import { lexer } from "css-tree";
import { CSS_VALUE_SYNTAX } from "./constant";

/** Checks a string against a css-tree syntax, treating thrown/unmatched as invalid. */
const matches = (syntax: string, value: string): boolean => {
  try {
    return lexer.match(syntax, value).error === null;
  } catch {
    return false;
  }
};

/**
 * A zod schema validating a string against a single CSS type via css-tree,
 * e.g. `cssType("color")` accepts `#0090ff` and `rgb(0 144 255)` but not `#ggg`.
 *
 * Use to tighten specific reference tokens beyond the default {@link cssValue},
 * which accepts any common CSS value type.
 *
 * @param type - A css-tree type name without angle brackets (e.g. `color`, `length`).
 */
export const cssType = (type: string) =>
  z.string().refine((v) => matches(`<${type}>`, v), {
    message: `Expected a valid CSS <${type}> value`,
  });

/** A raw CSS value held by a reference token — any common CSS value type. */
export const cssValue = z.string().refine((v) => matches(CSS_VALUE_SYNTAX, v), {
  message: "Expected a valid CSS value",
});
