import type { Tag } from "@lezer/highlight";

import { tags as t } from "@lezer/highlight";

/**
 * The font style or font weight of the tags `emphasis`, `strong`, and
 * `heading`. A mapped tag gets the style and the color. The tags `emphasis`
 * and `strong` get the style when the map omits them.
 */
export const STYLE: Record<
  string,
  { fontStyle?: string; fontWeight?: string }
> = {
  emphasis: { fontStyle: "italic" },
  strong: { fontWeight: "bold" },
  heading: { fontWeight: "bold" },
};

/**
 * The highlight roles of this package. Each key is the name of a
 * `@lezer/highlight` tag, and each value is that tag. The `map` argument binds
 * each name to a token. The `options.tags` option adds rules for other Lezer
 * tags.
 *
 * `function` is `t.function(t.variableName)`. `definition` is
 * `t.definition(t.variableName)`.
 */
export const TAGS = {
  keyword: t.keyword,
  controlKeyword: t.controlKeyword,
  operatorKeyword: t.operatorKeyword,
  definitionKeyword: t.definitionKeyword,
  moduleKeyword: t.moduleKeyword,
  modifier: t.modifier,
  self: t.self,
  comment: t.comment,
  lineComment: t.lineComment,
  blockComment: t.blockComment,
  docComment: t.docComment,
  string: t.string,
  docString: t.docString,
  character: t.character,
  number: t.number,
  integer: t.integer,
  float: t.float,
  bool: t.bool,
  null: t.null,
  atom: t.atom,
  unit: t.unit,
  regexp: t.regexp,
  escape: t.escape,
  color: t.color,
  url: t.url,
  variableName: t.variableName,
  definition: t.definition(t.variableName),
  function: t.function(t.variableName),
  propertyName: t.propertyName,
  typeName: t.typeName,
  className: t.className,
  namespace: t.namespace,
  labelName: t.labelName,
  macroName: t.macroName,
  tagName: t.tagName,
  attributeName: t.attributeName,
  attributeValue: t.attributeValue,
  operator: t.operator,
  punctuation: t.punctuation,
  bracket: t.bracket,
  meta: t.meta,
  annotation: t.annotation,
  invalid: t.invalid,
  heading: t.heading,
  content: t.content,
  list: t.list,
  quote: t.quote,
  link: t.link,
  monospace: t.monospace,
  emphasis: t.emphasis,
  strong: t.strong,
  strikethrough: t.strikethrough,
  inserted: t.inserted,
  deleted: t.deleted,
  changed: t.changed,
} as const satisfies Record<string, Tag>;
