// Typecheck-only stub for the generated `#build/untheme.mjs` virtual module.
import type { Theme, Contract, Layer } from "untheme";
import type {
  ReferenceToken,
  SystemToken,
  RoleToken,
} from "#build/types/untheme.d.ts";

export declare const theme: Theme<
  Contract<ReferenceToken, SystemToken, RoleToken>
>;

export declare const themes: Record<
  string,
  Layer<Contract<ReferenceToken, SystemToken, RoleToken>>
>;
