import { Types } from 'mongoose';
import { getCorrelationId } from '../../../core/context/requestContext.js';
import { logger } from '../../../core/logger/logger.js';
import type { AuditEvent, AuditLogger } from '../domain/auditLogger.js';
import { AuditLogModel } from './auditLogModel.js';

function toObjectId(id: string | undefined): Types.ObjectId | null {
  return id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
}

export class MongoAuditLogger implements AuditLogger {
  async record(event: AuditEvent): Promise<void> {
    try {
      await AuditLogModel.create({
        actorId: toObjectId(event.actorId),
        action: event.action,
        targetId: toObjectId(event.targetId),
        correlationId: getCorrelationId() ?? null,
        metadata: event.metadata ?? {},
      });
    } catch (error) {
      // Audit must never break the request path; surface as a log instead.
      logger.error('audit.write_failed', { error, action: event.action });
    }
  }
}
