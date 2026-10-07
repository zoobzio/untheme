import type { Extension } from "@codemirror/state";
import type { Schema, Template, Token } from "untheme";
import type { CodeMirrorOptions, TagMap } from "./types";

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

import { highlightRules, editorTheme } from "./util";
import { SyntaxMappingError } from "./error";

/**
 * Makes a CodeMirror theme from a map of Lezer tag names to tokens. The
 * function returns an array of two extensions. One extension is a
 * `syntaxHighlighting` extension for the tags. The other extension is an
 * `EditorView.theme` for the editor chrome. Each color is a `var()` reference
 * to a token. The editor changes color when a modifier context or theme layer
 * rebinds those tokens.
 *
 * `schema` is `untheme.schema`. The function checks that each token in `map`,
 * in the chrome options, and in `options.tags` exists in the contract and has
 * the type `color`. The function throws a {@link SyntaxMappingError} that
 * lists each invalid binding. A tag with no mapped token renders in the editor
 * foreground color. `options` sets the chrome tokens and adds rules for raw
 * Lezer tags.
 *
 * Add the returned extensions to the `extensions` array of an editor.
 */
export const defineCodeMirrorTheme = <T extends Template>(
  schema: Schema<T>,
  map: TagMap<T>,
  options: CodeMirrorOptions<T> = {},
): Extension[] => {
  const problems: string[] = [];

  const check = (label: string, token: Token<T>): void => {
    const slot = schema.base.tokens[token];
    if (!schema.check.token(token) || slot === undefined) {
      problems.push(`${label} → "${token}" names no token in the contract`);
      return;
    }

    if (slot.$type !== "color") {
      problems.push(
        `${label} → "${token}" is a ${slot.$type} token, not a color`,
      );
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
