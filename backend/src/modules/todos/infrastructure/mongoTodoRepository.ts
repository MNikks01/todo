/**
 * Mongoose implementation of TodoRepository. Every query is scoped by `userId`
 * and `deletedAt: null`; invalid ids resolve to "not found" rather than throwing
 * (ADR-0007, docs/security.md §3).
 */
import { type QueryFilter, type SortOrder, Types } from 'mongoose';
import type { Priority, Todo } from '../domain/todo.js';
import type {
  CreateTodoInput,
  TodoPage,
  TodoQuery,
  TodoRepository,
  UpdateTodoInput,
} from '../domain/todoRepository.js';
import { type TodoDocument, type TodoHydrated, TodoModel } from './todoModel.js';

function toDomain(doc: TodoHydrated): Todo {
  return {
    id: doc.id as string,
    userId: doc.userId.toString(),
    title: doc.title,
    description: doc.description,
    completed: doc.completed,
    priority: doc.priority as Priority,
    dueDate: doc.dueDate,
    tags: doc.tags,
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function isValidId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

export class MongoTodoRepository implements TodoRepository {
  async create(input: CreateTodoInput): Promise<Todo> {
    const doc = await TodoModel.create({
      userId: new Types.ObjectId(input.userId),
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate ?? null,
      tags: input.tags ?? [],
    });
    return toDomain(doc);
  }

  async findByIdForUser(id: string, userId: string): Promise<Todo | null> {
    if (!isValidId(id)) {
      return null;
    }
    const doc = await TodoModel.findOne({ _id: id, userId, deletedAt: null });
    return doc ? toDomain(doc) : null;
  }

  async query(query: TodoQuery): Promise<TodoPage> {
    const filter: QueryFilter<TodoDocument> = { userId: query.userId, deletedAt: null };
    if (query.completed !== undefined) filter.completed = query.completed;
    if (query.priority !== undefined) filter.priority = query.priority;
    if (query.tag !== undefined) filter.tags = query.tag;
    if (query.search !== undefined && query.search.length > 0) {
      filter.$text = { $search: query.search };
    }

    const sort: Record<string, SortOrder> = { [query.sortBy]: query.sortDir === 'asc' ? 1 : -1 };

    const [docs, total] = await Promise.all([
      TodoModel.find(filter).sort(sort).skip(query.skip).limit(query.limit),
      TodoModel.countDocuments(filter),
    ]);

    return { items: docs.map(toDomain), total };
  }

  async updateForUser(id: string, userId: string, changes: UpdateTodoInput): Promise<Todo | null> {
    if (!isValidId(id)) {
      return null;
    }
    const update: Partial<TodoDocument> = {};
    if (changes.title !== undefined) update.title = changes.title;
    if (changes.description !== undefined) update.description = changes.description;
    if (changes.completed !== undefined) update.completed = changes.completed;
    if (changes.priority !== undefined) update.priority = changes.priority;
    if (changes.dueDate !== undefined) update.dueDate = changes.dueDate;
    if (changes.tags !== undefined) update.tags = changes.tags;

    const doc = await TodoModel.findOneAndUpdate({ _id: id, userId, deletedAt: null }, update, {
      returnDocument: 'after',
    });
    return doc ? toDomain(doc) : null;
  }

  async softDeleteForUser(id: string, userId: string): Promise<boolean> {
    if (!isValidId(id)) {
      return false;
    }
    const result = await TodoModel.updateOne(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
    );
    return result.modifiedCount > 0;
  }

  async restoreForUser(id: string, userId: string): Promise<Todo | null> {
    if (!isValidId(id)) {
      return null;
    }
    const doc = await TodoModel.findOneAndUpdate(
      { _id: id, userId, deletedAt: { $ne: null } },
      { deletedAt: null },
      { returnDocument: 'after' },
    );
    return doc ? toDomain(doc) : null;
  }
}
