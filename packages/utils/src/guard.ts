import type { Template } from "@untheme/schema";

import { object, record } from "objectively";

/**
 * Whether a value has the structural shape of a {@link Template}: a record
 * carrying string `id` and `name`, indexable `tokens` and `modifiers`, and an
 * `order` array. A shape test only — whether the members satisfy any contract
 * is the schema's concern.
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
