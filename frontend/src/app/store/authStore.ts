/**
 * Auth client state (Zustand). Holds the access token IN MEMORY only — never
 * localStorage (docs/security.md §8). The refresh token lives in an HttpOnly
 * cookie the browser manages. Server data (the user) is mirrored here for quick
 * synchronous access to auth status; React Query remains the source of truth.
 */
import { create } from 'zustand';
import type { AuthUser } from '@/shared/types/auth';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}));
