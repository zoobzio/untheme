import type { Theme } from "./types/untheme.d.ts";
import type { AppTheme } from "../../runtime/types";

export declare const key: Theme;
export declare const theme: AppTheme;
export declare const themes: ReadonlyArray<{ key: Theme; label: string }>;
export declare const tokens: {
  readonly reference: readonly string[];
  readonly system: readonly string[];
  readonly role: readonly string[];
};
