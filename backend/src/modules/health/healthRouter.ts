/**
 * Health endpoints (docs/monitoring.md §1). `/health` = liveness (fast, no deps),
 * `/ready` = readiness (DB reachable) used to gate traffic.
 */
import { Router } from 'express';
import { asyncHandler } from '../../core/http/asyncHandler.js';
import { database } from '../../infrastructure/database/connection.js';

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.get(
    '/ready',
    asyncHandler(async (_req, res) => {
      const dbOk = await database.ping();
      res.status(dbOk ? 200 : 503).json({ status: dbOk ? 'ready' : 'not_ready', db: dbOk });
    }),
  );

  return router;
}
