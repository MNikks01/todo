import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppLayout } from '@/app/components/AppLayout';
import { useAuthStore } from '@/app/store/authStore';
import { BASE, makeTodo, server, testUser } from '@/test/server';
import { renderWithProviders } from '@/test/utils';
import type { Todo } from '@/shared/types/todo';
import { TodosPage } from './TodosPage';

function authenticate() {
  useAuthStore.getState().setAuth('access-token', testUser);
}

describe('TodosPage', () => {
  beforeEach(() => authenticate());

  it('renders the current user (app shell) and existing todos', async () => {
    server.use(
      http.get(`${BASE}/todos`, () =>
        HttpResponse.json({
          todos: [makeTodo({ id: 't1', title: 'Buy milk' })],
          pagination: { total: 1, limit: 20, skip: 0 },
        }),
      ),
    );
    renderWithProviders(
      <AppLayout>
        <TodosPage />
      </AppLayout>,
    );

    expect(screen.getByText(testUser.email)).toBeInTheDocument();
    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
  });

  it('shows the empty state when there are no todos', async () => {
    renderWithProviders(<TodosPage />);
    expect(await screen.findByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('creates a todo and shows it after refetch', async () => {
    const todos: Todo[] = [];
    server.use(
      http.get(`${BASE}/todos`, () =>
        HttpResponse.json({ todos, pagination: { total: todos.length, limit: 20, skip: 0 } }),
      ),
      http.post(`${BASE}/todos`, async ({ request }) => {
        const body = (await request.json()) as { title: string };
        const todo = makeTodo({ id: 'new', title: body.title });
        todos.push(todo);
        return HttpResponse.json({ todo }, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<TodosPage />);
    await screen.findByText(/no todos yet/i);

    await user.type(screen.getByLabelText(/new todo/i), 'Walk dog');
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(await screen.findByText('Walk dog')).toBeInTheDocument();
  });

  it('optimistically toggles completion', async () => {
    let completed = false;
    server.use(
      http.get(`${BASE}/todos`, () =>
        HttpResponse.json({
          todos: [makeTodo({ id: 't1', title: 'Task', completed })],
          pagination: { total: 1, limit: 20, skip: 0 },
        }),
      ),
      http.patch(`${BASE}/todos/t1`, async ({ request }) => {
        const body = (await request.json()) as { completed?: boolean };
        if (typeof body.completed === 'boolean') {
          completed = body.completed;
        }
        return HttpResponse.json({ todo: makeTodo({ id: 't1', title: 'Task', completed }) });
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<TodosPage />);
    await screen.findByText('Task');

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    // Optimistic flip, then confirmed by the refetch (node may be re-rendered).
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeChecked());
  });
});
