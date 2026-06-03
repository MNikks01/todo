/**
 * Mongoose model for refresh tokens (docs/database.md §2.3, §3).
 * TTL index on `expiresAt` auto-removes expired tokens.
 */
import { type HydratedDocument, model, Schema, type Types } from 'mongoose';

export interface RefreshTokenDocument {
  userId: Types.ObjectId;
  tokenHash: string;
  family: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    family: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Auto-expire at expiresAt (docs/database.md §3 TTL index).
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenHydrated = HydratedDocument<RefreshTokenDocument>;

export const RefreshTokenModel = model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);
