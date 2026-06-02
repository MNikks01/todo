/**
 * Token service (docs/security.md §2.2–§2.3, ADR-0003).
 *
 * - Access token: short-lived signed JWT (stateless authz), claims = sub/role/jti.
 * - Refresh token: opaque 256-bit CSPRNG value (NOT a JWT), stored only as a
 *   SHA-256 hash. SHA-256 is correct here precisely because the token is
 *   high-entropy (see docs/security.md §2.3).
 * - Opaque token: generic high-entropy value (e.g. CSRF token).
 */
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { UnauthorizedError } from '../../core/errors/index.js';
import type { Role } from '../../core/types/roles.js';

export interface AccessTokenClaims {
  sub: string;
  role: Role;
  jti: string;
}

export interface GeneratedRefreshToken {
  /** Plaintext token sent to the client (in the cookie). */
  token: string;
  /** SHA-256 hash stored at rest. */
  tokenHash: string;
}

export interface TokenService {
  signAccessToken(input: { userId: string; role: Role }): string;
  verifyAccessToken(token: string): AccessTokenClaims;
  generateRefreshToken(): GeneratedRefreshToken;
  hashToken(token: string): string;
  generateOpaqueToken(): string;
}

class JwtTokenService implements TokenService {
  signAccessToken(input: { userId: string; role: Role }): string {
    // `expiresIn` accepts ms-style strings (e.g. '15m'); cast the options object
    // because the upstream `StringValue` template type is not exported.
    const options = {
      expiresIn: config.JWT_ACCESS_TTL,
      jwtid: randomUUID(),
    } as jwt.SignOptions;
    return jwt.sign({ sub: input.userId, role: input.role }, config.JWT_ACCESS_SECRET, options);
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    let decoded: unknown;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as Record<string, unknown>).sub !== 'string' ||
      typeof (decoded as Record<string, unknown>).role !== 'string' ||
      typeof (decoded as Record<string, unknown>).jti !== 'string'
    ) {
      throw new UnauthorizedError('Malformed token');
    }
    const claims = decoded as Record<string, unknown>;
    return {
      sub: claims.sub as string,
      role: claims.role as Role,
      jti: claims.jti as string,
    };
  }

  generateRefreshToken(): GeneratedRefreshToken {
    const token = randomBytes(32).toString('base64url');
    return { token, tokenHash: this.hashToken(token) };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  generateOpaqueToken(): string {
    return randomBytes(32).toString('base64url');
  }
}

export function createTokenService(): TokenService {
  return new JwtTokenService();
}
