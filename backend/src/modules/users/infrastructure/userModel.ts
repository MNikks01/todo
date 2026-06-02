/**
 * Mongoose model for users (docs/database.md §2.1, §3).
 * Confined to the infrastructure layer (rules/architecture.md).
 */
import { type HydratedDocument, model, Schema } from 'mongoose';
import { ROLES } from '../../../core/types/roles.js';

export interface UserDocument {
  email: string;
  passwordHash: string;
  role: string;
  status: 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'user', index: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  },
  { timestamps: true },
);

export type UserHydrated = HydratedDocument<UserDocument>;

export const UserModel = model<UserDocument>('User', userSchema);
