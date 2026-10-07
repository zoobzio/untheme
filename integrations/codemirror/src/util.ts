import type { Template, Token } from "untheme";
import type { Extension } from "@codemirror/state";
import type { Tag } from "@lezer/highlight";
import type { CodeMirrorOptions, TagMap, TagRule, Rule } from "./types";

import { property } from "untheme/css";
import { entries } from "objectively";
import { EditorView } from "@codemirror/view";
import { STYLE, TAGS } from "./constant";

/**
 * Returns a `var()` reference to the custom property of the token. The name of
 * the property is the name that the CSS renderer emits.
 */
export const reference = <T extends Template>(token: Token<T>): string => {
  return `var(${property(token)})`;
};

/**
 * Makes the `HighlightStyle` rules for a map and for optional raw-tag rules.
 * Each mapped tag name becomes a rule with its Lezer tag and the `var()`
 * reference of its token. The function also adds a rule for `emphasis` and for
 * `strong` when the map omits them.
 */
export const highlightRules = <T extends Template>(
  map: TagMap<T>,
  extra: readonly TagRule<T>[] = [],
): Rule[] => {
  const registry = new Map<string, Tag>(entries(TAGS));
  const rules: Rule[] = [];
  const styled = new Set<string>();

  for (const [name, token] of entries(map)) {
    const tag = registry.get(name);
    if (token === undefined || tag === undefined) {
      continue;
    }

    rules.push({ tag, color: reference(token), ...STYLE[name] });
    styled.add(name);
  }

  for (const name of ["emphasis", "strong"]) {
    const tag = registry.get(name);
    if (tag !== undefined && !styled.has(name)) {
      rules.push({ tag, ...STYLE[name] });
    }
  }

  for (const rule of extra) {
    const style: Rule = { tag: rule.tag };
    if (rule.token !== undefined) {
      style.color = reference(rule.token);
    }
    if (rule.fontStyle) {
      style.fontStyle = rule.fontStyle;
    }
    if (rule.fontWeight) {
      style.fontWeight = rule.fontWeight;
    }
    if (rule.textDecoration) {
      style.textDecoration = rule.textDecoration;
    }
    rules.push(style);
  }

  return rules;
};

/**
 * Makes an `EditorView.theme` for the editor chrome. Each part of the editor
 * gets the color of its token. A part with no token keeps the CodeMirror
 * default.
 */
export const editorTheme = <T extends Template>(
  options: CodeMirrorOptions<T>,
): Extension => {
  const spec: Record<string, Record<string, string>> = {};

  const root: Record<string, string> = {};
  if (options.foreground !== undefined) {
    root.color = reference(options.foreground);
  }
  if (options.background !== undefined) {
    root.backgroundColor = reference(options.background);
  }
  if (Object.keys(root).length > 0) {
    spec["&"] = root;
  }

  if (options.caret !== undefined) {
    spec[".cm-cursor, .cm-dropCursor"] = {
      borderLeftColor: reference(options.caret),
    };
  }

  if (options.selection !== undefined) {
    spec[
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection"
    ] = { backgroundColor: reference(options.selection) };
  }

  const gutter: Record<string, string> = {};
  if (options.gutterBackground !== undefined) {
    gutter.backgroundColor = reference(options.gutterBackground);
  }
  if (options.gutterForeground !== undefined) {
    gutter.color = reference(options.gutterForeground);
  }
  if (Object.keys(gutter).length > 0) {
    spec[".cm-gutters"] = gutter;
  }

  if (options.activeLine !== undefined) {
    spec[".cm-activeLine"] = {
      backgroundColor: reference(options.activeLine),
    };
  }

  return EditorView.theme(spec, { dark: options.dark ?? true });
};
