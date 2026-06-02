import { Types } from 'mongoose';
import type {
  CreateRefreshTokenInput,
  RefreshTokenRecord,
  RefreshTokenRepository,
} from '../domain/refreshToken.js';
import { type RefreshTokenHydrated, RefreshTokenModel } from './refreshTokenModel.js';

function toDomain(doc: RefreshTokenHydrated): RefreshTokenRecord {
  return {
    id: doc.id as string,
    userId: doc.userId.toString(),
    tokenHash: doc.tokenHash,
    family: doc.family,
    expiresAt: doc.expiresAt,
    usedAt: doc.usedAt,
    createdAt: doc.createdAt,
  };
}

export class MongoRefreshTokenRepository implements RefreshTokenRepository {
  async create(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    const doc = await RefreshTokenModel.create({
      userId: new Types.ObjectId(input.userId),
      tokenHash: input.tokenHash,
      family: input.family,
      expiresAt: input.expiresAt,
      usedAt: null,
    });
    return toDomain(doc);
  }

  async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const doc = await RefreshTokenModel.findOne({ tokenHash });
    return doc ? toDomain(doc) : null;
  }

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await RefreshTokenModel.updateOne({ _id: id }, { usedAt });
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    await RefreshTokenModel.deleteOne({ tokenHash });
  }

  async deleteFamily(family: string): Promise<void> {
    await RefreshTokenModel.deleteMany({ family });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }
}
