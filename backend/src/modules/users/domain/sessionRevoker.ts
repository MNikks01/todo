/**
 * Port for revoking a user's sessions (docs/security.md §2.5, SF-2). Defined in
 * the users domain so UserService can depend on the abstraction; the concrete
 * implementation (refresh-token repository) is wired at the composition root,
 * keeping the users module decoupled from auth internals.
 */
export interface SessionRevoker {
  revokeAllForUser(userId: string): Promise<void>;
}
