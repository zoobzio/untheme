import { manufactureReferenceTokenizer } from "./tokens/reference";
import { manufactureSystemTokenizer } from "./tokens/system";
import type { Untheme } from "./types";

export const defineUntheme: Untheme = (config, refTokens, sysTokens) => {
  const defineReferenceTokens =
    manufactureReferenceTokenizer<keyof typeof refTokens>();
  const defineSystemTokens = manufactureSystemTokenizer<
    keyof typeof sysTokens,
    keyof typeof refTokens
  >();

  const {
    getReferenceTokens,
    listReferenceTokens,
    resolveReferenceToken,
    editReferenceToken,
  } = defineReferenceTokens(refTokens);

  const { getSystemTokens, listSystemTokens, resolveSystemToken } =
    defineSystemTokens(sysTokens);

  return {
    getReferenceTokens,
    listReferenceTokens,
    resolveReferenceToken,
    editReferenceToken,
    getSystemTokens,
    listSystemTokens,
    resolveSystemToken,
  };
};
