import type { ShikiOptions, SyntaxMap } from "@untheme/shiki";
import type { Contract } from "../untheme/config.mjs";

/**
 * The interchange that the app owns. It binds each LSP semantic token type to
 * one carrier token of the theme. The shipped scopes route to these types.
 * Several types share a carrier. The `type` carrier serves `namespace` and
 * `class`, and the `function` carrier serves `method`. Roles that the map
 * omits render at `fg`.
 *
 * The map is declared `as const`, so each binding keeps its literal token
 * name. The tests check the map over a small mock contract that defines only
 * these carriers, without a build of the preset.
 */
export const MAP = {
  keyword: "syntax-keyword",
  modifier: "syntax-keyword",
  string: "syntax-string",
  regexp: "syntax-regex",
  comment: "syntax-comment",
  number: "syntax-number",
  function: "syntax-function",
  method: "syntax-function",
  macro: "syntax-builtin",
  decorator: "syntax-tag",
  type: "syntax-type",
  class: "syntax-type",
  enum: "syntax-type",
  interface: "syntax-type",
  struct: "syntax-type",
  typeParameter: "syntax-type",
  namespace: "syntax-type",
  parameter: "syntax-parameter",
  variable: "syntax-variable",
  enumMember: "syntax-variable",
  property: "syntax-property",
  operator: "syntax-operator",
} as const satisfies SyntaxMap<Contract>;

/**
 * The name and the block colors of the theme. `bg` styles the block behind
 * the code and `fg` styles the unclassified text. The whole block flips
 * between light and dark.
 */
export const OPTIONS = {
  name: "mantis-syntax",
  fg: "syntax-text",
  bg: "surface-container",
} as const satisfies ShikiOptions<Contract>;
