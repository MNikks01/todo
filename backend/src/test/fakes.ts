/**
 * In-memory fakes for fast, DB-free unit tests (docs/testing.md §2).
 */
import { randomUUID } from 'node:crypto';
import type { Role } from '../core/types/roles.js';
import type { AuditEvent, AuditLogger } from '../modules/auth/domain/auditLogger.js';
import type {
  CreateRefreshTokenInput,
  RefreshTokenRecord,
  RefreshTokenRepository,
} from '../modules/auth/domain/refreshToken.js';
import type { AccountStatus, User } from '../modules/users/domain/user.js';
import type { CreateUserInput, UserRepository } from '../modules/users/domain/userRepository.js';
import type { PasswordHasher } from '../infrastructure/security/passwordHasher.js';

export class FakeUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();

  create(input: CreateUserInput): Promise<User> {
    const now = new Date();
    const user: User = {
      id: randomUUID(),
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? 'user',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(user.id, user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.byId.get(id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve([...this.byId.values()].find((u) => u.email === email) ?? null);
  }

  list(options: { limit: number; skip: number }): Promise<User[]> {
    return Promise.resolve(
      [...this.byId.values()].slice(options.skip, options.skip + options.limit),
    );
  }

  setRole(id: string, role: Role): Promise<User | null> {
    const user = this.byId.get(id);
    if (!user) return Promise.resolve(null);
    user.role = role;
    return Promise.resolve(user);
  }

  setStatus(id: string, status: AccountStatus): Promise<User | null> {
    const user = this.byId.get(id);
    if (!user) return Promise.resolve(null);
    user.status = status;
    return Promise.resolve(user);
  }
}

export class FakeRefreshTokenRepository implements RefreshTokenRepository {
  readonly records = new Map<string, RefreshTokenRecord>();

  create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    const record: RefreshTokenRecord = {
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      family: input.family,
      expiresAt: input.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    this.records.set(record.id, record);
    return Promise.resolve(record);
  }

  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    return Promise.resolve(
      [...this.records.values()].find((r) => r.tokenHash === tokenHash) ?? null,
    );
  }

  markUsed(id: string, usedAt: Date): Promise<void> {
    const record = this.records.get(id);
    if (record) record.usedAt = usedAt;
    return Promise.resolve();
  }

  deleteByHash(tokenHash: string): Promise<void> {
    for (const [id, r] of this.records) if (r.tokenHash === tokenHash) this.records.delete(id);
    return Promise.resolve();
  }

  deleteFamily(family: string): Promise<void> {
    for (const [id, r] of this.records) if (r.family === family) this.records.delete(id);
    return Promise.resolve();
  }

  deleteAllForUser(userId: string): Promise<void> {
    for (const [id, r] of this.records) if (r.userId === userId) this.records.delete(id);
    return Promise.resolve();
  }
}

export class FakeHasher implements PasswordHasher {
  verifyCalls = 0;

  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`);
  }

  verify(hash: string, plain: string): Promise<boolean> {
    this.verifyCalls += 1;
    return Promise.resolve(hash === `hashed:${plain}`);
  }

  dummyHash(): string {
    return 'hashed:__dummy__';
  }
}

export class FakeAuditLogger implements AuditLogger {
  readonly events: AuditEvent[] = [];

  record(event: AuditEvent): Promise<void> {
    this.events.push(event);
    return Promise.resolve();
  }

  actions(): string[] {
    return this.events.map((e) => e.action);
  }
}
