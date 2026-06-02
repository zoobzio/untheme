/** The supported color modes for a theme. */
export type ColorMode = "light" | "dark";

/** A theme configuration mapping reference and system tokens. */
export type Config<Ref extends string, Sys extends string> = {
  /** A human-readable name for the config. */
  label: string;
  /** Reference tokens mapping token names to raw color values. */
  reference: { [K in Ref]: string };
  /** System tokens mapped to reference tokens for each color mode. */
  modes: {
    [M in ColorMode]: { [K in Sys]: Ref };
  };
};
