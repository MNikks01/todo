import { getErrorMessage } from '@/shared/api/errors';
import { Spinner } from '@/shared/components/Spinner';
import { useFilterStore } from '../store/filterStore';
import { useTodos } from '../api/hooks';
import { TodoItem } from './TodoItem';

export function TodoList() {
  // Select primitives individually (avoids new-object snapshots) and rebuild the
  // filter object; React Query hashes the query key structurally.
  const completed = useFilterStore((s) => s.completed);
  const priority = useFilterStore((s) => s.priority);
  const search = useFilterStore((s) => s.search);
  const sortBy = useFilterStore((s) => s.sortBy);
  const sortDir = useFilterStore((s) => s.sortDir);
  const { data, isPending, isError, error } = useTodos({
    completed,
    priority,
    search,
    sortBy,
    sortDir,
  });

  if (isPending) {
    return <Spinner label="Loading todos" />;
  }
  if (isError) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {getErrorMessage(error, 'Could not load todos')}
      </p>
    );
  }
  if (data.todos.length === 0) {
    return (
      <p className="py-6 text-center text-gray-500">No todos yet. Add your first one above.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {data.todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
