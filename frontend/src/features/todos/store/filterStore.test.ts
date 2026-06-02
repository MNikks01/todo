import { beforeEach, describe, expect, it } from 'vitest';
import { useFilterStore } from './filterStore';

describe('filterStore', () => {
  beforeEach(() => useFilterStore.getState().reset());

  it('has sensible defaults', () => {
    const s = useFilterStore.getState();
    expect(s.sortBy).toBe('createdAt');
    expect(s.sortDir).toBe('desc');
    expect(s.completed).toBeUndefined();
  });

  it('patches filters and can clear them', () => {
    useFilterStore.getState().setFilters({ completed: true, priority: 'high' });
    expect(useFilterStore.getState().completed).toBe(true);
    expect(useFilterStore.getState().priority).toBe('high');

    useFilterStore.getState().setFilters({ completed: undefined });
    expect(useFilterStore.getState().completed).toBeUndefined();
  });

  it('reset restores defaults', () => {
    useFilterStore.getState().setFilters({ search: 'milk' });
    useFilterStore.getState().reset();
    expect(useFilterStore.getState().search).toBeUndefined();
  });
});
