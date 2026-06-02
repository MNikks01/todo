/**
 * Application entrypoint. Connects the DB, starts the server, and wires graceful
 * shutdown (drain connections, close DB) on SIGTERM/SIGINT.
 */
import type { Server } from 'node:http';
import { config } from './config/env.js';
import { logger } from './core/logger/logger.js';
import { database } from './infrastructure/database/connection.js';
import { createApp } from './app.js';

async function bootstrap(): Promise<void> {
  await database.connect(config.MONGODB_URI);

  const app = createApp();
  const server: Server = app.listen(config.PORT, () => {
    logger.info('server.started', { port: config.PORT, env: config.NODE_ENV });
  });

  const shutdown = (signal: string): void => {
    logger.info('server.shutdown.start', { signal });
    server.close(() => {
      void database.disconnect().finally(() => {
        logger.info('server.shutdown.complete');
        process.exit(0);
      });
    });
    // Hard cap so a stuck connection can't block shutdown forever.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  logger.fatal('server.bootstrap_failed', { error });
  process.exit(1);
});
