/** Zod schemas for todo endpoints (rules/validation.md). */
import { z } from 'zod';
import { PRIORITIES } from '../domain/todo.js';

const title = z.string().trim().min(1).max(200);
const description = z.string().max(5000).nullable();
const priority = z.enum(PRIORITIES);
const dueDate = z.coerce.date().nullable();
const tags = z.array(z.string().trim().min(1).max(50)).max(20);

export const createTodoSchema = z
  .object({
    title,
    description: description.optional(),
    priority: priority.optional(),
    dueDate: dueDate.optional(),
    tags: tags.optional(),
  })
  .strict();

export const updateTodoSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    completed: z.boolean().optional(),
    priority: priority.optional(),
    dueDate: dueDate.optional(),
    tags: tags.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const listTodosQuerySchema = z
  .object({
    completed: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    priority: priority.optional(),
    tag: z.string().trim().min(1).max(50).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority']).default('createdAt'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    skip: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const todoIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid todo id'),
});

export type CreateTodoBody = z.infer<typeof createTodoSchema>;
export type UpdateTodoBody = z.infer<typeof updateTodoSchema>;
export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>;
