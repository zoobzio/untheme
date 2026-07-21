import { createError, defineEventHandler, getRouterParam } from "h3";
import { record } from "objectively";
import { useStorage } from "nitropack/runtime";

import { ASSETS, THEMES } from "@untheme/nuxt/constant";

/**
 * The catalog's retrieval route: answers with the stored layer for the id,
 * or 404 for a miss. Every payload was proven against the contract when the
 * module wrote it, so it is served as stored; a consuming client re-proves
 * on receipt.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id", { decode: true });
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Theme id required",
    });
  }

  const stored = await useStorage(`assets:${ASSETS}`).getItem(THEMES);
  if (!record(stored)) {
    throw createError({
      statusCode: 500,
      statusMessage: "Catalog payloads unavailable",
    });
  }

  const layer = stored[id];
  if (layer === undefined || layer === null) {
    throw createError({
      statusCode: 404,
      statusMessage: "Theme not found",
    });
  }

  return layer;
});
