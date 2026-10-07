import type { Issue } from "@untheme/schema";

import { SchemaError } from "@untheme/schema";

/**
 * Thrown when the value passed to {@link Catalog.list} is not a {@link Query}.
 * The error has no {@link Issue}s and extends {@link Error}. The `value`
 * property holds the rejected value.
 */
export class MalformedQueryError extends Error {
  readonly value: unknown;

  constructor(value: unknown) {
    super("value is not a catalog query");
    this.name = "MalformedQueryError";
    this.value = value;
  }
}

/**
 * Thrown when a provider answers a listing with a value that is not a {@link
 * Page}. The error extends {@link Error}. The `value` property holds the
 * rejected value.
 */
export class MalformedPageError extends Error {
  readonly value: unknown;

  constructor(value: unknown) {
    super("source answered a listing with something that is not a page");
    this.name = "MalformedPageError";
    this.value = value;
  }
}

/**
 * Thrown when a provider answers a retrieval with a payload that fails the
 * contract. A missing payload is a miss and resolves `undefined`. The error
 * extends {@link SchemaError} with the {@link Issue}s of the contract. The `id`
 * property holds the id of the payload.
 */
export class MalformedLayerError extends SchemaError {
  readonly id: string;

  constructor(id: string, issues: Issue[]) {
    super(issues);
    this.name = "MalformedLayerError";
    this.id = id;
  }
}

/**
 * Thrown when the network answers with a failure status. The `url` and `status`
 * properties hold the URL and status of the request. A 404 on a retrieval is a
 * miss. A 404 on a listing throws this error.
 */
export class FailedRequestError extends Error {
  readonly url: string;

  readonly status: number;

  constructor(url: string, status: number) {
    super(`request to "${url}" failed with status ${status}`);
    this.name = "FailedRequestError";
    this.url = url;
    this.status = status;
  }
}
