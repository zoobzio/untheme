import { M2_STOPS } from "./constant";

/** Union of all M2 palette shade stops (50–900 and A100–A700). */
export type M2Shade = (typeof M2_STOPS)[number];
