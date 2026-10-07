import type { Layer, Schema, Template } from "@untheme/schema";
import type { Catalog, Page, Provider, Query } from "./types";

import {
  MalformedLayerError,
  MalformedPageError,
  MalformedQueryError,
} from "./error";
import { isPage, isQuery, toListing } from "./util";

/**
 * Creates a {@link Catalog} from storage callbacks. {@link defineClient}
 * compiles its transport config into a {@link Provider} and calls this
 * function. `list` validates the query, normalizes it to a concrete listing,
 * passes it to the provider, and checks that the answer is a {@link Page}.
 * `get` passes the id to the provider and treats `null` and `undefined` as a
 * miss. `get` checks any other answer against the contract.
 *
 * @param schema - The contract that the layers must match.
 * @param provider - The callbacks that answer listings and retrievals.
 * @returns A {@link Catalog} that resolves through the callbacks.
 */
export const defineCatalog = <T extends Template>(
  schema: Schema<T>,
  provider: Provider,
): Catalog<T> => {
  /**
   * Returns the page of entries that a query selects. Throws {@link
   * MalformedQueryError} when the value is not a query. Throws {@link
   * MalformedPageError} when the answer of the provider is not a page.
   */
  const list = async (query: Query = {}): Promise<Page> => {
    if (!isQuery(query)) {
      throw new MalformedQueryError(query);
    }

    const value = await provider.list(toListing(query));
    if (!isPage(value)) {
      throw new MalformedPageError(value);
    }

    return value;
  };

  /**
   * Returns one layer by id. A `null` or `undefined` answer is a miss and
   * resolves `undefined`. The function checks any other answer against the
   * contract. When the check fails, the function throws {@link
   * MalformedLayerError} with the issues of the contract.
   */
  const get = async (id: string): Promise<Layer<T> | undefined> => {
    const value = await provider.get(id);
    if (value === null || value === undefined) {
      return undefined;
    }

    const result = schema.inspect.layer(value);
    if (!result.success) {
      throw new MalformedLayerError(id, result.issues);
    }

    return result.data;
  };

  return { list, get };
};
