export type Tokens = {
  readonly reference: readonly [
    "white",
    "black",
    "slate",
    "blue",
    "indigo",
    "red",
    "green",
    "amber",
  ];
  readonly system: readonly [
    "primary",
    "secondary",
    "neutral",
    "surface",
    "on_surface",
    "error",
    "success",
    "warning",
  ];
  readonly role: readonly [
    "text-color",
    "text-muted",
    "background-color",
    "border-color",
    "link-color",
    "link-hover",
    "button-bg",
    "button-text",
    "error-text",
    "success-text",
    "warning-text",
  ];
};

export type ReferenceToken = Tokens["reference"][number];
export type SystemToken = Tokens["system"][number];
export type RoleToken = Tokens["role"][number];
export type Token = ReferenceToken | SystemToken | RoleToken;

export type Theme = "alpha" | "bravo" | "charlie";
