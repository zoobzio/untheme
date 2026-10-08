// Type stub for the Nuxt `#imports` virtual module.
import type { Ref, ComputedRef } from "vue";

export declare function useState<T>(key: string, init: () => T): Ref<T>;

export declare function useCookie<T>(key: string): Ref<T | null>;

/**
 * The fetch of the request. Its `raw` form answers the response as it is. The
 * runtime passes `ignoreResponseError` so a miss is a 404 response and not a
 * thrown error.
 */
export declare function useRequestFetch(): {
  raw(
    url: string,
    init?: { headers?: HeadersInit; ignoreResponseError?: boolean },
  ): Promise<Response>;
};

export declare function useRuntimeConfig(): {
  public: Record<string, unknown>;
};

export declare function useHead(input: {
  htmlAttrs?: Record<string, unknown>;
  style?: ComputedRef<Array<{ key: string; innerHTML: string }>>;
}): void;
