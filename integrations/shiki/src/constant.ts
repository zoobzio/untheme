/**
 * The role vocabulary of this package. The array lists the LSP
 * `SemanticTokenTypes` of LSP 3.17. The scope rules in `BASIC_SCOPES` route
 * each TextMate scope to one of these roles. The `map` argument binds each
 * role to a token. A user adds other roles with their own scope rules, and the
 * `role` of a scope rule can be any string. `SemanticType` is the union of
 * these values.
 */
export const SEMANTIC_TYPES = [
  "namespace",
  "type",
  "class",
  "enum",
  "interface",
  "struct",
  "typeParameter",
  "parameter",
  "variable",
  "property",
  "enumMember",
  "event",
  "function",
  "method",
  "macro",
  "keyword",
  "modifier",
  "comment",
  "string",
  "number",
  "regexp",
  "operator",
  "decorator",
] as const;

/**
 * Maps the name of each semantic token that Shiki colors to a `SemanticType`.
 */
export const SEMANTIC = {
  customLiteral: "function",
  newOperator: "operator",
  numberLiteral: "number",
  stringLiteral: "string",
} as const satisfies { [key: string]: (typeof SEMANTIC_TYPES)[number] };
