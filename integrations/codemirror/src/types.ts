import type { Tag } from "@lezer/highlight";
import type { Template, Token } from "untheme";

import type { TAGS } from "./constant";

/**
 * A highlight role in the shipped vocabulary. The type is one key of
 * {@link TAGS}.
 */
export type TagName = keyof typeof TAGS;

/**
 * A map from tag names to tokens in the contract. Each key is optional. A tag
 * with no mapped token renders in the editor foreground color.
 * `defineCodeMirrorTheme` checks each value against the contract.
 */
export type TagMap<T extends Template> = Partial<Record<TagName, Token<T>>>;

/**
 * A highlight rule for a raw Lezer `Tag` or an array of tags. The rule sets
 * an optional token and optional font and text styles. Use a rule for a tag
 * outside {@link TAGS}.
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
 * The options of `defineCodeMirrorTheme`. `background`, `foreground`, `caret`,
 * `selection`, `gutterBackground`, `gutterForeground`, and `activeLine` each
 * set the color of a part of the editor from a token. A part with no token
 * keeps the CodeMirror default. `dark` sets the CodeMirror dark mode flag. The
 * default is `true`. `tags` adds rules for raw Lezer tags.
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
