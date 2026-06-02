import type { Priority } from '@/shared/types/todo';
import { useFilterStore } from '../store/filterStore';

const completedOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'false' },
  { label: 'Completed', value: 'true' },
] as const;

export function Filters() {
  const { completed, priority, search, setFilters } = useFilterStore();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Search</span>
        <input
          type="search"
          className="rounded border border-gray-300 px-3 py-2"
          placeholder="Search todos"
          value={search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Status</span>
        <select
          className="rounded border border-gray-300 px-3 py-2"
          value={completed === undefined ? 'all' : String(completed)}
          onChange={(e) =>
            setFilters({
              completed: e.target.value === 'all' ? undefined : e.target.value === 'true',
            })
          }
        >
          {completedOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Priority</span>
        <select
          className="rounded border border-gray-300 px-3 py-2"
          value={priority ?? 'all'}
          onChange={(e) =>
            setFilters({
              priority: e.target.value === 'all' ? undefined : (e.target.value as Priority),
            })
          }
        >
          <option value="all">All</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </label>
    </div>
  );
}
