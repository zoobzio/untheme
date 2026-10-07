import { makeUntheme } from "untheme";
import { useUnthemeConfig } from "untheme/config";
import { defineRenderer } from "untheme/css";
import { defineCodeMirrorTheme } from "@untheme/codemirror";
import { EditorView, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";

import config from "../untheme/config.mjs";
import type { Contract } from "../untheme/config.mjs";
import { CHROME, MAP } from "./theme";

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
 * The interchange and the chrome are in `theme.ts`. The tests check both
 * against a mock contract.
 */
const theme = defineCodeMirrorTheme(untheme.schema, MAP, CHROME);

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
