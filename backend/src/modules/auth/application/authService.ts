/**
 * AuthService — authentication use-cases (application layer).
 *
 * Implements register, login (with per-account lockout), refresh-token rotation
 * with reuse detection, logout, and logout-all. Emits audit events. Returns
 * generic errors for all credential failures to prevent user enumeration
 * (docs/security.md §2, ADR-0003).
 */
import { randomUUID } from 'node:crypto';
import { config } from '../../../config/env.js';
import { UnauthorizedError } from '../../../core/errors/index.js';
import { logger } from '../../../core/logger/logger.js';
import type { Role } from '../../../core/types/roles.js';
import type { UserService } from '../../users/application/userService.js';
import { type User, toUserDto, type UserDto } from '../../users/domain/user.js';
import type { PasswordHasher } from '../../../infrastructure/security/passwordHasher.js';
import type { TokenService } from '../../../infrastructure/security/tokenService.js';
import type { AuditLogger } from '../domain/auditLogger.js';
import type { LoginAttemptTracker } from '../domain/loginAttemptTracker.js';
import type { RefreshTokenRepository } from '../domain/refreshToken.js';

export interface AuthServiceDeps {
  users: UserService;
  refreshTokens: RefreshTokenRepository;
  hasher: PasswordHasher;
  tokens: TokenService;
  audit: AuditLogger;
  loginAttempts: LoginAttemptTracker;
}

/** Tokens minted for a session. The refresh token + csrf are set as cookies. */
export interface IssuedSession {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

const GENERIC_CREDENTIALS_ERROR = 'Invalid email or password';

export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  async register(input: { email: string; password: string }): Promise<UserDto> {
    const passwordHash = await this.deps.hasher.hash(input.password);
    const user = await this.deps.users.createUser({ email: input.email, passwordHash });
    await this.deps.audit.record({ action: 'auth.register', actorId: user.id });
    return toUserDto(user);
  }

  async login(input: { email: string; password: string }): Promise<IssuedSession> {
    const key = input.email.toLowerCase();

    if (await this.deps.loginAttempts.isLocked(key)) {
      await this.deps.audit.record({
        action: 'auth.account_locked',
        metadata: { reason: 'login_while_locked' },
      });
      throw new UnauthorizedError(GENERIC_CREDENTIALS_ERROR);
    }

    const user = await this.deps.users.findByEmail(key);
    // Always run a verify — against the user's hash, or a dummy when the email is
    // unknown — so timing does not reveal whether the account exists (SF-1).
    const hashToCheck = user?.passwordHash ?? this.deps.hasher.dummyHash();
    const passwordMatches = await this.deps.hasher.verify(hashToCheck, input.password);
    const passwordOk = user !== null && user.status === 'active' && passwordMatches;

    if (!user || !passwordOk) {
      const locked = await this.deps.loginAttempts.recordFailure(key);
      await this.deps.audit.record({
        action: locked ? 'auth.account_locked' : 'auth.login.failure',
        ...(user ? { targetId: user.id } : {}),
      });
      throw new UnauthorizedError(GENERIC_CREDENTIALS_ERROR);
    }

    await this.deps.loginAttempts.reset(key);
    const session = await this.issueSession(user, randomUUID());
    await this.deps.audit.record({ action: 'auth.login.success', actorId: user.id });
    return session;
  }

  /**
   * Rotate a refresh token. Detects reuse of an already-rotated token and, on
   * detection, revokes the whole family (theft signal) — the client must re-auth.
   */
  async refresh(refreshToken: string): Promise<IssuedSession> {
    const tokenHash = this.deps.tokens.hashToken(refreshToken);
    const record = await this.deps.refreshTokens.findByHash(tokenHash);

    if (!record) {
      throw new UnauthorizedError('Invalid session');
    }

    if (record.usedAt !== null) {
      // Reuse of a rotated-out token → likely theft. Burn the whole family.
      await this.deps.refreshTokens.deleteFamily(record.family);
      await this.deps.audit.record({
        action: 'auth.refresh.reuse_detected',
        actorId: record.userId,
        metadata: { family: record.family },
      });
      logger.warn('auth.refresh.reuse_detected', { userId: record.userId });
      throw new UnauthorizedError('Invalid session');
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await this.deps.refreshTokens.deleteByHash(tokenHash);
      throw new UnauthorizedError('Session expired');
    }

    const user = await this.deps.users.getById(record.userId);
    if (user.status !== 'active') {
      await this.deps.refreshTokens.deleteAllForUser(user.id);
      throw new UnauthorizedError('Invalid session');
    }

    // Mark the presented token used, then mint a new one in the same family.
    await this.deps.refreshTokens.markUsed(record.id, new Date());
    const session = await this.issueSession(user, record.family);
    await this.deps.audit.record({ action: 'auth.refresh.rotated', actorId: user.id });
    return session;
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }
    const tokenHash = this.deps.tokens.hashToken(refreshToken);
    const record = await this.deps.refreshTokens.findByHash(tokenHash);
    await this.deps.refreshTokens.deleteByHash(tokenHash);
    await this.deps.audit.record({
      action: 'auth.logout',
      ...(record ? { actorId: record.userId } : {}),
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.deps.refreshTokens.deleteAllForUser(userId);
    await this.deps.audit.record({ action: 'auth.logout_all', actorId: userId });
  }

  private async issueSession(user: User, family: string): Promise<IssuedSession> {
    const role: Role = user.role;
    const accessToken = this.deps.tokens.signAccessToken({ userId: user.id, role });
    const { token: refreshToken, tokenHash } = this.deps.tokens.generateRefreshToken();
    const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.deps.refreshTokens.create({ userId: user.id, tokenHash, family, expiresAt });

    return {
      user: toUserDto(user),
      accessToken,
      refreshToken,
      csrfToken: this.deps.tokens.generateOpaqueToken(),
    };
  }
}
