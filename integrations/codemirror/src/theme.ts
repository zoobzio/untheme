import type { Extension } from "@codemirror/state";
import type { Schema, Template, Token } from "untheme";
import type { CodeMirrorOptions, TagMap } from "./types";

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

import { highlightRules, editorTheme } from "./util";
import { SyntaxMappingError } from "./error";

/**
 * Builds a CodeMirror theme from a `tag → token` map: a `syntaxHighlighting`
 * extension over the tags, plus an `EditorView.theme` for the editor chrome.
 * Every color is the `var()` indirection to a token, so the editor re-themes
 * when a modifier context or theme layer rebinds those tokens — no reconfigure,
 * the same live-reference cascade the CSS renderer relies on.
 *
 * `schema` (`untheme.schema`) anchors the token type and re-proves the map at
 * call time: every bound token must exist and be a color, or a
 * {@link SyntaxMappingError} lists what's wrong. `map` is the interchange the
 * user owns — Lezer tag names bound to their tokens; an unmapped tag renders at
 * the editor foreground. `options` binds the chrome and adds raw-tag rules.
 *
 * Returns the extensions to drop into an editor's `extensions` array; the user
 * supplies the language support themselves.
 */
export const defineCodeMirrorTheme = <T extends Template>(
  schema: Schema<T>,
  map: TagMap<T>,
  options: CodeMirrorOptions<T> = {},
): Extension[] => {
  const problems: string[] = [];

  const check = (label: string, token: Token<T>): void => {
    if (!schema.check.token(token)) {
      problems.push(`${label} → "${token}" names no token in the contract`);
      return;
    }

    const type = schema.base.tokens[token].$type;
    if (type !== "color") {
      problems.push(`${label} → "${token}" is a ${type} token, not a color`);
    }
  };

  const chrome: [string, Token<T> | undefined][] = [
    ["background", options.background],
    ["foreground", options.foreground],
    ["caret", options.caret],
    ["selection", options.selection],
    ["gutterBackground", options.gutterBackground],
    ["gutterForeground", options.gutterForeground],
    ["activeLine", options.activeLine],
  ];

  for (const [name, token] of Object.entries(map)) {
    if (token !== undefined) {
      check(name, token);
    }
  }

  for (const [label, token] of chrome) {
    if (token !== undefined) {
      check(label, token);
    }
  }

  for (const rule of options.tags ?? []) {
    if (rule.token !== undefined) {
      check("tags[]", rule.token);
    }
  }

  if (problems.length > 0) {
    throw new SyntaxMappingError(problems);
  }

  const rules = highlightRules(map, options.tags);

  return [
    editorTheme(options),
    syntaxHighlighting(HighlightStyle.define(rules)),
  ];
};
