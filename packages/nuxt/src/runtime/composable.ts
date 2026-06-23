import type { Mode, Patch, Token } from "untheme";
import type { ThemeKey } from "#build/types/untheme.d.ts";
import type { AppContract, AppThemeLayer } from "./types";

import { computed } from "vue";
import { useNuxtApp } from "#app";
import { useCookie } from "#imports";
import { themes as buildThemes } from "#build/untheme.mjs";

/**
 * Composable for the active theme, color mode, and switchable catalog.
 *
 * This is the instrumentation layer over the raw `$untheme` service: it exposes
 * reactive `mode`, `theme`, and `tokens`, and wraps every mutating action to
 * persist the selection to cookies and emit a Nuxt hook for observability.
 * Cookies carry only the selection — `mode` and the chosen theme `key` — never
 * arbitrary edits, so `set`/`update` report without persisting.
 */
export const useUntheme = () => {
  const nuxtApp = useNuxtApp();
  const service = nuxtApp.$untheme;

  const mode = computed(() => service.config.mode);
  const theme = computed(() => service.config.theme);
  const tokens = computed(() => service.tokens());

  const modeCookie = useCookie<Mode>("untheme-mode");
  const keyCookie = useCookie<ThemeKey>("untheme-key");

  const setMode = (next: Mode) => {
    service.config.mode = next;
    modeCookie.value = next;
    nuxtApp.callHook("untheme:mode", next);
  };

  const apply = (key: ThemeKey) => {
    const layer = buildThemes[key];
    if (!layer) {
      return;
    }
    service.apply(layer);
    keyCookie.value = key;
    nuxtApp.callHook("untheme:apply", service.config.theme);
  };

  const set = (token: Token<AppContract>, value: string) => {
    service.set(token, value);
    nuxtApp.callHook("untheme:set", token, value);
  };

  const update = (patch: Patch<AppContract>) => {
    service.update(patch);
    nuxtApp.callHook("untheme:update", patch);
  };

  const reset = () => {
    service.reset();
    nuxtApp.callHook("untheme:reset");
  };

  const create = (layer: AppThemeLayer) => {
    const built = service.create(layer);
    nuxtApp.callHook("untheme:create", built);
    return built;
  };

  const extract = (id: string, name: string) => {
    const built = service.extract(id, name);
    nuxtApp.callHook("untheme:extract", built);
    return built;
  };

  return {
    mode,
    theme,
    tokens,
    themes: buildThemes,
    setMode,
    apply,
    set,
    update,
    reset,
    create,
    extract,
    get: service.get,
    resolve: service.resolve,
  };
};
