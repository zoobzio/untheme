import type { Tag } from "@lezer/highlight";
import type { Template, Token } from "untheme";

import type { TAGS } from "./constant";

/**
 * A highlight role in the shipped vocabulary: one `@lezer/highlight` tag name,
 * derived from {@link TAGS} so the value stays the single source of truth.
 */
export type TagName = keyof typeof TAGS;

/**
 * The interchange the user supplies: each tag name bound to a token in their
 * contract. Names autocomplete and are optional — an unmapped tag renders at
 * the editor foreground. Every value is a real `Token<T>`, checked against the
 * contract. Tags beyond the shipped set are reached through `options.tags`.
 */
export type TagMap<T extends Template> = Partial<Record<TagName, Token<T>>>;

/**
 * An extra highlight rule the shipped vocabulary doesn't name: a raw Lezer
 * `Tag` (or tags) bound to a token, plus optional style. The escape hatch for
 * anything CodeMirror distinguishes that {@link TAGS} leaves out.
 */
export type TagRule<T extends Template> = {
  tag: Tag | readonly Tag[];
  token?: Token<T>;
  fontStyle?: string;
  fontWeight?: string;
  textDecoration?: string;
};

export type Rule = {
  tag: Tag | readonly Tag[];
  color?: string;
  fontStyle?: string;
  fontWeight?: string;
  textDecoration?: string;
};

/**
 * Editor chrome and knobs. The chrome bindings — `background`, `foreground`,
 * `caret`, `selection`, `gutterBackground`, `gutterForeground`, `activeLine` —
 * each colour a piece of the editor UI from a token; omit one to leave that
 * surface transparent/inherited. `dark` flags the theme for CodeMirror's own
 * light/dark handling. `tags` adds raw-Lezer-tag rules on top of `map`.
 */
export type CodeMirrorOptions<T extends Template> = {
  dark?: boolean;
  background?: Token<T>;
  foreground?: Token<T>;
  caret?: Token<T>;
  selection?: Token<T>;
  gutterBackground?: Token<T>;
  gutterForeground?: Token<T>;
  activeLine?: Token<T>;
  tags?: TagRule<T>[];
};
