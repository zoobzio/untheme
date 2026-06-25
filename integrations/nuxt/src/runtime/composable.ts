import type { AppUntheme } from "./types";

import { useNuxtApp } from "#app";

/**
 * Composable for the active theme, color mode, and switchable catalog.
 *
 * This is the instrumentation layer over the raw `$untheme` service: it exposes
 * reactive `mode`, `theme`, and `tokens`, and wraps every mutating action to
 * persist the selection to cookies and emit a Nuxt hook for observability.
 * Cookies carry only the selection — `mode` and the chosen theme `key` — never
 * arbitrary edits, so `set`/`update` report without persisting.
 */
export const useUntheme = (): AppUntheme => {
  const { $untheme } = useNuxtApp();
  return $untheme;
};
