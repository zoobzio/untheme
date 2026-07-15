import { makeUntheme } from "untheme";
import { defineRenderer } from "untheme/css";
import { defineCodeMirrorTheme } from "@untheme/codemirror";
import type { TagMap } from "@untheme/codemirror";
import { EditorView, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";

import { syntax } from "./preset";

/*
 * Boot the aurora preset widened with syntax carriers, at its default
 * selection. The renderer emits the whole cascade — ramps, roles, and the
 * syntax-* carriers — as custom properties.
 */
const untheme = makeUntheme(
  syntax.use({
    color: "light",
    vibrancy: "balanced",
    contrast: "default",
    text: "md",
    density: "default",
    radius: "default",
    depth: "default",
    motion: "default",
  }),
);

const renderer = defineRenderer(untheme);

/*
 * Drop the cascade into the page. `sheet()` gives `:root` plus the
 * `[data-color="dark"]` block; flipping the attribute on <html> re-resolves
 * every var() the editor's styles reference — no reconfigure.
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
 * The interchange: Lezer tag names → the preset's carrier tokens. Many-to-one,
 * surfacing only the distinctions this theme wants.
 */
type Contract = ReturnType<typeof syntax.use>["theme"];

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
import { defineUntheme } from "untheme";

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
