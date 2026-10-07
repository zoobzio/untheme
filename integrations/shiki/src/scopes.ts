import type { ScopeRule } from "./types";

/**
 * The scope rules that route common TextMate scopes to LSP semantic token
 * types. `defineShikiTheme` always applies these rules, and `options.scopes`
 * adds rules after them. TextMate matches a scope by prefix, so a rule for
 * `keyword` also matches a scope such as `keyword.control.rust`.
 *
 * The rules cover only scopes that have an LSP semantic token type, and
 * markup scopes that set a font style. Other scopes render in the default
 * foreground color.
 */
export const BASIC_SCOPES: ScopeRule[] = [
  // Comments
  { scope: "comment", role: "comment" },

  // Keywords, control, language constants
  { scope: "keyword", role: "keyword" },
  { scope: "keyword.control", role: "keyword" },
  { scope: "keyword.other", role: "keyword" },
  { scope: "constant.language", role: "keyword" },
  { scope: "storage", role: "keyword" },
  { scope: "storage.type", role: "keyword" },
  { scope: "variable.language", role: "keyword" },
  { scope: "keyword.operator", role: "operator" },

  // Modifiers
  { scope: "storage.modifier", role: "modifier" },

  // Numbers
  { scope: "constant.numeric", role: "number" },

  // Strings and regex
  { scope: ["string", "string.quoted", "string.unquoted"], role: "string" },
  { scope: ["string.regexp", "constant.regexp"], role: "regexp" },

  // Functions, methods, macros, decorators
  {
    scope: ["entity.name.function", "support.function", "meta.function-call"],
    role: "function",
  },
  {
    scope: ["entity.name.function.method", "meta.method-call"],
    role: "method",
  },
  {
    scope: ["entity.name.function.macro", "meta.preprocessor"],
    role: "macro",
  },
  {
    scope: [
      "entity.name.function.decorator",
      "meta.decorator",
      "meta.annotation",
      "storage.type.annotation",
    ],
    role: "decorator",
  },

  // Types, namespaces, type parameters
  {
    scope: [
      "entity.name.type",
      "support.type",
      "support.class",
      "entity.other.inherited-class",
    ],
    role: "type",
  },
  // Primitive type names, such as `int` in C and Go
  {
    scope: [
      "storage.type.built-in",
      "storage.type.primitive",
      "storage.type.numeric",
    ],
    role: "type",
  },
  { scope: ["entity.name.type.class", "entity.name.class"], role: "class" },
  { scope: "entity.name.type.enum", role: "enum" },
  { scope: "entity.name.type.interface", role: "interface" },
  { scope: "entity.name.type.struct", role: "struct" },
  {
    scope: ["entity.name.namespace", "entity.name.type.namespace"],
    role: "namespace",
  },
  {
    scope: ["entity.name.type.parameter", "entity.name.type.lifetime"],
    role: "typeParameter",
  },

  // Variables, parameters, properties, members
  { scope: ["variable", "variable.other"], role: "variable" },
  { scope: "variable.parameter", role: "parameter" },
  {
    scope: [
      "variable.other.property",
      "variable.other.member",
      "support.variable.property",
      "meta.object-literal.key",
    ],
    role: "property",
  },
  {
    scope: ["variable.other.enummember", "constant.other.enum"],
    role: "enumMember",
  },

  // Markup elements and attributes (HTML/JSX/XML)
  { scope: "entity.name.tag", role: "keyword" },
  { scope: "entity.other.attribute-name", role: "property" },

  // Font styles
  { scope: ["markup.italic", "emphasis"], fontStyle: "italic" },
  { scope: ["markup.bold", "strong"], fontStyle: "bold" },
  { scope: "markup.underline", fontStyle: "underline" },
  { scope: "markup.strikethrough", fontStyle: "strikethrough" },
];
