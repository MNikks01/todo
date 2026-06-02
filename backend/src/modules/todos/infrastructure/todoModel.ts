/**
 * Mongoose model for todos (docs/database.md §2.2, §3). Indexes are designed for
 * the owner-scoped list/filter/sort/search hot paths.
 */
import { type HydratedDocument, model, Schema } from 'mongoose';
import { PRIORITIES } from '../domain/todo.js';

export interface TodoDocument {
  userId: Schema.Types.ObjectId;
  title: string;
  description: string | null;
  completed: boolean;
  priority: string;
  dueDate: Date | null;
  tags: string[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<TodoDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null, maxlength: 5000 },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    dueDate: { type: Date, default: null },
    tags: { type: [String], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Primary list/filter/sort path (docs/database.md §3).
todoSchema.index({ userId: 1, completed: 1, dueDate: 1 });
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, tags: 1 });
// Full-text search on title/description.
todoSchema.index({ title: 'text', description: 'text' });

export type TodoHydrated = HydratedDocument<TodoDocument>;

export const TodoModel = model<TodoDocument>('Todo', todoSchema);
