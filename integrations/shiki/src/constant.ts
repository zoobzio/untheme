/**
 * The semantic token types this integration ships as its role vocabulary — the
 * LSP `SemanticTokenTypes` enumeration verbatim (LSP 3.17). The scope packs we
 * export route every TextMate scope to one of these, and a consumer's map binds
 * each to a token. Adopting the standard keeps the vocabulary derived rather
 * than invented; a user reaches anything the standard omits (punctuation,
 * markup, …) through their own scope rules, whose `role` is open.
 *
 * The value is the single source of truth — `SemanticType` is derived from it —
 * so this module holds no types and depends on nothing.
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
 * The semantic-token roles Shiki colors when a grammar emits semantic tokens,
 * keyed by Shiki's semantic token name. Values are `SemanticType`s.
 */
export const SEMANTIC = {
  customLiteral: "function",
  newOperator: "operator",
  numberLiteral: "number",
  stringLiteral: "string",
} as const satisfies { [key: string]: (typeof SEMANTIC_TYPES)[number] };
