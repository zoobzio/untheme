# @untheme/catalog

Lists and retrieves themes from a local or remote source.

## Install

```sh
pnpm add @untheme/catalog
```

## Catalog

A catalog has two methods:

- `list(query?)` returns a `Page` of entries. An entry has an `id` and a `name`. A page has no payloads.
- `get(id)` returns one layer by id, or `undefined` when the id is missing.

The package makes a catalog in two ways. Both ways take a `Schema<T>` from [`@untheme/schema`](../schema). The catalog checks each layer against the schema.

- `defineCatalog(schema, provider)` makes a catalog from storage callbacks.
- `defineClient(schema, client)` makes a catalog from transport config.

Both return the same `Catalog` shape. A provider callback can call a client. An app can serve its own themes and use a remote catalog through one interface.

```ts
import { defineCatalog, defineClient } from "@untheme/catalog";

// A catalog over the place where the themes are
const local = defineCatalog(schema, {
  list: (listing) => store.list(listing),
  get: (id) => store.get(`themes/${id}`),
});

// A catalog over the network
const remote = defineClient(schema, {
  base: "https://themes.example.dev",
  headers: { authorization: `Bearer ${token}` },
});

// A catalog that uses the remote catalog when the local catalog has no layer
const catalog = defineCatalog(schema, {
  list: (listing) => local.list(listing),
  get: async (id) => (await local.get(id)) ?? remote.get(id),
});

await catalog.list({ search: "nord", limit: 10 }); // a Page of entries
await catalog.get("nord"); // a Layer, or undefined on a miss
```

## Provider

A `Provider` has two callbacks. Each callback returns raw data, directly or in a promise. The catalog checks each result.

- `list(listing)` receives a `Listing` and returns a `Page`.
- `get(id)` returns the stored payload for the id. `null` and `undefined` mean a miss.

## Client

A `Client` has these fields:

- `base` is the URL that the routes extend.
- `headers` are sent with every request. This field is optional.
- `fetch` is the fetch implementation. The default is the global `fetch`. This field is optional.

## Queries

A `Query` is plain JSON data. All fields are optional.

| Field    | Meaning                                                       |
| -------- | ------------------------------------------------------------- |
| `search` | Text to find in the entry name. The match ignores case.       |
| `sort`   | A `Sort`: a `field` of `"id"` or `"name"`, and a `direction`. |
| `limit`  | The maximum number of entries in the page.                    |
| `offset` | The number of matches to skip.                                |

The catalog validates the query and fills the gaps. A provider receives a `Listing`, a query with a complete window and ordering. A provider callback must filter, sort, cut the window, and count the matches.

A `Page` has `entries`, `total`, `limit`, and `offset`. `total` counts all matches across all pages.

## Errors

- `MalformedQueryError` is thrown when the query passed to `list` is not a `Query`.
- `MalformedPageError` is thrown when a provider answers a listing with a value that is not a `Page`.
- `MalformedLayerError` is thrown when a payload fails the contract. It has the `issues` of the contract and the `id` of the payload.
- `FailedRequestError` is thrown when the network answers with a failure status. It has the `url` and the `status`.

Each of the first two errors has a `value` property that holds the rejected value.

## Wire protocol

`defineClient` sends two GET requests.

- `{base}/themes?q={json}` sends the listing as JSON in one parameter. The response is a `Page`.
- `{base}/themes/{id}` returns one layer as JSON. A 404 means a miss.

A 404 on a listing throws `FailedRequestError`.

A server handler decodes `q`, checks it with `isQuery`, fills it with `toListing`, and passes it to a catalog.

## Helpers

- `isQuery(value)` checks for a `Query`. A key other than `search`, `sort`, `limit`, and `offset` fails the check.
- `isPage(value)` checks for a `Page`.
- `toListing(query)` fills the gaps of a query and returns a `Listing`.
- `LIMIT` is the default window size, 20.
- `SORT` is the default ordering, `name` ascending.
- `ROUTE` is the path segment `themes`.

## Related

- [`@untheme/schema`](../schema) defines the token contract types and guards.
- [`@untheme/core`](../core) is the runtime theme service that a catalog feeds.
- [`untheme`](../untheme) re-exports this package.
