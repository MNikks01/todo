/**
 * Mongoose implementation of UserRepository. Maps documents → domain entities
 * so Mongoose types never leak past this layer (ADR-0007).
 */
import type { Role } from '../../../core/types/roles.js';
import type { AccountStatus, User } from '../domain/user.js';
import type { CreateUserInput, UserRepository } from '../domain/userRepository.js';
import { type UserDocument, type UserHydrated, UserModel } from './userModel.js';

function toDomain(doc: UserHydrated): User {
  return {
    id: doc.id as string,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role as Role,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const doc = await UserModel.create({
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? 'user',
    } satisfies Partial<UserDocument>);
    return toDomain(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? toDomain(doc) : null;
  }

  async list(options: { limit: number; skip: number }): Promise<User[]> {
    const docs = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit);
    return docs.map(toDomain);
  }

  async setRole(id: string, role: Role): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { role }, { new: true });
    return doc ? toDomain(doc) : null;
  }

  async setStatus(id: string, status: AccountStatus): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { status }, { new: true });
    return doc ? toDomain(doc) : null;
  }
}
