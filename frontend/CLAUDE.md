# frontend/CLAUDE.md — Frontend Operating Guide

Refines the root [CLAUDE.md](../CLAUDE.md) for the React app. **Feature-Based Architecture.**

## Purpose

A React + Vite + TS SPA consuming the Todo API: auth (login/register/refresh) and todo management (CRUD, filter, search, paginate).

## Architecture

- **Feature slices** under `src/features/*` (`auth`, `todos`). Each owns its `api/`, `components/`, `hooks/`, `store/`, `types/`, `routes.tsx`, `CLAUDE.md`.
- **`shared/`** = cross-feature reusable (design-system components, axios client, hooks, utils, types). **Features must not import each other** — only `shared/`.
- **`app/`** = composition: providers (QueryClient, theme, error boundary), router (+ `ProtectedRoute`), root store.

## State Management (the rule)

- **Server state → React Query only** (todos, current user). Cache, retries, invalidation, optimistic updates live here.
- **Client UI state → Zustand** (auth-UI flags, filters/sort, modals, theme). Keep it small.
- Never duplicate server data into Zustand.

## Data & Auth

- Axios instance in `shared/api` with interceptors: attach access token (from memory), on 401 attempt **silent refresh** (HttpOnly cookie), retry once, else redirect to login.
- **Access token in memory** (store), **refresh token in HttpOnly cookie**. Never localStorage.

## Coding Rules

- TS `strict`, **no `any`**. Props typed; discriminated unions for variants.
- Components are presentational; logic in hooks/utils. No business logic, no direct fetch in components.
- Tailwind for styling; shared primitives in `shared/components`. Accessible (roles/labels, WCAG 2.1 AA core flows).
- Error & loading states explicit (React Query states); no unhandled promise rejections.

## Dependencies

React, Vite, TypeScript, React Router, @tanstack/react-query, zustand, axios, tailwindcss. Tests: Vitest, React Testing Library, MSW. See `frontend/SKILLS.md`.

## Testing Requirements

- Unit (hooks/utils/store), Component (RTL), Integration (RTL + MSW for feature flows). a11y assertions on core flows. Coverage ≥ 80%.

## Definition of Done

Matches feature structure · typed, no `any` · server/client state split respected · loading/error handled · tests + a11y · docs updated.
