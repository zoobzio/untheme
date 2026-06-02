import { defineEventHandler, getRouterParams } from "h3";
import { status, useHTTPCode } from "ltrl-http";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), ".untheme");

/**
 * Server handler that serves a theme's resolved JSON data by key.
 *
 * Reads from the `.untheme` directory at the project root.
 * Returns the theme JSON if found, or an appropriate HTTP error status.
 */
export default defineEventHandler((event) => {
  const { theme } = getRouterParams(event);
  if (!theme) {
    event.res.status = status.UNPROCESSABLE_ENTITY;
    event.res.statusText = useHTTPCode(status.UNPROCESSABLE_ENTITY);
    return;
  }

  const path = join(dir, `${theme}.json`);

  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (err: unknown) {
    const code =
      err instanceof Error && "code" in err && err.code === "ENOENT"
        ? status.NOT_FOUND
        : status.INTERNAL_SERVER_ERROR;
    event.res.status = code;
    event.res.statusText = useHTTPCode(code);
    return;
  }
});
