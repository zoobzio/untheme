import { loadConfig } from "unconfig";
import { Untheme, type UnthemeConfig } from "./types";

export function defineUnthemeConfig<
  RefToken extends string,
  SysToken extends string,
  Theme extends string,
>(config: UnthemeConfig<RefToken, SysToken, Theme>) {
  return config;
}

export async function loadUntheme(path: string) {
  const { config } = await loadConfig<ReturnType<Untheme>>({
    sources: [
      {
        files: path,
        extensions: ["js", "ts", "json"],
      },
    ],
  });
  return config;
}
