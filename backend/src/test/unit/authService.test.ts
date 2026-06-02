import { describe, expect, it } from 'vitest';
import { ConflictError, UnauthorizedError } from '../../core/errors/index.js';
import { createTokenService } from '../../infrastructure/security/tokenService.js';
import { AuthService } from '../../modules/auth/application/authService.js';
import { InMemoryLoginAttemptTracker } from '../../modules/auth/infrastructure/inMemoryLoginAttemptTracker.js';
import { UserService } from '../../modules/users/application/userService.js';
import {
  FakeAuditLogger,
  FakeHasher,
  FakeRefreshTokenRepository,
  FakeUserRepository,
} from '../fakes.js';

function makeService(lockThreshold = 3) {
  const userRepo = new FakeUserRepository();
  const userService = new UserService(userRepo);
  const refreshTokens = new FakeRefreshTokenRepository();
  const tokens = createTokenService();
  const audit = new FakeAuditLogger();
  const loginAttempts = new InMemoryLoginAttemptTracker(lockThreshold, 60_000, 60_000);
  const service = new AuthService({
    users: userService,
    refreshTokens,
    hasher: new FakeHasher(),
    tokens,
    audit,
    loginAttempts,
  });
  return { service, userService, refreshTokens, tokens, audit };
}

const creds = { email: 'user@example.com', password: 'password123' };

describe('AuthService.register', () => {
  it('creates a user and never returns the password hash', async () => {
    const { service, audit } = makeService();
    const user = await service.register(creds);
    expect(user.email).toBe('user@example.com');
    expect(user.role).toBe('user');
    expect(user).not.toHaveProperty('passwordHash');
    expect(audit.actions()).toContain('auth.register');
  });

  it('rejects a duplicate email', async () => {
    const { service } = makeService();
    await service.register(creds);
    await expect(service.register(creds)).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('AuthService.login', () => {
  it('issues access + refresh + csrf tokens on valid credentials', async () => {
    const { service, tokens, audit } = makeService();
    await service.register(creds);
    const session = await service.login(creds);

    expect(session.accessToken).toBeTruthy();
    expect(session.refreshToken).toBeTruthy();
    expect(session.csrfToken).toBeTruthy();
    const claims = tokens.verifyAccessToken(session.accessToken);
    expect(claims.sub).toBe(session.user.id);
    expect(claims.role).toBe('user');
    expect(audit.actions()).toContain('auth.login.success');
  });

  it('rejects a wrong password with a generic error', async () => {
    const { service, audit } = makeService();
    await service.register(creds);
    await expect(service.login({ ...creds, password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(audit.actions()).toContain('auth.login.failure');
  });

  it('rejects an unknown email without revealing existence', async () => {
    const { service } = makeService();
    await expect(service.login(creds)).rejects.toThrow('Invalid email or password');
  });

  it('rejects login for a disabled account', async () => {
    const { service, userService } = makeService();
    const user = await service.register(creds);
    await userService.setStatus(user.id, 'disabled');
    await expect(service.login(creds)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('locks the account after repeated failures, then blocks even correct credentials', async () => {
    const { service, audit } = makeService(3);
    await service.register(creds);
    for (let i = 0; i < 3; i += 1) {
      await expect(service.login({ ...creds, password: 'wrong' })).rejects.toThrow();
    }
    // Now locked: correct password is still refused.
    await expect(service.login(creds)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(audit.actions()).toContain('auth.account_locked');
  });

  it('resets the failure counter after a successful login', async () => {
    const { service } = makeService(3);
    await service.register(creds);
    await expect(service.login({ ...creds, password: 'wrong' })).rejects.toThrow();
    await service.login(creds); // success resets
    await expect(service.login({ ...creds, password: 'wrong' })).rejects.toThrow();
    // Only 1 failure in the new window → still not locked.
    await expect(service.login(creds)).resolves.toBeDefined();
  });
});

describe('AuthService.refresh (rotation + reuse detection)', () => {
  it('rotates: returns new tokens and marks the old one used', async () => {
    const { service, refreshTokens, audit } = makeService();
    await service.register(creds);
    const s1 = await service.login(creds);
    const s2 = await service.refresh(s1.refreshToken);

    expect(s2.refreshToken).not.toBe(s1.refreshToken);
    expect(s2.accessToken).toBeTruthy();
    expect([...refreshTokens.records.values()].some((r) => r.usedAt !== null)).toBe(true);
    expect(audit.actions()).toContain('auth.refresh.rotated');
  });

  it('detects reuse of a rotated token and revokes the whole family', async () => {
    const { service, audit } = makeService();
    await service.register(creds);
    const s1 = await service.login(creds);
    const s2 = await service.refresh(s1.refreshToken); // s1 token now used

    // Replaying the old token = theft signal → family burned.
    await expect(service.refresh(s1.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(audit.actions()).toContain('auth.refresh.reuse_detected');

    // The legitimately-rotated token is also revoked now.
    await expect(service.refresh(s2.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects an unknown refresh token', async () => {
    const { service } = makeService();
    await expect(service.refresh('not-a-real-token')).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects an expired refresh token', async () => {
    const { service, refreshTokens } = makeService();
    await service.register(creds);
    const s1 = await service.login(creds);
    const record = [...refreshTokens.records.values()][0];
    if (record) record.expiresAt = new Date(Date.now() - 1000);
    await expect(service.refresh(s1.refreshToken)).rejects.toThrow('Session expired');
  });

  it('revokes sessions if the user was disabled between refreshes', async () => {
    const { service, userService } = makeService();
    const user = await service.register(creds);
    const s1 = await service.login(creds);
    await userService.setStatus(user.id, 'disabled');
    await expect(service.refresh(s1.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

describe('AuthService.logout / logoutAll', () => {
  it('logout removes the current refresh token', async () => {
    const { service, refreshTokens, audit } = makeService();
    await service.register(creds);
    const s1 = await service.login(creds);
    await service.logout(s1.refreshToken);
    expect(refreshTokens.records.size).toBe(0);
    expect(audit.actions()).toContain('auth.logout');
    await expect(service.refresh(s1.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('logout is a no-op when no token is provided', async () => {
    const { service } = makeService();
    await expect(service.logout(undefined)).resolves.toBeUndefined();
  });

  it('logoutAll removes every refresh token for the user', async () => {
    const { service, refreshTokens, audit } = makeService();
    const user = await service.register(creds);
    await service.login(creds);
    await service.login(creds);
    expect(refreshTokens.records.size).toBe(2);
    await service.logoutAll(user.id);
    expect(refreshTokens.records.size).toBe(0);
    expect(audit.actions()).toContain('auth.logout_all');
  });
});
