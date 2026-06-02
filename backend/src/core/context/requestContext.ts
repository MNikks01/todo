/**
 * Per-request context propagated via AsyncLocalStorage (docs/logging.md §5).
 *
 * Lets any code (logger, services) read the current request's correlationId
 * and authenticated userId without threading them through every signature.
 */
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  readonly correlationId: string;
  userId?: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** Run `callback` with the given context bound for its entire async lifetime. */
export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
  return storage.run(context, callback);
}

/** Current request context, or `undefined` outside a request (e.g. at boot). */
export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

/** Correlation id for the current request, if any. */
export function getCorrelationId(): string | undefined {
  return storage.getStore()?.correlationId;
}

/** Attach the authenticated user id to the current context (set by auth middleware). */
export function setContextUserId(userId: string): void {
  const store = storage.getStore();
  if (store) {
    store.userId = userId;
  }
}
