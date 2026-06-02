import { Button } from '@/shared/components/Button';
import type { Todo } from '@/shared/types/todo';
import { useDeleteTodo, useToggleTodo } from '../api/hooks';

const priorityColor: Record<Todo['priority'], string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export function TodoItem({ todo }: { todo: Todo }) {
  const toggle = useToggleTodo();
  const remove = useDeleteTodo();

  return (
    <li className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
      <input
        type="checkbox"
        className="h-4 w-4"
        checked={todo.completed}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
        onChange={() => toggle.mutate({ id: todo.id, completed: !todo.completed })}
      />
      <span className={`flex-1 ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
        {todo.title}
      </span>
      <span className={`rounded px-2 py-0.5 text-xs font-medium ${priorityColor[todo.priority]}`}>
        {todo.priority}
      </span>
      <Button
        variant="danger"
        aria-label={`Delete "${todo.title}"`}
        onClick={() => remove.mutate(todo.id)}
        disabled={remove.isPending}
      >
        Delete
      </Button>
    </li>
  );
}
