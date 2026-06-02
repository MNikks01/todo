import { describe, expect, it } from 'vitest';
import { UnauthorizedError } from '../../core/errors/index.js';
import { createTokenService } from '../../infrastructure/security/tokenService.js';

describe('TokenService', () => {
  const tokens = createTokenService();

  it('signs and verifies an access token with claims', () => {
    const token = tokens.signAccessToken({ userId: 'u1', role: 'admin' });
    const claims = tokens.verifyAccessToken(token);
    expect(claims.sub).toBe('u1');
    expect(claims.role).toBe('admin');
    expect(claims.jti).toBeTruthy();
  });

  it('rejects a tampered/invalid token', () => {
    expect(() => tokens.verifyAccessToken('garbage.token.value')).toThrow(UnauthorizedError);
  });

  it('generates a unique opaque refresh token and a stable hash', () => {
    const a = tokens.generateRefreshToken();
    const b = tokens.generateRefreshToken();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).toBe(tokens.hashToken(a.token));
    expect(a.tokenHash).not.toBe(a.token); // stored value differs from plaintext
  });

  it('generates distinct opaque tokens (csrf)', () => {
    expect(tokens.generateOpaqueToken()).not.toBe(tokens.generateOpaqueToken());
  });
});
