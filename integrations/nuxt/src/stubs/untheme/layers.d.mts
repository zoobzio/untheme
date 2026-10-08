// Type stub for the `#untheme/layers.mjs` server template that the module writes.
import type { Entry } from "untheme/catalog";
import type { Layer, Template } from "untheme";

/** The id and the name of each layer, in the order of the build. */
export declare const entries: Entry[];

/** Each layer of the build, by id, as `apply` takes it. */
export declare const layers: Record<string, Layer<Template> | undefined>;
