/**
 * Application logger (Singleton — architecture.md §16.1, ADR-0008).
 *
 * Winston with: custom severity levels (docs/logging.md §4), a redaction format
 * that scrubs PII/secrets anywhere in the payload (§6), and a context format
 * that injects correlationId/userId from AsyncLocalStorage (§5). JSON to stdout
 * in prod/test; human-readable in development. Import `logger` everywhere —
 * never use console in production code (rules/logging.md).
 */
import winston from 'winston';
import { config, isProduction, isTest } from '../../config/env.js';
import { getRequestContext } from '../context/requestContext.js';

const levels = { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5 } as const;

const colors = {
  fatal: 'magenta',
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  trace: 'grey',
};
winston.addColors(colors);

// Keys redacted anywhere they appear (case-insensitive). docs/logging.md §6.
const REDACT_KEYS = new Set(
  [
    'authorization',
    'cookie',
    'set-cookie',
    'x-csrf-token',
    'password',
    'passwordhash',
    'token',
    'accesstoken',
    'refreshtoken',
    'csrftoken',
    'email',
  ].map((k) => k.toLowerCase()),
);
const REDACTED = '[REDACTED]';

/**
 * Returns a redacted *copy* of nested values — never mutates the caller's
 * objects (so logging `req.headers` cannot corrupt the live request).
 * Exported for unit testing (docs/logging.md §9).
 */
export function redactValue(key: string, value: unknown): unknown {
  if (REDACT_KEYS.has(key.toLowerCase())) {
    return REDACTED;
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactValue('', item));
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactValue(k, v);
    }
    return out;
  }
  return value;
}

// Reassigns top-level string keys in place (preserves Winston's internal
// symbols) while replacing nested metadata with redacted copies.
const redactFormat = winston.format((info) => {
  for (const key of Object.keys(info)) {
    info[key] = redactValue(key, info[key]);
  }
  return info;
});

// Inject correlationId / userId from the active request context.
const contextFormat = winston.format((info) => {
  const ctx = getRequestContext();
  if (ctx) {
    info.correlationId = ctx.correlationId;
    if (ctx.userId !== undefined) {
      info.userId = ctx.userId;
    }
  }
  return info;
});

const developmentFormat = winston.format.combine(
  winston.format.colorize({ all: false }),
  winston.format.printf((info) => {
    const { timestamp, level, message, correlationId, ...rest } = info;
    const meta = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
    const cid = correlationId ? ` [${String(correlationId)}]` : '';
    return `${String(timestamp)} ${level}${cid}: ${String(message)}${meta}`;
  }),
);

// Winston's base Logger type only knows the npm levels, so augment it with our
// custom leveled methods (fatal/trace) for type-safe calls.
type CustomLevel = keyof typeof levels;
export type Logger = winston.Logger & Record<CustomLevel, winston.LeveledLogMethod>;

export const logger: Logger = winston.createLogger({
  levels,
  level: config.LOG_LEVEL,
  silent: isTest,
  defaultMeta: { service: 'todo-api', env: config.NODE_ENV },
  format: winston.format.combine(
    winston.format.timestamp(),
    contextFormat(),
    redactFormat(),
    isProduction ? winston.format.json() : developmentFormat,
  ),
  transports: [new winston.transports.Console()],
}) as Logger;
