import type {
  ReferenceToken,
  SystemToken,
  RoleToken,
} from "#build/types/untheme.d.ts";
import { createUnthemeSchema } from "@untheme/schema";
import { ref, sys, role } from "#build/untheme.mjs";

export const schema = createUnthemeSchema<
  ReferenceToken,
  SystemToken,
  RoleToken
>({
  ref: ref as ReferenceToken[],
  sys: sys as SystemToken[],
  role: role as RoleToken[],
});
