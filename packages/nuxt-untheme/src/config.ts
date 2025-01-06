import type { UnthemeColorMode, UnthemeConfig } from "untheme";

export function defineUnthemeNuxtConfig<
  RefT extends string,
  SysT extends string,
  Theme extends string,
  ModeT extends string,
  RoleT extends string,
  M extends UnthemeColorMode,
  T extends NoInfer<Theme>,
  W extends NoInfer<RefT | SysT | ModeT | RoleT>[],
>(
  config: UnthemeConfig<RefT, SysT, Theme, ModeT, RoleT>,
  defaults?: {
    mode?: M;
    theme?: T;
    whitelist?: W;
  },
) {
  return {
    config,
    ...defaults,
  };
}
