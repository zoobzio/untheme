// Type stub for the Nuxt `#imports` virtual module.
import type { EventHandler, EventHandlerRequest } from "h3";
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

export declare function useStorage(base?: string): {
  getItem<T = unknown>(key: string): Promise<T | null>;
};

/** The Nitro response cache, keyed by request path and query. */
export declare function defineCachedEventHandler<T>(
  handler: EventHandler<EventHandlerRequest, T>,
  options?: { name?: string; maxAge?: number; swr?: boolean },
): EventHandler<EventHandlerRequest, T>;

export declare function useHead(input: {
  htmlAttrs?: Record<string, unknown>;
  style?: ComputedRef<Array<{ key: string; innerHTML: string }>>;
}): void;
