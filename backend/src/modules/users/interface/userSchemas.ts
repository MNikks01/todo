/** Zod schemas for admin user endpoints. */
import { z } from 'zod';
import { ROLES } from '../../../core/types/roles.js';

export const listUsersQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    skip: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid user id'),
});

export const setRoleSchema = z.object({ role: z.enum(ROLES) }).strict();

export const setStatusSchema = z.object({ status: z.enum(['active', 'disabled']) }).strict();

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
