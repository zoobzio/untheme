export type UnthemeUnoTemplate = "color" | "spacing";

export type UnthemeUnoOptions<
  Token extends string,
  Template extends UnthemeUnoTemplate | keyof typeof import("./rules"),
> = {
  prefix: string;
  tokens: {
    [T in Token]: string;
  };
  template: {
    [T in Template]: RegExp;
  };
};
