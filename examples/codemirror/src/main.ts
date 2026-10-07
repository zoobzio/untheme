import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineRenderer } from "untheme/css";
import { defineCodeMirrorTheme } from "@untheme/codemirror";
import type { TagMap } from "@untheme/codemirror";
import { EditorView, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";

import config from "../untheme/config.mjs";
import type { Contract } from "../untheme/config.mjs";

/*
 * Boots the theme that `untheme build` wrote to `untheme/`, at its default
 * selection. The theme is aurora with the syntax carriers. The renderer emits
 * the whole cascade as custom properties: ramps, roles, and the syntax-*
 * carriers.
 */
const untheme = makeUntheme<Contract>(useUnthemeConfig(config));

const renderer = defineRenderer(untheme);

/*
 * Adds the cascade to the page. `sheet()` returns the `:root` block and the
 * `[data-color="dark"]` block. A change to the attribute on <html> re-resolves
 * every var() in the styles of the editor.
 */
const style = document.createElement("style");
style.textContent = `
${renderer.sheet()}
body { margin: 0; font-family: system-ui, sans-serif; }
.stage { min-height: 100vh; padding: 2rem; box-sizing: border-box;
  background: var(--surface-container); color: var(--on-surface); }
button { font: inherit; padding: 0.5rem 1rem; margin-bottom: 1.5rem;
  border: 1px solid var(--outline-muted); border-radius: 0.5rem;
  background: var(--surface-container-high); color: var(--on-surface); cursor: pointer; }
#editor { max-width: 60rem; border: 1px solid var(--outline-muted); border-radius: 0.5rem;
  overflow: hidden; }
.cm-editor { font-family: ui-monospace, monospace; font-size: 14px; }
.cm-scroller { line-height: 1.6; }
`;
document.head.appendChild(style);

/*
 * The interchange from Lezer tag names to the carrier tokens of the theme.
 * Several tags share one carrier.
 */
const MAP: TagMap<Contract> = {
  keyword: "syntax-keyword",
  controlKeyword: "syntax-keyword",
  definitionKeyword: "syntax-keyword",
  operatorKeyword: "syntax-keyword",
  moduleKeyword: "syntax-keyword",
  modifier: "syntax-keyword",
  self: "syntax-keyword",
  bool: "syntax-keyword",
  null: "syntax-keyword",
  comment: "syntax-comment",
  lineComment: "syntax-comment",
  blockComment: "syntax-comment",
  string: "syntax-string",
  character: "syntax-string",
  number: "syntax-number",
  regexp: "syntax-regex",
  escape: "syntax-regex-constant",
  variableName: "syntax-variable",
  definition: "syntax-variable",
  function: "syntax-function",
  propertyName: "syntax-property",
  typeName: "syntax-type",
  className: "syntax-type",
  namespace: "syntax-type",
  tagName: "syntax-tag",
  attributeName: "syntax-parameter",
  operator: "syntax-operator",
  punctuation: "syntax-punctuation",
  bracket: "syntax-punctuation",
};

const theme = defineCodeMirrorTheme(untheme.schema, MAP, {
  background: "surface-container-high",
  foreground: "syntax-text",
  caret: "syntax-text",
  selection: "outline-muted",
  gutterForeground: "syntax-comment",
});

const SAMPLE = `// A themed greeter
import { makeUntheme } from "untheme";

type Mode = "light" | "dark";

export function greet(name: string, mode: Mode = "light"): number {
  const shout = \`Hello, \${name.toUpperCase()}!\`;
  const digits = /\\d+/.test(name) ? 42 : 0;
  console.log(shout, mode);
  return digits;
}
`;

new EditorView({
  parent: document.getElementById("editor")!,
  state: EditorState.create({
    doc: SAMPLE,
    extensions: [lineNumbers(), javascript({ typescript: true }), ...theme],
  }),
});

document.getElementById("toggle")!.addEventListener("click", () => {
  const root = document.documentElement;
  root.dataset.color = root.dataset.color === "light" ? "dark" : "light";
});
