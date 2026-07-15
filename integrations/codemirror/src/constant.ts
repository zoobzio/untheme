import type { Tag } from "@lezer/highlight";

import { tags as t } from "@lezer/highlight";

/**
 * Intrinsic typography for the tags whose meaning is a text style, not a color.
 * Applied alongside a mapped color, and on their own when the tag is unmapped.
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
 * The highlight roles this integration ships — `@lezer/highlight`'s tag
 * vocabulary, keyed by Lezer's own names. That's CodeMirror's domain standard
 * for what a highlighter distinguishes, so we adopt it rather than invent. A
 * consumer's map binds each name to a token; anything here it omits is reached
 * through `options.tags` with a raw Lezer `Tag`.
 *
 * A few entries are modifier combinations Lezer expresses as functions rather
 * than plain tags — `function` is a name in function position, `definition` a
 * name being defined — surfaced here under a plain name.
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
