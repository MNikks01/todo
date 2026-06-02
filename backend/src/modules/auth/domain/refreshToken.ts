/**
 * Refresh token record + repository interface (docs/security.md §2.3, ADR-0003).
 * Stored as a hash with a `family` for rotation/reuse-detection and a TTL.
 */
export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  family: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  family: string;
  expiresAt: Date;
}

export interface RefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  markUsed(id: string, usedAt: Date): Promise<void>;
  deleteByHash(tokenHash: string): Promise<void>;
  /** Revoke an entire rotation family (reuse detected → possible theft). */
  deleteFamily(family: string): Promise<void>;
  /** Revoke every session for a user (logout-all / password change). */
  deleteAllForUser(userId: string): Promise<void>;
}
