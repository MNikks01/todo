/**
 * Audit logging interface (docs/security.md §10, docs/logging.md §3).
 * Records security-relevant events to an append-only sink with the request's
 * correlationId. Metadata must be non-PII (use ids, not emails).
 */
export type AuditAction =
  | 'auth.register'
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.account_locked'
  | 'auth.logout'
  | 'auth.logout_all'
  | 'auth.refresh.rotated'
  | 'auth.refresh.reuse_detected'
  | 'user.role_changed'
  | 'user.status_changed';

export interface AuditEvent {
  action: AuditAction;
  actorId?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogger {
  record(event: AuditEvent): Promise<void>;
}
