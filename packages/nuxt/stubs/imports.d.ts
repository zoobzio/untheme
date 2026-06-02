import type { Ref, ComputedRef } from "vue";

export declare function useState<T>(
  key: string,
  init: () => T,
): Ref<T>;

export declare function useCookie<T>(
  key: string,
): Ref<T | null>;

export declare function useRequestFetch(): <T = unknown>(
  url: string,
) => Promise<T>;

export declare function useHead(input: {
  htmlAttrs?: Record<string, unknown>;
  style?: ComputedRef<Array<{ key: string; innerHTML: string }>>;
}): void;
