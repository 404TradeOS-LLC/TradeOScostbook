/**
 * Knowledge Runtime Bridge — error types.
 *
 * Kept separate from this app's HTTP-facing ApiError (backend/errors, used
 * by the centralized errorHandler) since this module has no routes or
 * controllers yet. A future controller layer can translate these into
 * ApiError/HTTP responses without this module needing to know about HTTP.
 */

export class KnowledgeRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeRuntimeError";
  }
}

/** Thrown by service methods that are intentionally not implemented yet. */
export class NotImplementedError extends KnowledgeRuntimeError {
  constructor(methodName: string) {
    super(`KnowledgeRuntimeService.${methodName} is not implemented yet`);
    this.name = "NotImplementedError";
  }
}

/** A requested knowledge-side record (by slug) does not exist. */
export class KnowledgeRecordNotFoundError extends KnowledgeRuntimeError {
  constructor(slug: string) {
    super(`No knowledge record found for slug "${slug}"`);
    this.name = "KnowledgeRecordNotFoundError";
  }
}

/** A requested runtime-side record (by id, within an org) does not exist. */
export class RuntimeRecordNotFoundError extends KnowledgeRuntimeError {
  constructor(kind: "assembly" | "costItem", id: string) {
    super(`No runtime ${kind} found with id "${id}"`);
    this.name = "RuntimeRecordNotFoundError";
  }
}
