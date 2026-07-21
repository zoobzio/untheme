import type { AppContract, AppUntheme } from "./types";
import type { Renderer } from "untheme/css";

import { useNuxtApp } from "#app";

/**
 * Composable for the active theme, selection, and switchable catalog.
 *
 * This is the instrumentation layer over the raw `$untheme` service: every
 * read and write flows through the reactive `config` container, and the
 * mutating actions are wrapped to persist the selection to cookies and emit a
 * Nuxt hook for observability. Cookies carry only the selection — the active
 * `input` and the chosen theme `key` — never arbitrary edits, so `set` /
 * `update` report without persisting.
 */
export const useUntheme = (): AppUntheme => {
  const { $untheme } = useNuxtApp();
  return $untheme;
};

/**
 * Composable for the CSS renderer bound to the app's contract.
 *
 * The plugin builds one renderer over the same `$untheme` service and provides
 * it as `$unthemeRenderer`, so every read stays lazy and reactive: `root()` and
 * `variables()` re-render when the active selection, theme, or override changes.
 * Use it to name a token's custom property (`property` / `var`), read a token's
 * live value, or emit a static set with `root(set)` / `variables(set)` without
 * touching the live bindings.
 */
export const useUnthemeRenderer = (): Renderer<AppContract> => {
  const { $unthemeRenderer } = useNuxtApp();
  return $unthemeRenderer;
};
