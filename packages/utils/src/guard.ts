import type { Template } from "@untheme/schema";

import { object, record } from "objectively";

/**
 * Returns `true` when a value has the shape of a {@link Template}. A template
 * is a record with a string `id`, a string `name`, an object `tokens`, a
 * record `modifiers`, and an array `order`.
 */
export const isTemplate = (v: unknown): v is Template => {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    typeof v["id"] === "string" &&
    "name" in v &&
    typeof v["name"] === "string" &&
    "tokens" in v &&
    object(v["tokens"]) &&
    "modifiers" in v &&
    record(v["modifiers"]) &&
    "order" in v &&
    Array.isArray(v["order"])
  );
};
