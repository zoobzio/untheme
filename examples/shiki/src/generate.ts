import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { makeUntheme } from "untheme";
import { defineRenderer } from "untheme/css";
import { defineShikiTheme } from "@untheme/shiki";
import type { SyntaxMap } from "@untheme/shiki";
import { codeToHtml } from "shiki";

import { syntax } from "./preset";

/**
 * The widened aurora contract the configured preset carries.
 */
type Contract = ReturnType<typeof syntax.use>["theme"];

/**
 * The interchange the app owns: each LSP semantic token type (the standard
 * vocabulary the shipped scopes route to) bound to one of the preset's carrier
 * tokens. Many-to-one on purpose — this theme reuses the `type` carrier for
 * `namespace`/`class`/…, the `function` carrier for `method`, and so on,
 * surfacing only the distinctions it wants. Roles left out render at `fg`.
 */
const MAP: SyntaxMap<Contract> = {
  keyword: "syntax-keyword",
  modifier: "syntax-keyword",
  string: "syntax-string",
  regexp: "syntax-regex",
  comment: "syntax-comment",
  number: "syntax-number",
  function: "syntax-function",
  method: "syntax-function",
  macro: "syntax-builtin",
  decorator: "syntax-tag",
  type: "syntax-type",
  class: "syntax-type",
  enum: "syntax-type",
  interface: "syntax-type",
  struct: "syntax-type",
  typeParameter: "syntax-type",
  namespace: "syntax-type",
  parameter: "syntax-parameter",
  variable: "syntax-variable",
  enumMember: "syntax-variable",
  property: "syntax-property",
  operator: "syntax-operator",
};

/**
 * A TypeScript snippet touching a spread of syntax roles — comment, keyword,
 * string and template, type, function, parameter, number, regex, operator.
 */
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

/*
 * Boot the widened preset at its default selection and render over it. The
 * renderer's var() output is what the Shiki theme wraps every scope around.
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
 * The Shiki theme: one static object, every scope a var() into the carrier
 * token its LSP role maps to. `bg` themes the block behind the code and `fg`
 * the unclassified text, so the whole block flips light↔dark too.
 */
const theme = defineShikiTheme(untheme.schema, MAP, {
  name: "aurora-syntax",
  fg: "syntax-text",
  bg: "surface-container",
});

const highlighted = await codeToHtml(SAMPLE, { lang: "ts", theme });

/*
 * The full cascade: aurora's ramps and roles under :root, plus the
 * [data-color="dark"] block that rebinds the syntax tokens. Dropped straight
 * into the page — flipping the attribute re-themes the code with no
 * re-highlight.
 */
const sheet = renderer.sheet();

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>@untheme/shiki example</title>
<style>
${sheet}
body { font-family: system-ui, sans-serif; margin: 0; }
.stage {
  min-height: 100vh;
  padding: 3rem;
  box-sizing: border-box;
  background: var(--surface);
  color: var(--on-surface);
}
button {
  font: inherit;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  border: 1px solid var(--outline);
  border-radius: 0.5rem;
  background: var(--surface-container);
  color: var(--on-surface);
  cursor: pointer;
}
pre.shiki {
  padding: 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  font-family: ui-monospace, monospace;
  line-height: 1.6;
}
</style>
</head>
<body>
<div class="stage" data-color="light" id="stage">
  <button id="toggle">Toggle light / dark</button>
  ${highlighted}
</div>
<script>
  const stage = document.getElementById("stage");
  document.getElementById("toggle").addEventListener("click", () => {
    const next = stage.dataset.color === "light" ? "dark" : "light";
    stage.dataset.color = next;
  });
</script>
</body>
</html>
`;

const out = join(import.meta.dirname, "..", ".dist");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), page);

const keyword = theme.settings?.find((s) => s.scope === "keyword");

console.log("Generated Shiki theme wires scopes to syntax tokens:");
console.log(`  scope "keyword" -> ${keyword?.settings.foreground}`);
console.log("");
console.log("...which the cascade resolves one more hop, per mode:");
console.log(`  light  --syntax-keyword: ${renderer.value("syntax-keyword")}`);
untheme.swap("color", "dark");
console.log(`  dark   --syntax-keyword: ${renderer.value("syntax-keyword")}`);
console.log("");
console.log(`Wrote ${join(out, "index.html")}`);
