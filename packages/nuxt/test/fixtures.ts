import { mockEvent } from "h3";
import type { ThemeTemplate, ThemeMode } from "untheme";
import type { AppTheme } from "../runtime/types";
import type {
  ReferenceToken,
  SystemToken,
  RoleToken,
  Theme,
} from "../stubs/build/types/untheme.d.ts";
import { ref } from "vue";

const themeData = {
  label: "Alpha",
  reference: {
    white: "#ffffff",
    black: "#000000",
    slate: "#64748b",
    blue: "#3b82f6",
    indigo: "#6366f1",
    red: "#ef4444",
    green: "#22c55e",
    amber: "#f59e0b",
  },
  modes: {
    light: {
      primary: "blue",
      secondary: "indigo",
      neutral: "slate",
      surface: "white",
      on_surface: "black",
      error: "red",
      success: "green",
      warning: "amber",
    },
    dark: {
      primary: "indigo",
      secondary: "blue",
      neutral: "slate",
      surface: "black",
      on_surface: "white",
      error: "red",
      success: "green",
      warning: "amber",
    },
  },
  roles: {
    "text-color": "on_surface",
    "text-muted": "neutral",
    "background-color": "surface",
    "border-color": "neutral",
    "link-color": "primary",
    "link-hover": "secondary",
    "button-bg": "primary",
    "button-text": "surface",
    "error-text": "error",
    "success-text": "success",
    "warning-text": "warning",
  },
} as const;

export const template: ThemeTemplate = themeData;
export const appTheme: AppTheme = themeData;

/** Theme list matching the stub's Theme union. */
export const themes: ReadonlyArray<{ key: Theme; label: string }> = [
  { key: "alpha", label: "Alpha" },
  { key: "bravo", label: "Bravo" },
];

/** Token arrays matching the stub's token types. */
export const tokens = {
  reference: [
    "white", "black", "slate", "blue", "indigo", "red", "green", "amber",
  ] as readonly ReferenceToken[],
  system: [
    "primary", "secondary", "neutral", "surface", "on_surface", "error", "success", "warning",
  ] as readonly SystemToken[],
  role: [
    "text-color", "text-muted", "background-color", "border-color", "link-color",
    "link-hover", "button-bg", "button-text", "error-text", "success-text", "warning-text",
  ] as readonly RoleToken[],
};

/** Creates a properly typed H3Event for handler tests. */
export const createEvent = () => mockEvent("/");


/** Module setup options fixture. */
export const moduleOptions = (overrides?: { default?: string; themes?: Record<string, ThemeTemplate> }) => ({
  default: overrides?.default ?? "alpha",
  themes: overrides?.themes ?? { alpha: template },
});

/** Creates the mutable refs that back the composable's store. */
export const createStoreRefs = () => ({
  key: ref<Theme>("alpha"),
  theme: ref<AppTheme>({ ...appTheme }),
  mode: ref<ThemeMode>("dark"),
  cookieKey: ref<Theme | null>(null),
  cookieMode: ref<ThemeMode | null>(null),
});

export type StoreRefs = ReturnType<typeof createStoreRefs>;
