/** Augments Express Request with the authenticated user (set by auth middleware). */
import type { Role } from './roles.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
