/**
 * UserService — user account use-cases (application layer).
 * Orchestrates the repository; enforces invariants (unique email). Never returns
 * the password hash to callers other than auth (which needs it to verify).
 */
import { ConflictError, NotFoundError } from '../../../core/errors/index.js';
import type { Role } from '../../../core/types/roles.js';
import type { AccountStatus, User } from '../domain/user.js';
import type { UserRepository } from '../domain/userRepository.js';

export class UserService {
  constructor(private readonly users: UserRepository) {}

  /** Used by auth registration. Enforces unique email (case-insensitive). */
  async createUser(input: { email: string; passwordHash: string; role?: Role }): Promise<User> {
    const email = input.email.toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }
    return this.users.create({ ...input, email });
  }

  async getById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /** Returns null when not found (auth uses this to avoid user enumeration). */
  async findByEmail(email: string): Promise<User | null> {
    return this.users.findByEmail(email.toLowerCase());
  }

  async listUsers(options: { limit: number; skip: number }): Promise<User[]> {
    return this.users.list(options);
  }

  async setRole(id: string, role: Role): Promise<User> {
    const user = await this.users.setRole(id, role);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async setStatus(id: string, status: AccountStatus): Promise<User> {
    const user = await this.users.setStatus(id, status);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}
