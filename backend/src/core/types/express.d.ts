/** Augments Express Request with the authenticated user (set by auth middleware). */
import type { Role } from './roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
      // Validated query params. Express 5 makes `req.query` a read-only getter,
      // so the validate middleware stores the parsed/coerced query here instead.
      validatedQuery?: unknown;
    }
  }
}

export {};
