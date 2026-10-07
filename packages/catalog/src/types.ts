import type { Layer, Template } from "@untheme/schema";

/**
 * The metadata of one theme in a listing. An entry has an id and a name. An
 * entry has no payload. `get` returns the theme.
 */
export interface Entry {
  /**
   * The layer id. Pass it to `get` to retrieve the payload.
   */
  id: string;

  /**
   * The display name.
   */
  name: string;
}

/**
 * The ordering of a listing: one entry field and a direction.
 */
export interface Sort {
  /**
   * The entry field compared between entries.
   */
  field: "id" | "name";

  /**
   * The comparison direction.
   */
  direction: "asc" | "desc";
}

/**
 * A listing request as data. The request has a filter, an order, and a window.
 * All fields are JSON-serializable. Every catalog answers every field.
 */
export interface Query {
  /**
   * The text to search for. An entry matches when its name contains the text.
   * The match ignores case.
   */
  search?: string;

  /**
   * The ordering of the matches. The window applies after the ordering.
   */
  sort?: Sort;

  /**
   * The maximum number of entries in one page.
   */
  limit?: number;

  /**
   * The number of matches to skip before the page starts.
   */
  offset?: number;
}

/**
 * A query with all defaults filled. A catalog normalizes each query to a
 * listing. A provider receives a complete window and ordering. A client sends
 * its own defaults on the network.
 */
export interface Listing {
  /**
   * The text to search for. The field is absent when the listing has no filter.
   */
  search?: string;

  /**
   * The ordering of the matches. The window applies after the ordering.
   */
  sort: Sort;

  /**
   * The maximum number of entries in one page.
   */
  limit: number;

  /**
   * The number of matches to skip before the page starts.
   */
  offset: number;
}

/**
 * One page of a listing. The page has the entries in the requested window and
 * the numbers to page by. `total` counts all matches of the filters of the
 * query across all pages. `limit` and `offset` hold the window that the catalog
 * applied, including defaults.
 */
export interface Page {
  /**
   * The matching entries inside the window.
   */
  entries: Entry[];

  /**
   * How many entries match the query's filters across all pages.
   */
  total: number;

  /**
   * The window size of the page.
   */
  limit: number;

  /**
   * The window position of the page.
   */
  offset: number;
}

/**
 * A source of themes for an {@link Untheme} service. `list` discovers themes.
 * `get` retrieves a theme. A catalog holds no state. Each call resolves against
 * the source.
 *
 * {@link defineCatalog} and {@link defineClient} both return this shape. A
 * callback of a provider can call a client. An app can serve its own themes and
 * use a remote service through one interface.
 */
export interface Catalog<T extends Template> {
  /**
   * Returns the page of entries that a query selects. A page has entry metadata
   * and no payloads. A call with no query returns the first page with the
   * default window.
   */
  list: (query?: Query) => Promise<Page>;

  /**
   * Returns one layer by id. The function checks the layer against the
   * contract. The function resolves `undefined` on a miss. The function throws
   * when a payload exists and fails the contract.
   */
  get: (id: string) => Promise<Layer<T> | undefined>;
}

/**
 * The storage callbacks of a provider catalog. Bind them to the place where the
 * themes are, such as build-emitted JSON, a database, a key-value store, or
 * another catalog. Each callback returns raw data. The catalog checks each
 * result against its schema.
 */
export interface Provider {
  /**
   * Answers a listing. The callback receives the validated query with a
   * concrete window. The callback returns the result directly or in a promise.
   * The catalog checks the result as a {@link Page}.
   */
  list: (listing: Listing) => unknown;

  /**
   * Answers a retrieval. The callback returns the stored payload for the id,
   * directly or in a promise. `null` and `undefined` mean a miss. The catalog
   * checks the payload as a layer.
   */
  get: (id: string) => unknown;
}

/**
 * The transport config of a client catalog. It sets where to send requests and
 * what to send with them.
 */
export interface Client {
  /**
   * The URL that the routes extend. Use the mount point of the app or the
   * origin of a remote service.
   */
  base: string;

  /**
   * Headers sent with every request. Use them for authentication.
   */
  headers?: Record<string, string>;

  /**
   * The fetch implementation for requests. The default is the global `fetch`.
   * Use it to inject a fetch for server-side rendering, or a fetch with
   * credentials, retries, or caching.
   */
  fetch?: typeof globalThis.fetch;
}
