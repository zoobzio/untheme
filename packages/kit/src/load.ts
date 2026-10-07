import { existsSync } from "node:fs";

import { createJiti } from "jiti";
import { record } from "objectively";

import type { KitConfig } from "./types";
import { MalformedConfigError, MissingConfigError } from "./error";

/**
 * Whether a value is a plain record with a `source` that is a string or a URL.
 * {@link validate} checks the other members.
 */
const isConfig = (value: unknown): value is KitConfig => {
  if (!record(value)) {
    return false;
  }
  return typeof value.source === "string" || value.source instanceof URL;
};

/**
 * Loads a config file through jiti and returns its default export. The file can
 * be TypeScript or JavaScript. The function checks the outer shape of the
 * export. {@link resolveKit} validates the rest. An error that the file throws
 * while it runs reaches the caller.
 *
 * @param path - The absolute path to the config file.
 * @throws MissingConfigError when no file exists at `path`.
 * @throws MalformedConfigError when the default export is not a config.
 */
export const loadConfig = async (path: string): Promise<KitConfig> => {
  if (!existsSync(path)) {
    throw new MissingConfigError(path);
  }
  const jiti = createJiti(import.meta.url, { moduleCache: false });
  const config = await jiti.import<unknown>(path, { default: true });
  if (!isConfig(config)) {
    throw new MalformedConfigError(path);
  }
  return config;
};
