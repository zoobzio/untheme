import type {
  Alias,
  Mode,
  Reference,
  Role,
  System,
  Template,
  Value,
} from "@untheme/schema";

/**
 * A contract extension for `extend`: it may override base tokens or introduce
 * new ones, and its new system and role tokens may alias the extension's own
 * tokens as well as the base's. Identity is optional — when present it wins
 * over the base's.
 */
export type Extension<
  Ref extends string,
  Sys extends string,
  Rol extends string,
  XRef extends string,
  XSys extends string,
  XRol extends string,
> = {
  id?: string;
  name?: string;
  reference: {
    [K in XRef]: Value;
  } & {
    [K in Ref]?: Value;
  };
  system: {
    [M in Mode]: {
      [K in XSys]: NoInfer<Ref> | NoInfer<XRef>;
    } & {
      [K in Sys]?: NoInfer<Ref> | NoInfer<XRef>;
    };
  };
  roles: {
    [K in XRol]: NoInfer<Ref> | NoInfer<Sys> | NoInfer<XRef> | NoInfer<XSys>;
  } & {
    [K in Rol]?: NoInfer<Ref> | NoInfer<Sys> | NoInfer<XRef> | NoInfer<XSys>;
  };
};

/**
 * The deviation between two themes, as produced by `diff`: a `Patch` whose
 * facets are always present (empty when nothing deviates), so consumers can
 * inspect them without guards.
 */
export type Diff<T extends Template> = {
  reference: {
    [K in Reference<T>]?: Value;
  };
  system: {
    [M in Mode]: {
      [K in System<T>]?: Reference<T>;
    };
  };
  roles: {
    [K in Role<T>]?: Alias<T>;
  };
};

/**
 * A partial overlay of a theme: any subset of identity and bindings. Both a
 * `Layer` (identity plus partial facets) and a `Patch` (anonymous overrides)
 * fit this shape, so one merge serves them all.
 */
export type Overlay<T extends Template> = {
  id?: string;
  name?: string;
  reference?: {
    [K in Reference<T>]?: Value;
  };
  system?: {
    [M in Mode]?: {
      [K in System<T>]?: Reference<T>;
    };
  };
  roles?: {
    [K in Role<T>]?: Alias<T>;
  };
};
