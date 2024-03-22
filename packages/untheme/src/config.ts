import { loadConfig } from "unconfig";
import { Config, UnthemeConfig } from "./types";

export function defineUnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
>(config: UnthemeConfig<RefToken, SysToken, Theme>) {
  return config;
}

export const inferUnthemeConfig: Config = (config) => config 

export async function loadUnthemeConfig(path: string) {
  const { config } = await loadConfig({
    sources: [
      {
        files: path,
        extensions: ["js", "ts", "json"],
      },
    ],
  });
  return inferUnthemeConfig(config);
}
