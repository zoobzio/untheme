import { Rule } from "@unocss/core";

const rules: Rule<{
  spacing: Record<string, string>;
}>[] = [
  [
    /^gap-(.*)$/,
    ([_, c], { theme }) => {
      if (c in theme.spacing) {
        return {
          gap: theme.spacing[c],
        };
      }
    },
  ],
  [
    /^px-(.*)$/,
    ([_, c], { theme }) => {
      if (c in theme.spacing) {
        return {
          padding: `0px ${theme.spacing[c]} 0px ${theme.spacing[c]}`,
        };
      }
    },
  ],
  [
    /^py-(.*)$/,
    ([_, c], { theme }) => {
      if (c in theme.spacing) {
        return {
          padding: `${theme.spacing[c]} 0px ${theme.spacing[c]} 0px`,
        };
      }
    },
  ],
  [
    /^pt-(.*)$/,
    ([_, c], { theme }) => {
      if (c in theme.spacing) {
        return {
          padding: `${theme.spacing[c]} 0px 0px 0px`,
        };
      }
    },
  ],
  [
    /^pb-(.*)$/,
    ([_, c], { theme }) => {
      if (c in theme.spacing) {
        return {
          padding: `0px 0px ${theme.spacing[c]} 0px`,
        };
      }
    },
  ],
];

export default rules;
