/**
 * Typed, validated frontend configuration.
 *
 * Only PUBLIC config (no secrets) lives here. Vite inlines `import.meta.env`
 * at build time; we validate it with Zod so a misconfigured build fails loudly
 * rather than producing a broken runtime (mirrors backend/src/config/env.ts).
 */
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid frontend environment configuration:\n${issues}`);
}

export const config = Object.freeze({
  apiBaseUrl: parsed.data.VITE_API_BASE_URL,
});

export type FrontendConfig = typeof config;
