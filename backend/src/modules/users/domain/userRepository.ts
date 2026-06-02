/**
 * UserRepository interface (Dependency Inversion — ADR-0007).
 * The application layer depends on this; the Mongoose implementation lives in
 * infrastructure/. No persistence detail leaks here.
 */
import type { Role } from '../../../core/types/roles.js';
import type { AccountStatus, User } from './user.js';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role?: Role;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(options: { limit: number; skip: number }): Promise<User[]>;
  setRole(id: string, role: Role): Promise<User | null>;
  setStatus(id: string, status: AccountStatus): Promise<User | null>;
}
