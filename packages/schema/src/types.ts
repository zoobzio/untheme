export type SchemaTokens<
  Ref extends string,
  Sys extends string,
  Role extends string,
> = {
  ref: Ref[];
  sys: Sys[];
  role: Role[];
};
