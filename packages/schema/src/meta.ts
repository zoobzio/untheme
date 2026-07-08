import { defineEnum } from "./enum";
import { defineRules } from "./rules";
import { defineShape } from "./shape";
import type { Meta, Template } from "./types";

/**
 * Derives the {@link Meta} for a template in three stages: the enum sets are
 * read off the template's tokens and modifiers, the shape rules draw their
 * reference checks from those sets, and the kind rules compose both.
 *
 * @param base - The template whose keys define the contract.
 */
export const defineMeta = <T extends Template>(base: T): Meta<T> => {
  const enums = defineEnum(base);
  const shape = defineShape(enums);
  const rules = defineRules(enums, shape);
  return {
    enums,
    shape,
    rules,
  };
};
