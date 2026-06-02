/**
 * User domain entity + DTO (Clean Architecture domain layer — no I/O).
 * docs/database.md §2.1, backend/modules/users/CLAUDE.md.
 */
import type { Role } from '../../../core/types/roles.js';

export type AccountStatus = 'active' | 'disabled';

/** Full user as known to the application layer (includes the secret hash). */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe representation for transport — NEVER includes passwordHash. */
export interface UserDto {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
