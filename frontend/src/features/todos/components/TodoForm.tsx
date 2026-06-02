import { type FormEvent, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { getErrorMessage } from '@/shared/api/errors';
import type { Priority } from '@/shared/types/todo';
import { useCreateTodo } from '../api/hooks';

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function TodoForm() {
  const create = useCreateTodo();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return;
    }
    create.mutate(
      { title: trimmed, priority },
      {
        onSuccess: () => {
          setTitle('');
          setPriority('medium');
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
      <div className="flex-1">
        <Field
          label="New todo"
          name="title"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <Field label="Priority" name="priority">
        <select
          id="priority"
          className="rounded border border-gray-300 px-3 py-2"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      <Button type="submit" disabled={create.isPending || title.trim().length === 0}>
        Add
      </Button>
      {create.isError ? (
        <p className="text-sm text-red-600" role="alert">
          {getErrorMessage(create.error, 'Could not add todo')}
        </p>
      ) : null}
    </form>
  );
}
