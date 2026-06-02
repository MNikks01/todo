# frontend/features/auth/CLAUDE.md

## Purpose

User authentication UI: register, login, logout, and silent token refresh. Gatekeeper for protected routes.

## Architecture

- `api/` — axios calls + React Query mutations (`useLogin`, `useRegister`, `useLogout`) and `useCurrentUser` query.
- `components/` — `LoginForm`, `RegisterForm` (presentational, validated with shared form utils).
- `hooks/` — `useAuth` (derives auth state from current-user query + store).
- `store/` — Zustand slice for **auth UI/session flags** + in-memory access token. **No refresh token in JS** (HttpOnly cookie).
- `routes.tsx` — `/login`, `/register`; exposes `ProtectedRoute` consumption.

## Responsibilities

- Submit credentials, handle success/error, store access token in memory, redirect.
- Trigger silent refresh on 401 (via shared axios interceptor) and surface session expiry.

## Dependencies

`shared/api` (axios+interceptors), React Query, Zustand, React Router. Backend `auth` module contract.

## Coding Rules

- Access token **in memory only**; never localStorage. Refresh handled by HttpOnly cookie + interceptor.
- On `/auth/refresh` and `/auth/logout`, the interceptor reads the non-HttpOnly `csrfToken` cookie and sends it as the **`X-CSRF-Token`** header (double-submit; see `docs/security.md` §8.1). Other API calls rely on the Bearer access token (CSRF-immune) — no CSRF header needed.
- Generic error messages (no user enumeration). Disable submit while pending. a11y labels on inputs.
- No business logic in components — logic in hooks.

## Testing Requirements

- Component tests (form validation, submit states), integration with MSW (login success/failure → redirect, refresh flow), a11y checks. 100% on auth-critical logic.
