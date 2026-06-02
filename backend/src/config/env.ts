/**
 * Typed, validated application configuration (Singleton — architecture.md §16.1).
 *
 * Env is parsed and validated ONCE with Zod at module load. If anything is
 * missing or malformed the process throws immediately (fail fast) — the app
 * must never boot in a half-configured state (rules/validation.md, docs/security.md §5).
 *
 * In deployed environments the raw values originate from AWS Secrets Manager and
 * are injected into `process.env` before this module is imported.
 */
import { z } from 'zod';

const NODE_ENVS = ['development', 'qa', 'staging', 'production', 'test'] as const;
const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(NODE_ENVS).default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(3000),
    LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),

    MONGODB_URI: z.string().url().startsWith('mongodb'),

    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
    JWT_ACCESS_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),

    CORS_ORIGINS: z
      .string()
      .default('')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0),
      ),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  })
  .readonly();

export type AppConfig = z.infer<typeof EnvSchema>;

function loadConfig(): AppConfig {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    // Do not log raw env (may contain secrets). Report only field-level issues.
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return Object.freeze(parsed.data);
}

/** Frozen, validated config. Import this everywhere instead of touching process.env. */
export const config: AppConfig = loadConfig();

export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
