/**
 * Mongoose model for audit logs (docs/database.md §2.4). Append-only in practice.
 */
import { model, Schema } from 'mongoose';

export interface AuditLogDocument {
  actorId: Schema.Types.ObjectId | null;
  action: string;
  targetId: Schema.Types.ObjectId | null;
  correlationId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, default: null, index: true },
    action: { type: String, required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    correlationId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AuditLogModel = model<AuditLogDocument>('AuditLog', auditLogSchema);
