import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { makeUntheme } from "untheme";
import { defineRenderer } from "untheme/css";
import { defineShikiTheme } from "@untheme/shiki";
import { codeToHtml } from "shiki";

import config from "@untheme/example-theme/config";
import type { Contract } from "@untheme/example-theme/config";
import { MAP, OPTIONS } from "./theme";

/**
 * A TypeScript snippet with many syntax roles: comment, keyword, string,
 * template, type, function, parameter, number, regex, and operator.
 */
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

/*
 * Boots the theme from the installed package at its default selection and
 * renders over it. The Shiki theme wraps every scope around the var() output
 * of the renderer.
 */
const untheme = makeUntheme<Contract>(config.theme, {
  patch: {},
  input: config.input,
});

const renderer = defineRenderer(untheme);

/*
 * The Shiki theme, one static object. Each scope is a var() of the carrier
 * token for its LSP role. `bg` styles the block behind the code and `fg`
 * styles the unclassified text. The whole block flips between light and dark.
 */
const theme = defineShikiTheme(untheme.schema, MAP, OPTIONS);

const highlighted = await codeToHtml(SAMPLE, { lang: "ts", theme });

/*
 * The full cascade: the ramps and roles of the preset under :root, and the
 * [data-color="dark"] block that rebinds the syntax tokens. A change to the
 * data-color attribute re-themes the code.
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
