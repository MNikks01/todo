import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './helpers.js';

let app: Express;
beforeAll(() => {
  app = buildApp();
});

let counter = 0;
async function loginAs(): Promise<string> {
  counter += 1;
  const creds = { email: `todouser${counter}@example.com`, password: 'password123' };
  await request(app).post('/api/v1/auth/register').send(creds).expect(201);
  const res = await request(app).post('/api/v1/auth/login').send(creds).expect(200);
  return res.body.accessToken as string;
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

describe('Todos CRUD (authenticated, owner-scoped)', () => {
  it('requires authentication', async () => {
    await request(app).get('/api/v1/todos').expect(401);
  });

  it('creates and returns a todo (no userId leaked)', async () => {
    const token = await loginAs();
    const res = await request(app)
      .post('/api/v1/todos')
      .set(auth(token))
      .send({ title: 'Buy milk', priority: 'high', tags: ['errand'] })
      .expect(201);
    expect(res.body.todo.title).toBe('Buy milk');
    expect(res.body.todo.priority).toBe('high');
    expect(res.body.todo).not.toHaveProperty('userId');
  });

  it('lists only the caller’s todos with pagination metadata', async () => {
    const token = await loginAs();
    await request(app).post('/api/v1/todos').set(auth(token)).send({ title: 'A' }).expect(201);
    await request(app).post('/api/v1/todos').set(auth(token)).send({ title: 'B' }).expect(201);
    const res = await request(app).get('/api/v1/todos').set(auth(token)).expect(200);
    expect(res.body.todos).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('gets, updates, and toggles completion', async () => {
    const token = await loginAs();
    const created = await request(app)
      .post('/api/v1/todos')
      .set(auth(token))
      .send({ title: 'Task' })
      .expect(201);
    const id = created.body.todo.id as string;

    await request(app).get(`/api/v1/todos/${id}`).set(auth(token)).expect(200);

    const updated = await request(app)
      .patch(`/api/v1/todos/${id}`)
      .set(auth(token))
      .send({ completed: true, title: 'Task done' })
      .expect(200);
    expect(updated.body.todo.completed).toBe(true);
    expect(updated.body.todo.title).toBe('Task done');
  });

  it('soft-deletes a todo (gone from list, restorable)', async () => {
    const token = await loginAs();
    const created = await request(app)
      .post('/api/v1/todos')
      .set(auth(token))
      .send({ title: 'Temp' })
      .expect(201);
    const id = created.body.todo.id as string;

    await request(app).delete(`/api/v1/todos/${id}`).set(auth(token)).expect(204);
    await request(app).get(`/api/v1/todos/${id}`).set(auth(token)).expect(404);
    const list = await request(app).get('/api/v1/todos').set(auth(token)).expect(200);
    expect(list.body.todos).toHaveLength(0);

    const restored = await request(app)
      .post(`/api/v1/todos/${id}/restore`)
      .set(auth(token))
      .expect(200);
    expect(restored.body.todo.id).toBe(id);
  });
});

describe('Todos ownership isolation (cross-user)', () => {
  it('does not let user B read, update, or delete user A’s todo (404)', async () => {
    const tokenA = await loginAs();
    const tokenB = await loginAs();
    const created = await request(app)
      .post('/api/v1/todos')
      .set(auth(tokenA))
      .send({ title: 'A private' })
      .expect(201);
    const id = created.body.todo.id as string;

    await request(app).get(`/api/v1/todos/${id}`).set(auth(tokenB)).expect(404);
    await request(app)
      .patch(`/api/v1/todos/${id}`)
      .set(auth(tokenB))
      .send({ title: 'hijacked' })
      .expect(404);
    await request(app).delete(`/api/v1/todos/${id}`).set(auth(tokenB)).expect(404);

    // A still owns an unchanged todo.
    const aGet = await request(app).get(`/api/v1/todos/${id}`).set(auth(tokenA)).expect(200);
    expect(aGet.body.todo.title).toBe('A private');
  });

  it('B’s list never includes A’s todos', async () => {
    const tokenA = await loginAs();
    const tokenB = await loginAs();
    await request(app).post('/api/v1/todos').set(auth(tokenA)).send({ title: 'A1' }).expect(201);
    const bList = await request(app).get('/api/v1/todos').set(auth(tokenB)).expect(200);
    expect(bList.body.todos).toHaveLength(0);
  });
});

describe('Todos filtering & validation', () => {
  it('filters by completed and priority', async () => {
    const token = await loginAs();
    await request(app)
      .post('/api/v1/todos')
      .set(auth(token))
      .send({ title: 'done', priority: 'low' })
      .expect(201)
      .then((r) =>
        request(app)
          .patch(`/api/v1/todos/${r.body.todo.id}`)
          .set(auth(token))
          .send({ completed: true }),
      );
    await request(app)
      .post('/api/v1/todos')
      .set(auth(token))
      .send({ title: 'pending', priority: 'high' })
      .expect(201);

    const completed = await request(app)
      .get('/api/v1/todos?completed=true')
      .set(auth(token))
      .expect(200);
    expect(completed.body.todos).toHaveLength(1);
    expect(completed.body.todos[0].completed).toBe(true);

    const high = await request(app).get('/api/v1/todos?priority=high').set(auth(token)).expect(200);
    expect(high.body.todos).toHaveLength(1);
    expect(high.body.todos[0].priority).toBe('high');
  });

  it('rejects an invalid create payload (400)', async () => {
    const token = await loginAs();
    await request(app).post('/api/v1/todos').set(auth(token)).send({ title: '' }).expect(400);
    await request(app)
      .post('/api/v1/todos')
      .set(auth(token))
      .send({ title: 'ok', priority: 'urgent' })
      .expect(400);
  });

  it('rejects an empty update (400)', async () => {
    const token = await loginAs();
    const created = await request(app)
      .post('/api/v1/todos')
      .set(auth(token))
      .send({ title: 'x' })
      .expect(201);
    await request(app)
      .patch(`/api/v1/todos/${created.body.todo.id}`)
      .set(auth(token))
      .send({})
      .expect(400);
  });

  it('returns 404 for a well-formed but unknown id and 400 for a malformed id', async () => {
    const token = await loginAs();
    await request(app).get('/api/v1/todos/0123456789abcdef01234567').set(auth(token)).expect(404);
    await request(app).get('/api/v1/todos/not-an-id').set(auth(token)).expect(400);
  });
});
