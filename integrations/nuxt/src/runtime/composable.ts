import type { AppUntheme } from "./types";

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
