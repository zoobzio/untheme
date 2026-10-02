import { createAuroraThemeHandler } from "../../aurora";

/**
 * The theme catalog: all 31 aurora themes over the catalog wire protocol —
 * listings at `/api/untheme/themes`, layers at `/api/untheme/themes/:id`.
 * This file's folder is the base the catalog client points at.
 */
export default createAuroraThemeHandler();
