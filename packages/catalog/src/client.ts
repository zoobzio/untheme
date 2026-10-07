import type { Schema, Template } from "@untheme/schema";
import type { Catalog, Client, Listing } from "./types";

import { ROUTE } from "./constant";
import { FailedRequestError } from "./error";
import { defineCatalog } from "./catalog";

/**
 * Creates a {@link Catalog} from transport config. Use it for a catalog that a
 * server provides, such as the mount point of the app server or a remote theme
 * service. The config compiles into a {@link Provider}, and the function calls
 * {@link defineCatalog} with it. A remote catalog has the same checks, miss
 * behavior, and failure behavior as a local catalog.
 *
 * @param schema - The contract that the layers must match.
 * @param client - The base URL, headers, and fetch implementation for requests.
 * @returns A {@link Catalog} that resolves over the network.
 */
export const defineClient = <T extends Template>(
  schema: Schema<T>,
  client: Client,
): Catalog<T> => {
  /**
   * The route URL of the catalog.
   */
  const root = `${client.base.replace(/\/+$/, "")}/${ROUTE}`;

  /**
   * Sends one GET request through the configured transport.
   */
  const request = async (url: string): Promise<Response> => {
    const init = {
      headers: { accept: "application/json", ...client.headers },
    };
    if (client.fetch) {
      return client.fetch(url, init);
    }
    return globalThis.fetch(url, init);
  };

  /**
   * Answers a listing from the network. Any failure status throws {@link
   * FailedRequestError}.
   */
  const list = async (listing: Listing): Promise<unknown> => {
    const url = `${root}?q=${encodeURIComponent(JSON.stringify(listing))}`;
    const response = await request(url);
    if (!response.ok) {
      throw new FailedRequestError(url, response.status);
    }
    const value: unknown = await response.json();
    return value;
  };

  /**
   * Answers a retrieval from the network. A 404 is a miss and returns
   * `undefined`. Any other failure status throws {@link FailedRequestError}.
   */
  const get = async (id: string): Promise<unknown> => {
    const url = `${root}/${encodeURIComponent(id)}`;
    const response = await request(url);
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      throw new FailedRequestError(url, response.status);
    }
    const value: unknown = await response.json();
    return value;
  };

  return defineCatalog<T>(schema, { get, list });
};
