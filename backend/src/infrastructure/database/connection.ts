/**
 * MongoDB connection lifecycle (Singleton — architecture.md §16.1, ADR-0006).
 *
 * A single Mongoose connection/pool is reused process-wide. Exposes connect /
 * disconnect for the boot + graceful-shutdown lifecycle and a ping for readiness
 * checks (docs/monitoring.md §1).
 */
import mongoose from 'mongoose';
import { logger } from '../../core/logger/logger.js';

export interface DatabaseConnection {
  connect(uri: string): Promise<void>;
  disconnect(): Promise<void>;
  ping(): Promise<boolean>;
  readonly isConnected: boolean;
}

class MongooseConnection implements DatabaseConnection {
  get isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      return;
    }
    // Fail fast rather than buffering operations against a dead connection.
    mongoose.set('bufferCommands', false);
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    logger.info('database.connected');

    mongoose.connection.on('error', (error: unknown) => {
      logger.error('database.error', { error });
    });
    mongoose.connection.on('disconnected', () => {
      logger.warn('database.disconnected');
    });
  }

  async disconnect(): Promise<void> {
    if (mongoose.connection.readyState === 0) {
      return;
    }
    await mongoose.disconnect();
    logger.info('database.disconnected.graceful');
  }

  async ping(): Promise<boolean> {
    try {
      const admin = mongoose.connection.db?.admin();
      if (!admin) {
        return false;
      }
      await admin.ping();
      return true;
    } catch {
      return false;
    }
  }
}

export const database: DatabaseConnection = new MongooseConnection();
