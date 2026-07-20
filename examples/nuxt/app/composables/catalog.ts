import { defineClient } from "untheme/catalog";
import { MOUNT } from "@untheme/nuxt/constant";

/**
 * The catalog client over the endpoints the untheme module serves. Entries
 * feed the theme picker; payloads are fetched on demand when a theme is
 * applied — never bundled with the app. The client speaks native `fetch`
 * and reads responses itself, so the transport must hand over unconsumed
 * responses: during SSR that is the request event's in-process fetch, in
 * the browser the global one. The routes are public and read nothing from
 * the incoming request, so no request context needs forwarding.
 */
export const useCatalog = () => {
  const untheme = useUntheme();
  const event = useRequestEvent();

  const transport: typeof globalThis.fetch = (input, init) => {
    let url: string;
    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else {
      url = input.url;
    }
    if (event) {
      return event.fetch(url, init);
    }
    return globalThis.fetch(url, init);
  };

  return defineClient(untheme.schema, { base: MOUNT, fetch: transport });
};
