import type { Template } from "@untheme/schema";

import { isObject, isRecord } from "@untheme/common";

export const guard = (v: unknown): v is Template => {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    typeof v["id"] === "string" &&
    "name" in v &&
    typeof v["name"] === "string" &&
    "tokens" in v &&
    isObject(v["tokens"]) &&
    "modifiers" in v &&
    isRecord(v["modifiers"]) &&
    "order" in v &&
    Array.isArray(v["order"])
  );
};
