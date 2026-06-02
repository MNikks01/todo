# Skill: React

## Best Practices

- Feature-based structure; features isolated, share via `shared/`.
- **Server state → React Query** (query keys, invalidation, optimistic updates, `staleTime`). **Client UI state → Zustand** (small, selective subscriptions).
- Small composable components; logic in custom hooks; presentational vs container separation.
- Type all props/returns; discriminated unions for variants. Co-locate component + test + styles.
- Accessibility first: semantic HTML, labels, roles, keyboard nav (WCAG 2.1 AA).
- Stable query keys; handle loading/error/empty explicitly; Suspense/error boundaries at route level.

## Checklist

- [ ] Server data only in React Query (not Zustand)
- [ ] Query keys structured + invalidated on mutation
- [ ] No business logic in components (hooks/utils)
- [ ] No cross-feature imports
- [ ] Loading/error/empty states handled
- [ ] Memoization only where measured
- [ ] a11y roles/labels; keyboard accessible
- [ ] Typed props, no `any`; tests added

## Anti-Patterns

- Duplicating server data into Zustand/global state.
- `useEffect` for data fetching instead of React Query.
- Prop drilling deep instead of composition/context/store.
- Giant components; logic inside JSX.
- Index keys for dynamic lists; effect chains causing render loops.
- Storing access tokens in localStorage.

## Examples

- **Query:** `useTodos(filters)` → `useQuery({ queryKey: ['todos', filters], queryFn })`.
- **Mutation:** `useToggleTodo` → optimistic update + `invalidateQueries(['todos'])` on settle, rollback on error.
- **Store:** Zustand `useFilterStore` selectors for status/priority/search only.
