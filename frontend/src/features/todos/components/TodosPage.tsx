import { Filters } from './Filters';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';

/** Todos feature page — pure todo concerns. App shell (header/auth) is in app/. */
export function TodosPage() {
  return (
    <>
      <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <TodoForm />
      </section>
      <section className="mb-4">
        <Filters />
      </section>
      <TodoList />
    </>
  );
}
