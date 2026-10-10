import type { CodeMirrorOptions, TagMap } from "@untheme/codemirror";
import type { Contract } from "@untheme/example-theme/config";

/**
 * The interchange from Lezer tag names to the carrier tokens of the theme.
 * Several tags share one carrier.
 *
 * The map is declared `as const`, so each binding keeps its literal token
 * name. The tests check the map over a small mock contract that defines only
 * these carriers, without the theme package.
 */
export const MAP = {
  keyword: "syntax-keyword",
  controlKeyword: "syntax-keyword",
  definitionKeyword: "syntax-keyword",
  operatorKeyword: "syntax-keyword",
  moduleKeyword: "syntax-keyword",
  modifier: "syntax-keyword",
  self: "syntax-keyword",
  bool: "syntax-keyword",
  null: "syntax-keyword",
  comment: "syntax-comment",
  lineComment: "syntax-comment",
  blockComment: "syntax-comment",
  string: "syntax-string",
  character: "syntax-string",
  number: "syntax-number",
  regexp: "syntax-regex",
  escape: "syntax-regex-constant",
  variableName: "syntax-variable",
  definition: "syntax-variable",
  function: "syntax-function",
  propertyName: "syntax-property",
  typeName: "syntax-type",
  className: "syntax-type",
  namespace: "syntax-type",
  tagName: "syntax-tag",
  attributeName: "syntax-parameter",
  operator: "syntax-operator",
  punctuation: "syntax-punctuation",
  bracket: "syntax-punctuation",
} as const satisfies TagMap<Contract>;

/**
 * The editor chrome. Each surface of the editor UI is bound to a token, so
 * the chrome re-themes through the same cascade as the syntax.
 */
export const CHROME = {
  background: "surface-container-high",
  foreground: "syntax-text",
  caret: "syntax-text",
  selection: "outline-muted",
  gutterForeground: "syntax-comment",
} as const satisfies CodeMirrorOptions<Contract>;
