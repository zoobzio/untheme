// Typecheck-only stub for the generated `#build/untheme.mjs` virtual module.
import type { AppTheme } from "../../runtime/types.js";

import { ColorMode } from "untheme";

export declare const theme: AppTheme;

export declare const extend: {
  reference?: {
    [K in keyof AppTheme["reference"]]?: string;
  };
  modes?: {
    [M in ColorMode]?: {
      [K in keyof AppTheme["modes"][ColorMode]]?: keyof AppTheme["reference"];
    };
  };
  roles: {
    [K in keyof AppTheme["roles"]]:
      | keyof AppTheme["reference"]
      | keyof AppTheme["modes"][ColorMode];
  };
};

export declare const options: { key: string; label: string }[];

export declare const ref: string[];
export declare const sys: string[];
export declare const role: string[];
