import { defineEnum } from "./enum";
import { defineRules } from "./rules";
import { defineShape } from "./shape";
import type { Meta, Template } from "./types";

/**
 * Derives the {@link Meta} for a template in three stages. First, the function
 * reads the enum sets from the tokens and modifiers of the template. Second,
 * the shape rules use the sets for their reference checks. Third, the kind
 * rules use the sets and the shape rules.
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
