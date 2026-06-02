/** MSW server + default happy-path handlers (docs/testing.md §3). */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { AuthUser } from '@/shared/types/auth';
import type { Todo } from '@/shared/types/todo';

const BASE = 'http://localhost:3000/api/v1';

export const testUser: AuthUser = {
  id: 'u1',
  email: 'tester@example.com',
  role: 'user',
  status: 'active',
  createdAt: '2026-06-02T00:00:00.000Z',
  updatedAt: '2026-06-02T00:00:00.000Z',
};

export function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 't1',
    title: 'Sample',
    description: null,
    completed: false,
    priority: 'medium',
    dueDate: null,
    tags: [],
    createdAt: '2026-06-02T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
    ...overrides,
  };
}

export const handlers = [
  http.post(`${BASE}/auth/login`, async () =>
    HttpResponse.json({ user: testUser, accessToken: 'access-token' }),
  ),
  http.post(`${BASE}/auth/register`, async () =>
    HttpResponse.json({ user: testUser }, { status: 201 }),
  ),
  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }),
  ),
  http.post(`${BASE}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${BASE}/todos`, () =>
    HttpResponse.json({ todos: [], pagination: { total: 0, limit: 20, skip: 0 } }),
  ),
];

export const server = setupServer(...handlers);
export { BASE };
