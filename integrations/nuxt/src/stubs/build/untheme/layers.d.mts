// Typecheck-only stub for the generated `#build/untheme/layers.mjs` virtual
// module, in the shape the module writes for the stub theme.
import type { Layer } from "untheme";
import type { Contract } from "./config.mjs";

export type LayerId = string;

export interface LayerEntry {
  readonly id: LayerId;
  readonly name: string;
  readonly description?: string;
}

export declare const layers: readonly LayerEntry[];

export declare const load: {
  readonly [id: string]: (() => Promise<Layer<Contract>>) | undefined;
};
