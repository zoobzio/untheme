import type { ColorMode, Theme } from "untheme";
import type { AppTheme } from "../src/runtime/types";
import type {
  ReferenceToken,
  SystemToken,
  RoleToken,
} from "../src/stubs/build/types/untheme";
import { ref } from "vue";

type Template = Theme<string, string, string>;

const themeData = {
  preset: "m3",
  key: "alpha",
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

const bravoData = {
  ...themeData,
  key: "bravo",
  label: "Bravo",
} as const;

export const template: Template = themeData;
export const appTheme: AppTheme = themeData;

export const themesMap: Record<string, AppTheme> = {
  alpha: themeData,
  bravo: bravoData,
};

/** Token arrays matching the stub's token types. */
export const tokens = {
  reference: [
    "white",
    "black",
    "slate",
    "blue",
    "indigo",
    "red",
    "green",
    "amber",
  ] as readonly ReferenceToken[],
  system: [
    "primary",
    "secondary",
    "neutral",
    "surface",
    "on_surface",
    "error",
    "success",
    "warning",
  ] as readonly SystemToken[],
  role: [
    "text-color",
    "text-muted",
    "background-color",
    "border-color",
    "link-color",
    "link-hover",
    "button-bg",
    "button-text",
    "error-text",
    "success-text",
    "warning-text",
  ] as readonly RoleToken[],
};

/** Creates the mutable refs that back the composable's store. */
export const createStoreRefs = () => ({
  key: ref<string>("alpha"),
  theme: ref<AppTheme>({ ...appTheme }),
  mode: ref<ColorMode>("dark"),
  themes: themesMap,
  cookieKey: ref<string | null>(null),
  cookieMode: ref<ColorMode | null>(null),
});

export type StoreRefs = ReturnType<typeof createStoreRefs>;
