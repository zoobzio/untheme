import { defu } from "defu";
import type { UserConfig } from "./types";

let _CONFIG: UserConfig;

export function useUnthemeConfig() {
  if (!_CONFIG) throw new Error("🎨 Untheme not initialized!");
  return _CONFIG;
}

export function setUnthemeConfig(config: Partial<UserConfig>) {
  _CONFIG = defu(config, _CONFIG);
  return useUnthemeConfig();
}

export function defineUnthemeConfig(config: UserConfig) {
  return setUnthemeConfig(config);
}